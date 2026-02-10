import { env } from '@/env'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createNodeLogger } from '@internal/logger'
import { billingAccounts, createConnection } from '@internal/database'
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
   * Check if the billing account is "active" in the future.
   */
  const [billingAccount] = await connection
    .select()
    .from(billingAccounts)
    .where(
      and(
        eq(billingAccounts.providerAccountId, stripeEvent.account),
        eq(billingAccounts.provider, 'stripe')
      )
    )

  if (!billingAccount) {
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

  /**
   * Do something with the event here.
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
