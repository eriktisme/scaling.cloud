import { EventsPublisherPort } from '../core'
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge'

const eventBridgeClient = new EventBridgeClient()

interface Options {
  eventBusName: string
}

export class EventBridgeEventsPublisherAdapter implements EventsPublisherPort {
  constructor(protected readonly options: Options) {
    //
  }

  async publish(
    events: Parameters<EventsPublisherPort['publish']>[0]
  ): ReturnType<EventsPublisherPort['publish']> {
    /**
     * The maximum number of entries in a single PutEvents request is 10.
     */
    const batches = this.createBatches(events, 10)

    for (const batch of batches) {
      /**
       * Eventually, I want to add support for retrying failed events, but for now, I'll just ignore them.
       */
      await eventBridgeClient.send(
        new PutEventsCommand({
          Entries: batch.map((event) => ({
            Detail: JSON.stringify(event.payload),
            DetailType: event.type,
            EventBusName: this.options.eventBusName,
            Source: 'event-processor',
            Time: new Date(),
          })),
        })
      )
    }
  }

  protected createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)

      batches.push(batch)
    }

    return batches
  }
}
