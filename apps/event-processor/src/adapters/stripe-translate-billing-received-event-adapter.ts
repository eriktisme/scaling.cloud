import { TranslateBillingReceivedEventPort } from '../core'
import Stripe from 'stripe'
import { z } from 'zod'
import {
  InvoicePaidPayload,
  SubscriptionCancelledPayload,
} from '@internal/database'

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

        if (!subscriptionItem.price.recurring || !subscriptionItem.quantity) {
          throw new Error(
            `Subscription ${subscription.id} has a subscription item ${subscriptionItem.id} with a non-recurring price, which is not supported`
          )
        }

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'subscription.created',
          version: '1.0',
          payload: {
            subscriptionId: subscription.id,

            /**
             * Because the default value is string,
             * unless we expand in the future
             * I'm fine just casting it here.
             */
            customerId: subscription.customer as string,
            currentPeriodStartedAt: new Date(
              stripeEvent.created * 1000
            ).toISOString(),
            currentPeriodEndsAt: subscriptionItem.current_period_end
              ? new Date(
                  subscriptionItem.current_period_end * 1000
                ).toISOString()
              : null,
            priceId: subscriptionItem.price.id,
            productId: subscriptionItem.price.product as string,
            amount: {
              amount: subscriptionItem.price.unit_amount ?? 0,
              currency: subscriptionItem.price.currency,
            },
            interval: subscriptionItem.price.recurring.interval,
            quantity: subscriptionItem.quantity,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            trialStartsAt: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            metadata: subscription.metadata ?? {},
          },
        }
      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object
        /**
         * We currently only support one subscription item per subscription.
         */
        const deletedSubscriptionItem = deletedSubscription.items.data[0]

        if (!deletedSubscription.canceled_at) {
          throw new Error(
            `Deleted subscription ${deletedSubscription.id} does not have a canceled_at timestamp`
          )
        }

        if (!deletedSubscriptionItem.current_period_end) {
          throw new Error(
            `Deleted subscription ${deletedSubscription.id} does not have a current_period_end timestamp on its subscription item`
          )
        }

        const cancelledSubscriptionPayload: SubscriptionCancelledPayload = {
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer as string,
          cancelledAt: new Date(
            deletedSubscription.canceled_at * 1000
          ).toISOString(),
          effectiveAt: new Date(
            deletedSubscriptionItem.current_period_end * 1000
          ).toISOString(),
          metadata: deletedSubscription.metadata ?? {},
        }

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'subscription.canceled',
          version: '1.0',
          payload: cancelledSubscriptionPayload,
        }
      case 'invoice.paid':
        const invoice = stripeEvent.data.object

        if (!invoice.status_transitions.paid_at) {
          throw new Error(
            `Invoice ${invoice.id} does not have a paid_at timestamp`
          )
        }

        if (!invoice.customer) {
          throw new Error(`Invoice ${invoice.id} does not have a customer ID`)
        }

        const invoicePaidPayload: InvoicePaidPayload = {
          invoiceId: invoice.id,
          /**
           * Because the default value is string,
           * unless we expand in the future
           * I'm fine just casting it here.
           */
          customerId: invoice.customer as string,
          amount: {
            amount: invoice.amount_due,
            currency: invoice.currency,
          },
          dueAt: invoice.due_date
            ? new Date(invoice.due_date * 1000).toISOString()
            : null,
          paidAt: new Date(
            invoice.status_transitions.paid_at * 1000
          ).toISOString(),
          metadata: invoice.metadata ?? {},
        }

        return {
          orgId: event.orgId,
          providerEventId: stripeEvent.id,
          providerAccountId: event.providerAccountId,
          billingAccountId: event.billingAccountId,
          type: 'invoice.paid',
          version: '1.0',
          payload: invoicePaidPayload,
        }
      default:
        throw new Error(`Unsupported Stripe event type: ${stripeEvent.type}`)
    }
  }
}
