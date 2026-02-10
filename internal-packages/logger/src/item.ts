import type { LogAttributes } from './types'

export class LogItem {
  protected attributes: LogAttributes
  protected redactedAttributes: string[]

  constructor(initial: LogAttributes, redactedAttributes: string[] = []) {
    this.attributes = initial
    this.redactedAttributes = redactedAttributes
  }

  addAttributes(attributes: LogAttributes) {
    Object.assign(this.attributes, attributes)
  }

  getAttributes(): LogAttributes {
    return this.attributes
  }

  prepareForLogging() {
    const prepared: LogAttributes = {}

    for (const key in this.attributes) {
      if (
        this.attributes[key] !== undefined &&
        this.attributes[key] !== '' &&
        this.attributes[key] !== null
      ) {
        if (this.redactedAttributes.includes(key)) {
          prepared[key] = '[REDACTED]'
        } else {
          prepared[key] = this.attributes[key]
        }
      }
    }

    this.attributes = prepared
  }
}
