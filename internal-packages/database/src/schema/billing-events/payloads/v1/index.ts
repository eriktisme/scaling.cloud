import { z } from 'zod'

export const SubscriptionCreatedPayload = z.object({
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

export const SubscriptionCancelledPayload = z.object({
  subscriptionId: z.string(),
  customerId: z.string(),
  cancelledAt: z.iso.datetime(),
  effectiveAt: z.iso.datetime(),
})

export type SubscriptionCancelledPayload = z.infer<
  typeof SubscriptionCancelledPayload
>

export const InvoicePaidPayload = z.object({
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
  SubscriptionCreatedPayload,
  SubscriptionCancelledPayload,
  InvoicePaidPayload,
])

export type BillingEventsPayload = z.infer<typeof BillingEventsPayload>
