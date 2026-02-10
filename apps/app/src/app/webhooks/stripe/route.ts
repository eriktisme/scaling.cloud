import { env } from '@/env'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createNodeLogger } from '@internal/logger'
import {
  billingAccounts,
  billingEvents,
  createConnection,
} from '@internal/database'
import { and, eq } from 'drizzle-orm'

const logger = createNodeLogger({
  service: 'app',
  context: 'stripe-webhook',
})

const connection = createConnection(env.DATABASE_URL)

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: NextRequest) {
  let stripeEvent: Stripe.Event | null = null

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get('Stripe-Signature') as string,
      env.STRIPE_SIGNING_SECRET
    )
  } catch (error) {
    logger.error('Failed to construct Stripe event', {
      error,
    })

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 400,
      }
    )
  }

  if (!stripeEvent) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 500,
      }
    )
  }

  if (!stripeEvent.account) {
    logger.error('Stripe event does not have an account ID', {
      eventId: stripeEvent.id,
    })

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 400,
      }
    )
  }

  /**
   * We allow multiple customers to connect to the same billing account,
   * so we need to find all accounts that match the provider account ID and provider.
   */
  const accounts = await connection
    .select()
    .from(billingAccounts)
    .where(
      /**
       * In the future also check for the status of the billing account to make sure it's active.
       */
      and(
        eq(billingAccounts.providerAccountId, stripeEvent.account),
        eq(billingAccounts.provider, 'stripe')
      )
    )

  if (accounts.length === 0) {
    logger.error('No billing account found for Stripe event', {
      eventId: stripeEvent.id,
      accountId: stripeEvent.account,
    })

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 404,
      }
    )
  }

  const events: (typeof billingEvents.$inferInsert)[] = accounts.map(
    (account) => ({
      orgId: account.orgId,
      provider: 'stripe',
      providerEventId: stripeEvent.id,
      providerAccountId: account.providerAccountId,
      billingAccountId: account.id,
      payload: JSON.stringify(stripeEvent),
    })
  )

  await connection
    .insert(billingEvents)
    .values(events)
    .returning()
    .onConflictDoNothing()

  /**
   * Push the event to a queue for processing.
   */

  return NextResponse.json(
    {
      ok: true,
    },
    {
      status: 200,
    }
  )
}
