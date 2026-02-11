import { SQSEvent } from 'aws-lambda'
import { createNodeLogger } from '@internal/logger'
import { BillingEventReceivedEvent } from '@internal/events-schema'
import {
  billingEvents,
  createConnection,
  domainEvents,
} from '@internal/database'
import { z } from 'zod'
import { TranslateBillingReceivedEvent } from '../../core'
import { StripeTranslateBillingReceivedEventAdapter } from '../../adapters'
import { inArray } from 'drizzle-orm'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

const logger = createNodeLogger({
  service: 'event-processor',
  context: 'billing-events-received-processor',
})

const connection = createConnection(config.databaseUrl)

export async function buildHandler(event: SQSEvent) {
  const domainEventsToInsert: (typeof domainEvents.$inferInsert)[] = []

  const events = await connection
    .select()
    .from(billingEvents)
    .where(
      inArray(
        billingEvents.id,
        event.Records.map((record) => {
          const { data } = BillingEventReceivedEvent.fromEventBridgeEvent(
            JSON.parse(record.body)
          )

          return data.id
        })
      )
    )

  for (const record of event.Records) {
    const { data } = BillingEventReceivedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    const existingEvent = events.find((event) => event.id === data.id)

    if (!existingEvent) {
      logger.warn(
        'Billing event received but not found in database, skipping.',
        {
          eventId: data.id,
        }
      )

      continue
    }

    const translator = new TranslateBillingReceivedEvent()

    if (data.provider === 'stripe') {
      translator.setAdapter(new StripeTranslateBillingReceivedEventAdapter())
    }

    try {
      domainEventsToInsert.push(await translator.translate(existingEvent))
    } catch {
      /**
       * Currently we just ignore the error because,
       * it indicates we do not support this event type yet,
       * and we don't want to retry it until we do.
       */
    }
  }

  if (domainEventsToInsert.length === 0) {
    logger.info('No domain events to insert, skipping database operation.')

    return
  }

  await connection.insert(domainEvents).values(domainEventsToInsert)
}
