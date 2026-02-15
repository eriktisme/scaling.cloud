import { SQSEvent } from 'aws-lambda'
import { IntegrationConnectedEvent } from '@internal/events-schema'
import {
  billingAccounts,
  createConnection,
  domainEvents,
} from '@internal/database'
import { createNodeLogger } from '@internal/logger'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { BackfillConnectedBillingAccount, EventsPublisher } from '../../core'
import {
  EventBridgeEventsPublisherAdapter,
  StripeBackfillConnectedBillingAccount,
} from '../../adapters'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
  eventBusName: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
  eventBusName: process.env.EVENT_BUS_NAME,
})

const logger = createNodeLogger({
  service: 'event-processor',
  context: 'integration-connected-backfill-processor',
})

const connection = createConnection(config.databaseUrl)

const eventsPublisher = new EventsPublisher(
  new EventBridgeEventsPublisherAdapter({
    eventBusName: config.eventBusName,
  })
)

export async function buildHandler(event: SQSEvent) {
  /**
   * We are processing 1 event per lambda invocation,
   * no need to worry about fetching all billing accounts at once.
   */
  for (const record of event.Records) {
    const { data, metadata } = IntegrationConnectedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    const [billingAccount] = await connection
      .select()
      .from(billingAccounts)
      .where(
        and(
          eq(billingAccounts.provider, data.provider),
          eq(billingAccounts.orgId, metadata.orgId)
        )
      )

    if (!billingAccount) {
      logger.warn('Billing account not found in database, skipping.', {
        provider: data.provider,
        orgId: metadata.orgId,
      })

      return
    }

    const backfill = new BackfillConnectedBillingAccount()

    if (billingAccount.provider === 'stripe') {
      backfill.setAdapter(new StripeBackfillConnectedBillingAccount())
    }

    const domainEventsToInsert = await backfill.pull(billingAccount)

    if (domainEventsToInsert.length === 0) {
      logger.warn('No domain events to backfill for billing account.', {
        billingAccountId: billingAccount.id,
      })

      return
    }

    await connection
      .insert(domainEvents)
      .values(domainEventsToInsert)
      .returning()

    await eventsPublisher.publish(domainEventsToInsert)
  }
}
