import { TranslateBillingReceivedEventPort } from '../core'
import Stripe from 'stripe'
import { z } from 'zod'

const ConfigSchema = z.object({
  secretKey: z.string().min(1),
})

const config = ConfigSchema.parse({
  secretKey: process.env.STRIPE_SECRET_KEY,
})

const stripe = new Stripe(config.secretKey, {
  apiVersion: '2025-12-15.clover',
})

export class StripeTranslateBillingReceivedEventAdapter implements TranslateBillingReceivedEventPort {
  async translate(
    event: Parameters<TranslateBillingReceivedEventPort['translate']>[0]
  ): ReturnType<TranslateBillingReceivedEventPort['translate']> {
    const stripeEvent = await stripe.events.retrieve(event.providerEventId)

    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        const subscription = stripeEvent.data.object
        /**
         * We currently only support one subscription item per subscription.
         */
        const subscriptionItem = subscription.items.data[0]

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'subscription.created',
          payload: {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            createdAt: new Date(stripeEvent.created * 1000),
            priceId: subscriptionItem.price.id,
            productId: subscriptionItem.price.product,
            amount: {
              amount: subscriptionItem.price.unit_amount ?? 0,
              currency: subscriptionItem.price.currency,
            },
            interval: subscriptionItem.price.recurring?.interval,
            quantity: subscriptionItem.quantity,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
            trialStartsAt: subscription.trial_start
              ? new Date(subscription.trial_start * 1000)
              : null,
          },
        }
      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object
        /**
         * We currently only support one subscription item per subscription.
         */
        const deletedSubscriptionItem = deletedSubscription.items.data[0]

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'subscription.canceled',
          payload: {
            subscriptionId: deletedSubscription.id,
            customerId: deletedSubscription.customer,
            canceledAt: deletedSubscription.canceled_at
              ? new Date(deletedSubscription.canceled_at * 1000)
              : null,
            effectiveAt: deletedSubscriptionItem.current_period_end
              ? new Date(deletedSubscriptionItem.current_period_end * 1000)
              : null,
          },
        }
      case 'invoice.paid':
        const invoice = stripeEvent.data.object

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'invoice.paid',
          payload: {
            invoiceId: invoice.id,
            customerId: invoice.customer,
            amount: {
              amount: invoice.amount_due,
              currency: invoice.currency,
            },
            paidAt: invoice.status_transitions.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : null,
          },
        }
      default:
        throw new Error(`Unsupported Stripe event type: ${stripeEvent.type}`)
    }
  }
}
