import { BackfillConnectedBillingAccountPort } from './types'

export class BackfillConnectedBillingAccount {
  protected adapter: BackfillConnectedBillingAccountPort | null = null

  async pull(
    account: Parameters<
      BackfillConnectedBillingAccountPort['createDomainEvents']
    >[0]
  ): ReturnType<BackfillConnectedBillingAccountPort['createDomainEvents']> {
    if (!this.adapter) {
      throw new Error('Adapter not set')
    }

    return this.adapter.createDomainEvents(account)
  }

  setAdapter(adapter: BackfillConnectedBillingAccountPort) {
    this.adapter = adapter
  }
}
