import type {
  OrganizationJSON,
  OrganizationMembershipJSON,
  WebhookEvent,
} from '@clerk/backend'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Webhook } from 'svix'

import { env } from '@/env'
import { createConnection, organizations, users } from '@/lib/database'

const connection = createConnection()

async function handleOrganizationCreated(data: OrganizationJSON) {
  await connection
    .insert(organizations)
    .values({
      id: data.id,
    })
    .returning()
    .onConflictDoNothing()

  return 'Organization created'
}

async function handleOrganizationMembershipCreated(
  data: OrganizationMembershipJSON
) {
  await connection
    .insert(users)
    .values({
      id: data.public_user_data.user_id,
      orgId: data.organization.id,
    })
    .onConflictDoNothing()
    .returning()

  return 'Organization Membership Created'
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  const payload: Record<string, unknown> = await request.json()
  const body = JSON.stringify(payload)

  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET)

  let event: WebhookEvent | undefined

  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Error verifying request', {
      status: 400,
    })
  }

  const eventType = event.type

  let response: string = ''

  switch (eventType) {
    case 'organization.created': {
      response = await handleOrganizationCreated(event.data)

      break
    }
    case 'organizationMembership.created': {
      response = await handleOrganizationMembershipCreated(event.data)

      break
    }
    default: {
      break
    }
  }

  return new Response(response, {
    status: 200,
  })
}
