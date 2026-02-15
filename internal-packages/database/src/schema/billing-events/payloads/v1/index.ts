import { z } from 'zod'

const BasePayload = z.object({
  metadata: z.record(z.string(), z.unknown()),
})

export const CustomerCreatedPayload = BasePayload.extend({
  customerId: z.string(),
  email: z.email().nullable(),
  name: z.string().nullable(),
})

export type CustomerCreatedPayload = z.infer<typeof CustomerCreatedPayload>

export const ProductCreatedPayload = BasePayload.extend({
  productId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export type ProductCreatedPayload = z.infer<typeof ProductCreatedPayload>

export const PriceCreatedPayload = BasePayload.extend({
  priceId: z.string(),
  productId: z.string(),
  amount: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  interval: z.string(),
})

export type PriceCreatedPayload = z.infer<typeof PriceCreatedPayload>

export const SubscriptionCreatedPayload = BasePayload.extend({
  subscriptionId: z.string(),
  customerId: z.string(),
  currentPeriodStartedAt: z.iso.datetime(),
  currentPeriodEndsAt: z.iso.datetime().nullable(),
  priceId: z.string(),
  productId: z.string(),
  amount: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  interval: z.string(),
  quantity: z.number(),
  trialEndsAt: z.iso.datetime().nullable(),
  trialStartsAt: z.iso.datetime().nullable(),
})

export type SubscriptionCreatedPayload = z.infer<
  typeof SubscriptionCreatedPayload
>

export const SubscriptionCancelledPayload = BasePayload.extend({
  subscriptionId: z.string(),
  customerId: z.string(),
  cancelledAt: z.iso.datetime(),
  effectiveAt: z.iso.datetime(),
})

export type SubscriptionCancelledPayload = z.infer<
  typeof SubscriptionCancelledPayload
>

export const InvoicePaidPayload = BasePayload.extend({
  amount: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  customerId: z.string(),
  invoiceId: z.string(),
  dueAt: z.iso.datetime().nullable(),
  paidAt: z.iso.datetime(),
})

export type InvoicePaidPayload = z.infer<typeof InvoicePaidPayload>

export const BillingEventsPayload = z.union([
  CustomerCreatedPayload,
  ProductCreatedPayload,
  PriceCreatedPayload,
  SubscriptionCreatedPayload,
  SubscriptionCancelledPayload,
  InvoicePaidPayload,
])

export type BillingEventsPayload = z.infer<typeof BillingEventsPayload>
