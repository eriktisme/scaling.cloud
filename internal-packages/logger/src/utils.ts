import { v4 } from 'uuid'

import type { LogFormatter } from './formatters'
import {
  NodeLogFormatter,
  WebLogFormatter,
} from './formatters'
import type { LoggerOptions } from './logger'
import { Logger } from './logger'

export const createWebLogger = (
  options: Omit<LoggerOptions, 'formatter'> & {
    formatter?: LogFormatter
  }
) => {
  const logger = new Logger({
    ...options,
    formatter: options?.formatter ?? new WebLogFormatter(),
  })

  logger.addContext({
    traceId: v4(),
    correlationId: '',
  })

  return logger
}

export const createNodeLogger = (
  options: Omit<LoggerOptions, 'formatter'> & {
    formatter?: LogFormatter
  }
) => {
  return new Logger({
    ...options,
    formatter: options?.formatter ?? new NodeLogFormatter(),
  })
}
