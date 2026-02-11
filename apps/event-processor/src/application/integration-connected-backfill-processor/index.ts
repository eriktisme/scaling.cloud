import { buildHandler } from './handler'
import middy from '@middy/core'

export const handler = middy(buildHandler)
