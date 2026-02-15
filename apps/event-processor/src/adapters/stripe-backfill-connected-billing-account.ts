import { BackfillConnectedBillingAccountPort } from '../core'
import Stripe from 'stripe'
import { z } from 'zod'
import {
  CustomerCreatedPayload,
  domainEvents,
  InvoicePaidPayload,
  PriceCreatedPayload,
  ProductCreatedPayload,
  SubscriptionCancelledPayload,
  SubscriptionCreatedPayload,
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

export class StripeBackfillConnectedBillingAccount implements BackfillConnectedBillingAccountPort {
  async createDomainEvents(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): ReturnType<BackfillConnectedBillingAccountPort['createDomainEvents']> {
    const customers = await this.fetchCustomers(account)

    const customerCreatedDomainEvents =
      this.translateCustomerCreatedDomainEvents(customers, account)

    const products = await this.fetchProducts(account)

    const productsCreatedDomainEvents = this.translateProductsDomainEvents(
      products,
      account
    )

    const prices = await this.fetchPrices(account)

    const pricesCreatedDomainEvents = this.translatePricesDomainEvents(
      prices,
      account
    )

    const subscriptions = await this.fetchSubscriptions(account)

    const subscriptionsCreatedDomainEvents =
      this.translateSubscriptionsCreatedDomainEvents(subscriptions, account)

    const subscriptionsCancelledDomainEvents =
      this.translateSubscriptionsCancelledDomainEvents(subscriptions, account)

    const invoices = await this.fetchPaidInvoices(account)

    const invoicePaidDomainEvents = this.translateInvoicePaidDomainEvents(
      invoices,
      account
    )

    return [
      ...customerCreatedDomainEvents,
      ...productsCreatedDomainEvents,
      ...pricesCreatedDomainEvents,
      ...subscriptionsCreatedDomainEvents,
      ...subscriptionsCancelledDomainEvents,
      ...invoicePaidDomainEvents,
    ]
  }

  protected async fetchCustomers(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): Promise<Stripe.Customer[]> {
    const result: Stripe.Customer[] = []

    const paginator = stripe.customers.list(
      {
        limit: 100,
        /**
         * Ensure we only fetch customers created before the account was connected.
         */
        created: { lte: Math.floor(account.createdAt.getTime() / 1000) },
      },
      {
        stripeAccount: account.providerAccountId,
      }
    )

    for await (const customer of paginator) {
      result.push(customer)
    }

    return result
  }

  protected translateCustomerCreatedDomainEvents(
    customers: Stripe.Customer[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return customers.map((customer) => {
      const payload: CustomerCreatedPayload = {
        customerId: customer.id,
        email: customer.email ?? null,
        name: customer.name ?? null,
        metadata: customer.metadata ?? {},
      }

      return {
        orgId: account.orgId,
        providerEventId: `backfill-customer-created-${customer.id}`,
        providerAccountId: account.providerAccountId,
        billingAccountId: account.id,
        type: 'customer.created',
        version: '1.0',
        payload,
      }
    })
  }

  protected async fetchProducts(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): Promise<Stripe.Product[]> {
    const result: Stripe.Product[] = []

    const paginator = stripe.products.list(
      {
        limit: 100,
        /**
         * Ensure we only fetch products created before the account was connected.
         */
        created: { lte: Math.floor(account.createdAt.getTime() / 1000) },
      },
      {
        stripeAccount: account.providerAccountId,
      }
    )

    for await (const product of paginator) {
      result.push(product)
    }

    return result
  }

  protected translateProductsDomainEvents(
    products: Stripe.Product[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return products.map((product) => {
      const payload: ProductCreatedPayload = {
        productId: product.id,
        name: product.name,
        description: product.description ?? null,
        metadata: product.metadata ?? {},
      }

      return {
        orgId: account.orgId,
        providerEventId: `backfill-product-${product.id}`,
        providerAccountId: account.providerAccountId,
        billingAccountId: account.id,
        type: 'product.created',
        version: '1.0',
        payload,
      }
    })
  }

  protected async fetchPrices(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): Promise<Stripe.Price[]> {
    const result: Stripe.Price[] = []

    const paginator = stripe.prices.list(
      {
        limit: 100,
        /**
         * Ensure we only fetch prices created before the account was connected.
         */
        created: { lte: Math.floor(account.createdAt.getTime() / 1000) },
      },
      {
        stripeAccount: account.providerAccountId,
      }
    )

    for await (const price of paginator) {
      result.push(price)
    }

    return result
  }

  protected translatePricesDomainEvents(
    prices: Stripe.Price[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return prices
      .map((price) => {
        if (!price.recurring) {
          /**
           * We currently only support recurring prices,
           * as one-time prices don't have a billing cycle
           * and thus don't fit well with our current domain model.
           */
          return null
        }

        const payload: PriceCreatedPayload = {
          priceId: price.id,
          productId: price.product as string,
          amount: {
            currency: price.currency,
            amount: price.unit_amount ?? 0,
          },
          interval: price.recurring.interval,
          metadata: price.metadata ?? {},
        }

        return {
          orgId: account.orgId,
          providerEventId: `backfill-price-${price.id}`,
          providerAccountId: account.providerAccountId,
          billingAccountId: account.id,
          type: 'price.created',
          version: '1.0',
          payload,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }

  protected async fetchSubscriptions(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): Promise<Stripe.Subscription[]> {
    const result: Stripe.Subscription[] = []

    const paginator = stripe.subscriptions.list(
      {
        limit: 100,
        /**
         * Ensure we only fetch subscriptions created before the account was connected.
         */
        created: { lte: Math.floor(account.createdAt.getTime() / 1000) },
      },
      {
        stripeAccount: account.providerAccountId,
      }
    )

    for await (const subscription of paginator) {
      result.push(subscription)
    }

    return result
  }

  protected translateSubscriptionsCreatedDomainEvents(
    subscriptions: Stripe.Subscription[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return subscriptions
      .map((subscription) => {
        /**
         * We currently only support one subscription item per subscription.
         */
        const subscriptionItem = subscription.items.data[0]

        /**
         * We only support subscriptions with recurring prices,
         * as one-time prices don't have a billing cycle
         * and thus don't fit well with our current domain model.
         */
        if (!subscriptionItem.price.recurring || !subscriptionItem.quantity) {
          return null
        }

        const payload: SubscriptionCreatedPayload = {
          amount: {
            currency: subscriptionItem.price.currency,
            amount: subscriptionItem.price.unit_amount ?? 0,
          },
          currentPeriodEndsAt: new Date(
            subscriptionItem.current_period_end * 1000
          ).toISOString(),
          currentPeriodStartedAt: new Date(
            subscription.created * 1000
          ).toISOString(),
          customerId: subscription.customer as string,
          interval: subscriptionItem.price.recurring.interval,
          priceId: subscriptionItem.price.id,
          productId: subscriptionItem.price.product as string,
          quantity: subscriptionItem.quantity,
          subscriptionId: subscription.id,
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          trialStartsAt: subscription.trial_start
            ? new Date(subscription.trial_start * 1000).toISOString()
            : null,
          metadata: subscription.metadata ?? {},
        }

        return {
          orgId: account.orgId,
          providerEventId: `backfill-subscription-created-${subscription.id}`,
          providerAccountId: account.providerAccountId,
          billingAccountId: account.id,
          type: 'subscription.created',
          version: '1.0',
          payload,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }

  protected translateSubscriptionsCancelledDomainEvents(
    subscriptions: Stripe.Subscription[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return subscriptions
      .map((subscription) => {
        /**
         * We currently only support one subscription item per subscription.
         */
        const subscriptionItem = subscription.items.data[0]

        if (!subscription.canceled_at) {
          return null
        }

        const payload: SubscriptionCancelledPayload = {
          cancelledAt: new Date(subscription.canceled_at * 1000).toISOString(),
          customerId: subscription.customer as string,
          effectiveAt: subscriptionItem.current_period_end
            ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
            : new Date(subscription.canceled_at * 1000).toISOString(),
          subscriptionId: subscription.id,
          metadata: subscription.metadata ?? {},
        }

        return {
          orgId: account.orgId,
          providerEventId: `backfill-subscription-cancelled-${subscription.id}`,
          providerAccountId: account.providerAccountId,
          billingAccountId: account.id,
          type: 'subscription.cancelled',
          version: '1.0',
          payload,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }

  protected async fetchPaidInvoices(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): Promise<Stripe.Invoice[]> {
    const result: Stripe.Invoice[] = []

    const paginator = stripe.invoices.list(
      {
        limit: 100,
        /**
         * Ensure we only fetch invoices created before the account was connected.
         */
        created: { lte: Math.floor(account.createdAt.getTime() / 1000) },
        status: 'paid',
      },
      {
        stripeAccount: account.providerAccountId,
      }
    )

    for await (const invoice of paginator) {
      result.push(invoice)
    }

    return result
  }

  protected translateInvoicePaidDomainEvents(
    invoices: Stripe.Invoice[],
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): (typeof domainEvents.$inferInsert)[] {
    return invoices
      .map((invoice) => {
        if (!invoice.status_transitions.paid_at) {
          throw new Error(
            `Invoice ${invoice.id} is not paid, cannot create invoice.paid domain event.`
          )
        }

        const payload: InvoicePaidPayload = {
          amount: {
            currency: invoice.currency,
            amount: invoice.amount_paid,
          },
          customerId: invoice.customer as string,
          dueAt: invoice.due_date
            ? new Date(invoice.due_date * 1000).toISOString()
            : null,
          invoiceId: invoice.id,
          paidAt: new Date(
            invoice.status_transitions.paid_at * 1000
          ).toISOString(),
          metadata: invoice.metadata ?? {},
        }

        return {
          orgId: account.orgId,
          providerEventId: `backfill-subscription-cancelled-${invoice.id}`,
          providerAccountId: account.providerAccountId,
          billingAccountId: account.id,
          type: 'invoice.paid',
          version: '1.0',
          payload,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }
}
