import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './migrations',
  schema: './src/lib/database/schema/index.ts',
  dialect: 'postgresql',

  dbCredentials: {
    url: String(process.env.DATABASE_URL),
  },

  extensionsFilters: ['postgis'],
  schemaFilter: 'public',
  tablesFilter: '*',

  introspect: {
    casing: 'camel',
  },

  breakpoints: true,
  strict: true,
  verbose: true,
})
