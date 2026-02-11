import {
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { billingAccounts } from './providers'

export const billingEvents = pgTable(
  'billing_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: varchar('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    provider: varchar('provider').$type<'stripe'>().notNull(),
    providerEventId: varchar('provider_event_id').notNull(),
    providerAccountId: varchar('provider_account_id').notNull(),
    billingAccountId: uuid('billing_account_id')
      .references(() => billingAccounts.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type').notNull(),
    payload: jsonb('payload').notNull(),
    receivedAt: timestamp('received_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    processedAt: timestamp('processed_at', {
      withTimezone: true,
    }),
  },
  (t) => [
    unique().on(t.orgId, t.provider, t.providerEventId, t.providerAccountId),
  ]
)

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
    type: varchar('type').notNull(),
    payload: jsonb('payload').notNull(),
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
