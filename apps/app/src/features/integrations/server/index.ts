import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import {
  AuthorizeBodySchema,
  AuthorizeUrlResponseSchema,
  CreateIntegrationBodySchema,
  Integration,
  IntegrationParamsSchema,
  IntegrationResponseSchema,
  IntegrationsResponseSchema,
} from './schema'
import {
  BadRequestErrorSchema,
  InvalidServerErrorSchema,
  NotAuthorizedErrorSchema,
} from '@/server/schema'
import { env } from '@/env'
import { auth } from '@clerk/nextjs/server'
import { billingAccounts, createConnection } from '@internal/database'
import { eq } from 'drizzle-orm'
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge'
import { IntegrationConnectedEvent } from '@internal/events-schema'

const connection = createConnection(env.DATABASE_URL)

export const app = new OpenAPIHono()

const eventBridgeClient = new EventBridgeClient()

const list = createRoute({
  method: 'get',
  path: '/integrations',
  summary: 'Lists Integrations',
  description: 'Lists all Integrations for the Organization.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: IntegrationsResponseSchema,
        },
      },
      description: 'Success',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    500: {
      content: {
        'application/json': {
          schema: InvalidServerErrorSchema,
        },
      },
      description: 'Invalid Server',
    },
  },
})

const post = createRoute({
  method: 'post',
  path: '/integrations/{integration}',
  summary: 'Creates an Integration',
  description: 'Creates a single Integration.',
  request: {
    params: IntegrationParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: CreateIntegrationBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: IntegrationResponseSchema,
        },
      },
      description: 'Success',
    },
    400: {
      content: {
        'application/json': {
          schema: BadRequestErrorSchema,
        },
      },
      description: 'Bad Request',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    500: {
      content: {
        'application/json': {
          schema: InvalidServerErrorSchema,
        },
      },
      description: 'Invalid Server',
    },
  },
})

const authorize = createRoute({
  method: 'post',
  path: '/integrations/{integration}/authorize-url',
  summary: 'Creates an Integration Authorization URL',
  description: 'Creates a single Integration Authorization URL.',
  request: {
    params: IntegrationParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: AuthorizeBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AuthorizeUrlResponseSchema,
        },
      },
      description: 'Success',
    },
    400: {
      content: {
        'application/json': {
          schema: BadRequestErrorSchema,
        },
      },
      description: 'Invalid Request',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    500: {
      content: {
        'application/json': {
          schema: InvalidServerErrorSchema,
        },
      },
      description: 'Invalid Server',
    },
  },
})

app.openapi(list, async (c) => {
  const { userId, orgId } = await auth()

  if (!orgId || !userId) {
    return c.json(
      {
        code: 'not_authorized',
        type: 'not_authorized_error',
        statusCode: 401,
        requestId: '',
      },
      401
    )
  }

  const integrations = await connection
    .select()
    .from(billingAccounts)
    .where(eq(billingAccounts.orgId, orgId))

  const response = IntegrationsResponseSchema.safeParse({
    data: integrations.map((integration) => ({
      id: integration.id,
      name: integration.provider,
      created_at:
        typeof integration.createdAt === 'string'
          ? integration.createdAt
          : integration.createdAt.toISOString(),
    })),
  })

  if (!response.success) {
    return c.json(
      {
        code: 'invalid_response',
        type: 'invalid_response_error',
        statusCode: 500,
        requestId: '',
      },
      {
        status: 500,
      }
    )
  }

  return c.json(response.data, {
    status: 200,
  })
})

app.openapi(post, async (c) => {
  const { userId, orgId } = await auth()

  if (!orgId || !userId) {
    return c.json(
      {
        code: 'not_authorized',
        type: 'not_authorized_error',
        statusCode: 401,
        requestId: '',
      },
      401
    )
  }

  const params = c.req.valid('param')
  const body = c.req.valid('json')

  const context = new GetAccessTokenContext()

  if (params.integration === 'stripe') {
    context.setStrategy(new StripeGetAccessTokenStrategy())
  }

  try {
    const result = await context.execute({
      code: body.code,
      userId,
      orgId,
    })

    if (!result.success) {
      return c.json(
        {
          statusCode: 400,
          code: 'could_not_get_token',
          type: 'invalid_request',
          requestId: '',
        },
        { status: 400 }
      )
    }

    await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(
              IntegrationConnectedEvent.toEventBridgeEventDetail(
                {
                  provider: params.integration,
                  id: result.integration.id,
                },
                {
                  orgId,
                }
              )
            ),
            DetailType: IntegrationConnectedEvent.eventName,
            Source: 'app',
            Time: new Date(),
          },
        ],
      })
    )

    const response = Integration.safeParse({
      id: result.integration.id,
      name: params.integration,
      created_at:
        typeof result.integration.createdAt === 'string'
          ? result.integration.createdAt
          : result.integration.createdAt.toISOString(),
    })

    if (!response.success) {
      return c.json(
        {
          code: 'invalid_response',
          type: 'invalid_response_error',
          statusCode: 500,
          requestId: '',
        },
        {
          status: 500,
        }
      )
    }

    return c.json(
      {
        data: response.data,
      },
      {
        status: 200,
      }
    )
  } catch {
    return c.json(
      {
        statusCode: 400,
        code: 'integration_not_supported',
        type: 'invalid_request',
        requestId: '',
      },
      { status: 400 }
    )
  }
})

