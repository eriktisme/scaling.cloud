import { LogFormatter } from './formatter'
import { LogItem } from '../item'
import type { LogAttributes, LogLevel, UnformattedAttributes } from '../types'

interface NodeAttributes {
  traceId?: string
}

type NodeLoggerAttributes = UnformattedAttributes & NodeAttributes

interface NodeStandardAttributes {
  level: LogLevel
  message: string
  timestamp: string
  error?: Error
  traceId: string
}

export class NodeLogFormatter extends LogFormatter {
  formatAttributes(
    attributes: NodeLoggerAttributes,
    additionalAttributes: LogAttributes
  ): LogItem {
    const baseAttributes: NodeStandardAttributes & LogAttributes = {
      level: attributes.logLevel,
      message: attributes.message,
      timestamp: new Date().toISOString(),
      traceId: attributes.traceId || '',
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
