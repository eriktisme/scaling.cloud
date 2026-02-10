import type { LogItem } from '../item'
import type { LogAttributes, UnformattedAttributes } from '../types'

export abstract class LogFormatter {
  abstract formatAttributes(
    attributes: UnformattedAttributes,
    additionalAttributes: LogAttributes
  ): LogItem

  formatError(error: Error): LogAttributes {
    const { name, message, stack, cause, ...errorAttributes } = error

    const formattedError: LogAttributes = {
      name,
      location: this.getCodeLocation(error.stack),
      message,
      stack: typeof stack === 'string' ? stack?.split('\n') : stack,
      cause: cause instanceof Error ? this.formatError(cause) : cause,
    }

    for (const key in error) {
      if (!['name', 'message', 'stack', 'cause'].includes(key)) {
        formattedError[key] = (errorAttributes as Record<string, unknown>)[key]
      }
    }

    return formattedError
  }

  getCodeLocation(stack?: string): string {
    if (!stack) {
      return ''
    }

    const stackLines = stack.split('\n')
    const regex = /\(([^()]*?):(\d+?):(\d+?)\)\\?$/

    for (const item of stackLines) {
      const match = regex.exec(item)

      if (Array.isArray(match)) {
        return `${match[1]}:${Number(match[2])}`
      }
    }

    return ''
  }
}
