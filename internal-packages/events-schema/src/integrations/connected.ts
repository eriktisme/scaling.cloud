import type { EventBridgeEvent } from 'aws-lambda'
import z from 'zod'

export const IntegrationConnectedEventDetailMetadataSchema = z.object({
  orgId: z.string(),
})

export type IntegrationConnectedEventDetailMetadata = z.infer<
  typeof IntegrationConnectedEventDetailMetadataSchema
>

export const IntegrationConnectedEventDetailDataSchema = z.object({
  id: z.string(),
  provider: z.union([z.literal('stripe')]),
})

export type IntegrationConnectedEventDetailData = z.infer<
  typeof IntegrationConnectedEventDetailDataSchema
>

export interface IntegrationConnectedEventDetail {
  data: IntegrationConnectedEventDetailData
  metadata: IntegrationConnectedEventDetailMetadata
}

export class IntegrationConnectedEvent {
  static eventName = 'integration.connected'

  static toEventBridgeEventDetail = (
    data: IntegrationConnectedEventDetail['data'],
    metadata: IntegrationConnectedEventDetail['metadata']
  ): EventBridgeEvent<
    'integration.connected',
    IntegrationConnectedEventDetail
  >['detail'] => {
    return {
      data,
      metadata,
    }
  }

  static fromEventBridgeEvent = (
    event: EventBridgeEvent<
      'integration.connected',
      IntegrationConnectedEventDetail
    >
  ): IntegrationConnectedEventDetail => {
    return event.detail
  }
}
