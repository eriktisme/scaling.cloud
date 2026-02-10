import { pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core'
import { organizations } from '@/lib/database'

export const billingAccounts = pgTable(
  'billing_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: varchar('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    provider: varchar('provider').$type<'stripe'>().notNull(),
    providerAccountId: varchar('provider_account_id').notNull(),
    /**
     * The status of the billing account is currently only 'connected',
     * but we may want to add more statuses in the future, such as 'disconnected' or 'paused'.
     */
    status: varchar('status').$type<'connected'>().notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    /**
     * We allow multiple billing accounts per organization, of the same provider, but not with the same provider account ID.
     * This allows for multiple Stripe accounts to be connected, for example, but prevents duplicate connections to the same Stripe account.
     */
    unique().on(t.orgId, t.provider, t.providerAccountId),
  ]
)
