import { LogFormatter } from './formatter'
import { LogItem } from '../item'
import type { LogAttributes, LogLevel, UnformattedAttributes } from '../types'

type WebAttributes = Record<string, unknown>

type WebLoggerAttributes = UnformattedAttributes & WebAttributes

interface WebStandardAttributes {
  level: LogLevel
  message: string
  timestamp: string
  error?: Error
  traceId: string
}

export class WebLogFormatter extends LogFormatter {
  formatAttributes(
    attributes: WebLoggerAttributes,
    additionalAttributes: LogAttributes
  ): LogItem {
    const baseAttributes: WebStandardAttributes & LogAttributes = {
      level: attributes.logLevel,
      message: attributes.message,
      timestamp: new Date().toISOString(),
      traceId: '',
    }

    for (const key in additionalAttributes) {
      if (key in baseAttributes) {
        baseAttributes[key] = additionalAttributes[key]
      } else {
        baseAttributes[key] = additionalAttributes[key]
      }
    }

    return new LogItem({
      attributes: baseAttributes,
    })
  }
}
