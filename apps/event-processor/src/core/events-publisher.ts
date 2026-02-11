import { EventsPublisherPort } from './types'

export class EventsPublisher {
  constructor(protected readonly adapter: EventsPublisherPort) {
    //
  }

  async publish(
    events: Parameters<EventsPublisherPort['publish']>[0]
  ): ReturnType<EventsPublisherPort['publish']> {
    await this.adapter.publish(events)
  }
}
