import type { LogFormatter } from './formatters'
import type { LogItem } from './item'
import type {
  Context,
  LogAttributes,
  LogFunction,
  LogItemExtraInput,
  LogItemMessage,
  LogLevel,
} from './types'

export interface LoggerOptions {
  /**
   * The name of the service/application using the logger
   */
  service: string

  /**
   * The context or module name where the logger is used
   */
  context: string

  /**
   * The formatter to format log items
   */
  formatter: LogFormatter

  /**
   * Indentation level for nested log items
   *
   * @default 4
   */
  logIndentation?: number
}

export class Logger {
  protected readonly attributes: LogAttributes

  protected readonly logIndentation: number

  constructor(protected readonly options: LoggerOptions) {
    this.attributes = {
      service: options.service,
      context: options.context,
    }

    this.logIndentation = options.logIndentation ?? 4
  }

  log(message: LogItemMessage, ...extraInput: LogItemExtraInput) {
    this.processLogItem('info', message, extraInput)
  }

  info(message: LogItemMessage, ...extraInput: LogItemExtraInput) {
    this.processLogItem('info', message, extraInput)
  }

  warn(message: LogItemMessage, ...extraInput: LogItemExtraInput) {
    this.processLogItem('warn', message, extraInput)
  }

  error(message: LogItemMessage, ...extraInput: LogItemExtraInput) {
    this.processLogItem('error', message, extraInput)
  }

  addContext(context: Context) {
    Object.assign(this.attributes, context)
  }

  addAttributes(attributes: LogAttributes) {
    Object.assign(this.attributes, attributes)
  }

  protected processLogItem(
    logLevel: LogLevel,
    message: LogItemMessage,
    extraInput: LogItemExtraInput
  ) {
    this.printLog(logLevel, this.createLogItem(logLevel, message, extraInput))
  }

  protected printLog(logLevel: LogLevel, item: LogItem) {
    item.prepareForLogging()

    const method = logLevel.toLowerCase() as keyof LogFunction

    console[method](
      JSON.stringify(item.getAttributes(), null, this.logIndentation)
    )
  }

  protected createLogItem(
    logLevel: LogLevel,
    message: LogItemMessage,
    extraInput: LogItemExtraInput
  ) {
    const unformattedBaseAttributes = {
      ...this.attributes,
      logLevel,
      timestamp: new Date(),
      message,
    }

    return this.options.formatter.formatAttributes(
      unformattedBaseAttributes,
      this.processExtraInput(extraInput, this.attributes)
    )
  }

  protected processExtraInput(
    extraInput: LogItemExtraInput,
    additionalAttributes: LogAttributes
  ) {
    for (const item of extraInput) {
      if (Object.is(item, null) || Object.is(item, undefined)) {
        continue
      }

      if (item instanceof Error) {
        additionalAttributes['error'] = item
      } else if (typeof item === 'string') {
        additionalAttributes['extra'] = item
      } else {
        additionalAttributes = this.processExtraObject(
          item,
          additionalAttributes
        )
      }
    }

    return additionalAttributes
  }

  protected processExtraObject(
    item: LogAttributes,
    additionalAttributes: LogAttributes
  ) {
    for (const [key, value] of Object.entries(item)) {
      additionalAttributes[key] = value
    }

    return additionalAttributes
  }
}
