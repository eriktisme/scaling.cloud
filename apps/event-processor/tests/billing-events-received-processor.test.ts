import { describe, it } from 'vitest'
import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { Stack, StackProps } from '@evandam93/cdk-utils'
import { StripeProps } from '../lib/types'
import { BillingEventsReceivedProcessor } from '../lib/billing-events-received-processor'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { EventProcessorStack } from '../lib/event-processor-stack'

const stripeProps: StripeProps = {
  secretKey: 'sk_test_123',
}

const defaultProps: StackProps = {
  env: {
    region: 'eu-west-1',
  },
  projectName: 'scaling',
  stage: 'test',
}

describe('BillingEventsReceivedProcessor', () => {
  it('creates exactly one Lambda Function', () => {
    const app = new App()

    const stack = new Stack(app, 'event-processor', defaultProps)

    const eventBus = new EventBus(stack, 'event-bus')

    new BillingEventsReceivedProcessor(stack, 'billing-events-received', {
      stripe: stripeProps,
      databaseUrl: 'postgres',
      eventBus,
    })

    const template = Template.fromStack(stack)

    template.resourceCountIs('AWS::Lambda::Function', 1)
  })

  it('grants the Lambda Function permissions to put events on the event bus', () => {
    const app = new App()

    const stack = new Stack(app, 'event-processor', defaultProps)

    const eventBus = new EventBus(stack, 'event-bus')

    new BillingEventsReceivedProcessor(stack, 'billing-events-received', {
      stripe: stripeProps,
      databaseUrl: 'postgres',
      eventBus,
    })

    const template = Template.fromStack(stack)

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'events:PutEvents',
            Effect: 'Allow',
          }),
        ]),
      },
    })
  })
})
