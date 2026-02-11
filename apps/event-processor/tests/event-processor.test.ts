import { describe, it } from 'vitest'
import { App } from 'aws-cdk-lib'
import { Template, Match } from 'aws-cdk-lib/assertions'
import {
  EventProcessorStack,
  EventProcessorStackProps,
} from '../lib/event-processor-stack'

const defaultProps: EventProcessorStackProps = {
  databaseUrl: 'postgresql://user:password@host:5432/db',
  stripe: {
    secretKey: 'sk_test_1234567890abcdef',
  },
  env: {
    region: 'eu-west-1',
  },
  projectName: 'scaling',
  stage: 'test',
}

describe('EventProcessor', () => {
  it('creates exactly one EventBridge event bus', () => {
    const app = new App()

    const stack = new EventProcessorStack(app, 'event-processor', defaultProps)

    const template = Template.fromStack(stack)

    template.resourceCountIs('AWS::Events::EventBus', 1)
  })

  it('configures the event bus with the expected name', () => {
    const app = new App()

    const stack = new EventProcessorStack(app, 'event-processor', defaultProps)

    const template = Template.fromStack(stack)

    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: 'scaling-eu-west-1-event-bus',
    })
  })

  it('creates an IAM user for pushing events with the expected username', () => {
    const app = new App()

    const stack = new EventProcessorStack(app, 'event-processor', defaultProps)

    const template = Template.fromStack(stack)

    template.hasResourceProperties('AWS::IAM::User', {
      UserName: 'scaling-eu-west-1-event-pusher',
    })
  })

  it('grants the IAM user permission to put events on the event bus', () => {
    const app = new App()

    const stack = new EventProcessorStack(app, 'event-processor', defaultProps)

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
