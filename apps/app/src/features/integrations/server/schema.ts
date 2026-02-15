import { z } from '@hono/zod-openapi'

export const IntegrationParamsSchema = z.object({
  integration: z.union([z.literal('stripe')]).openapi({
    example: 'stripe',
    description: 'The name of the integration.',
  }),
})

export const CreateIntegrationBodySchema = z.object({
  code: z.string().min(1),
})

export type CreateIntegrationBody = z.infer<typeof CreateIntegrationBodySchema>

export const Integration = z
  .object({
    id: z.string().openapi({
      example: '9293961c-df93-4d6d-a2cc-fc3e353b2d10',
      description: 'A UUID to identify the integration.',
    }),
    name: z.string().openapi({
      example: 'stripe',
      description: 'The name of the integration.',
    }),
    created_at: z.string().openapi({
      example: '2024-09-04T20:45:09Z',
      description: 'When the integration was created.',
    }),
  })
  .openapi('Integration')

export type Integration = z.infer<typeof Integration>

export const IntegrationResponseSchema = z
  .object({
    data: Integration,
  })
  .openapi('IntegrationResponse')

export const IntegrationsResponseSchema = z
  .object({
    data: z.array(Integration),
  })
  .openapi('IntegrationsResponse')

export type IntegrationsResponse = z.infer<typeof IntegrationsResponseSchema>

export const AuthorizeBodySchema = z.object({
  source: z
    .string()
    .min(1)
    .openapi({
      description:
        'The source from where the authorization is being initiated.',
      examples: ['dashboard'],
    }),
})

export type AuthorizeBody = z.infer<typeof AuthorizeBodySchema>

export const AuthorizeUrlResponseSchema = z.object({
  url: z.url().openapi({
    description: 'The URL to redirect the user to for authorization.',
  }),
})

export type AuthorizeUrlResponse = z.infer<typeof AuthorizeUrlResponseSchema>
