import { TranslateBillingReceivedEventPort } from './types'
import { billingEvents, domainEvents } from '@internal/database'

export class TranslateBillingReceivedEvent {
  protected adapter: TranslateBillingReceivedEventPort

  async translate(
    event: typeof billingEvents.$inferSelect
  ): Promise<typeof domainEvents.$inferInsert> {
    return this.adapter.translate(event)
  }

  setAdapter(adapter: TranslateBillingReceivedEventPort) {
    this.adapter = adapter
  }
}
