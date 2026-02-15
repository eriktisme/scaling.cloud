import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { organizations } from '../organizations'
import { billingAccounts } from '../providers'
import { BillingEventsPayload } from './payloads'

export const domainEvents = pgTable(
  'domain_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: varchar('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    providerEventId: varchar('provider_event_id').notNull(),
    providerAccountId: varchar('provider_account_id').notNull(),
    billingAccountId: uuid('billing_account_id')
      .references(() => billingAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    version: varchar('version').notNull().default('1.0'),
    /**
     * I could consider using a discriminated union here,
     * but I think for a personal project it is fine to just use an open jsonb column
     * and enforce the structure at the application level.
     *
     * I just need to make sure I use the correct type and payload structure when inserting and processing events.
     */
    type: varchar('type').notNull(),
    payload: jsonb('payload').$type<BillingEventsPayload>().notNull(),
    receivedAt: timestamp('received_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    processedAt: timestamp('processed_at', {
      withTimezone: true,
    }),
  },
  (t) => [unique().on(t.orgId, t.providerEventId, t.providerAccountId)]
)
