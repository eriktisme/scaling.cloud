import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

export const createConnection = (databaseUrl: string) =>
  drizzle({ client: neon(databaseUrl), schema })
