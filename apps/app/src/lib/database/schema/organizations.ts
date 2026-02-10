import { pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core'

export const organizations = pgTable('organizations', {
  id: varchar('id').primaryKey(),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export const users = pgTable(
  'users',
  {
    id: varchar('id'),
    orgId: varchar('org_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id, t.orgId],
    }),
  ]
)