app.openapi(authorize, async (c) => {
  const { userId, orgId } = await auth()

  if (!orgId || !userId) {
    return c.json(
      {
        code: 'not_authorized',
        type: 'not_authorized_error',
        statusCode: 401,
        requestId: '',
      },
      401
    )
  }

  const params = c.req.valid('param')
  const body = c.req.valid('json')

  const context = new AuthorizeUrlContext()

  if (params.integration === 'stripe') {
    context.setStrategy(new StripeAuthorizeUrlStrategy())
  }

  try {
    const url = context.execute(orgId, body.source)

    return c.json({ url }, { status: 200 })
  } catch {
    return c.json(
      {
        statusCode: 400,
        code: 'integration_not_supported',
        type: 'invalid_request',
        requestId: '',
      },
      { status: 400 }
    )
  }
})

interface GetAccessTokenSuccess {
  integration: {
    id: string
    createdAt: string | Date
  }
  success: true
}

interface GetAccessTokenFailure {
  success: false
  error?: string
}

interface GetAccessTokenStrategy {
  execute(
    params: GetAccessTokenParams
  ): Promise<GetAccessTokenSuccess | GetAccessTokenFailure>
}

interface GetAccessTokenParams {
  code: string
  userId: string
  orgId: string
}

interface StripeGetTokenResponse {
  access_token: string
  livemode: boolean
  refresh_token: string
  scope: 'stripe_apps'
  stripe_publishable_key: string
  stripe_user_id: string
  token_type: 'bearer'
}

class GetAccessTokenContext {
  protected strategy?: GetAccessTokenStrategy

  setStrategy(strategy: GetAccessTokenStrategy) {
    this.strategy = strategy
  }

  async execute(params: GetAccessTokenParams) {
    if (!this.strategy) {
      throw new Error('No strategy set')
    }

    return this.strategy.execute(params)
  }
}

class StripeGetAccessTokenStrategy implements GetAccessTokenStrategy {
  async execute(
    params: GetAccessTokenParams
  ): Promise<GetAccessTokenSuccess | GetAccessTokenFailure> {
    const body = new URLSearchParams({
      code: params.code,
      grant_type: 'authorization_code',
    })

    const url = new URL('https://api.stripe.com/v1/oauth/token')

    const request = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${env.STRIPE_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: body.toString(),
    })

    if (!request.ok) {
      console.log('Stripe token request failed', await request.json())

      return {
        success: false,
      }
    }

    /**
     * We want to store the refresh token in a secure storage,
     * but for now we will just return a successful response.
     */
    const response: StripeGetTokenResponse = await request.json()

    const [billingAccount] = await connection
      .insert(billingAccounts)
      .values({
        provider: 'stripe',
        providerAccountId: response.stripe_user_id,
        orgId: params.orgId,
        status: 'connected',
      })
      .returning()

    if (!billingAccount) {
      return {
        success: false,
        error: 'Could not create billing account',
      }
    }

    return {
      success: true,
      integration: {
        id: billingAccount.id,
        createdAt: billingAccount.createdAt,
      },
    }
  }
}

class StripeAuthorizeUrlStrategy implements AuthorizeUrlStrategy {
  execute(orgId: string, source: string): string {
    /**
     * This Link only works with external-tests.
     *
     * Once the application is published in the Stripe marketplace,
     * we need to change the URL to point to the production application.
     */
    const url = new URL(
      'https://marketplace.stripe.com/oauth/v2/chnlink_61U7rscHus22QlBy941Runmr8XBOd27M/authorize'
    )
    url.searchParams.append('client_id', env.STRIPE_CLIENT_ID)
    url.searchParams.append('redirect_uri', env.STRIPE_REDIRECT_URL)

    url.searchParams.append(
      'state',
      JSON.stringify({
        orgId,
        source,
      })
    )

    return url.href
  }
}

interface AuthorizeUrlStrategy {
  execute(orgId: string, source: string): string
}

class AuthorizeUrlContext {
  protected strategy?: AuthorizeUrlStrategy

  setStrategy(strategy: AuthorizeUrlStrategy) {
    this.strategy = strategy
  }

  execute(workspaceId: string, source: string): string {
    if (!this.strategy) {
      throw new Error('No strategy set')
    }

    return this.strategy.execute(workspaceId, source)
  }
}
