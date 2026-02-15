import {
  billingAccounts,
  billingEvents,
  domainEvents,
} from '@internal/database'

export interface TranslateBillingReceivedEventPort {
  translate(
    event: typeof billingEvents.$inferSelect
  ): Promise<typeof domainEvents.$inferInsert>
}

export interface EventsPublisherPort {
  publish(events: (typeof domainEvents.$inferInsert)[]): Promise<void>
}

export interface BackfillConnectedBillingAccountPort {
  createDomainEvents(
    account: typeof billingAccounts.$inferSelect
  ): Promise<(typeof domainEvents.$inferInsert)[]>
}
