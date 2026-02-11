import { TranslateBillingReceivedEventPort } from './types'

export class TranslateBillingReceivedEvent {
  protected adapter: TranslateBillingReceivedEventPort

  async translate(
    event: Parameters<TranslateBillingReceivedEventPort['translate']>[0]
  ): ReturnType<TranslateBillingReceivedEventPort['translate']> {
    return this.adapter.translate(event)
  }

  setAdapter(adapter: TranslateBillingReceivedEventPort) {
    this.adapter = adapter
  }
}
