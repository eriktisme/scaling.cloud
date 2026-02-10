import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'
import { env } from '@/env'

export const createConnection = () =>
  drizzle({ client: neon(env.DATABASE_URL), schema })
