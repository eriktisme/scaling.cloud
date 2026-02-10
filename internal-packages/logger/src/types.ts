export interface Context {
  traceId: string
  [key: string]: unknown
}

export type LogItemMessage = string

export type LogItemExtraInput = [Error | string] | LogAttributes[]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LogLevelList = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const

export type LogLevel =
  | (typeof LogLevelList)[keyof typeof LogLevelList]
  | Lowercase<(typeof LogLevelList)[keyof typeof LogLevelList]>

export type LogFunction = Record<
  Lowercase<LogLevel>,
  (message: LogItemMessage) => void
>

export type LogAttributes = Record<string, unknown>

export interface BaseLogAttributes extends LogAttributes {
  error?: Error
  logLevel: LogLevel
  timestamp: Date
  message: string
}

export type UnformattedAttributes = LogAttributes & BaseLogAttributes
