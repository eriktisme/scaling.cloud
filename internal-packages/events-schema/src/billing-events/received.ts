import type { EventBridgeEvent } from 'aws-lambda'
import z from 'zod'

export const BillingEventReceivedEventDetailMetadataSchema = z.object({
  //
})

export type BillingEventReceivedEventDetailMetadata = z.infer<
  typeof BillingEventReceivedEventDetailMetadataSchema
>

export const BillingEventReceivedEventDetailDataSchema = z.object({
  id: z.string(),
  provider: z.string(),
})

export type BillingEventReceivedEventDetailData = z.infer<
  typeof BillingEventReceivedEventDetailDataSchema
>

export interface BillingEventReceivedEventDetail {
  data: BillingEventReceivedEventDetailData
  metadata: BillingEventReceivedEventDetailMetadata
}

export class BillingEventReceivedEvent {
  static eventName = 'billing-event.received'

  static toEventBridgeEventDetail = (
    data: BillingEventReceivedEventDetail['data']
  ): EventBridgeEvent<
    'billing-event.received',
    BillingEventReceivedEventDetail
  >['detail'] => {
    return {
      data,
      metadata: {
        //
      },
    }
  }

  static fromEventBridgeEvent = (
    event: EventBridgeEvent<
      'billing-event.received',
      BillingEventReceivedEventDetail
    >
  ): BillingEventReceivedEventDetail => {
    return event.detail
  }
}
