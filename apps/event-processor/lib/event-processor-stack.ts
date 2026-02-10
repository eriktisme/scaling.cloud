import { Construct } from 'constructs'
import { Stack, StackProps } from '@evandam93/cdk-utils'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { User } from 'aws-cdk-lib/aws-iam'

export class EventProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const eventBus = new EventBus(this, 'event-bus', {
      eventBusName: `${this.projectName}-${this.region}-event-bus`,
    })

    /**
     * Currently, we will use an IAM User to push events to the event bus.
     * In the future, I might want to support an API Gateway endpoint.
     */
    const eventPusher = new User(this, 'event-pusher', {
      userName: `${this.projectName}-${this.region}-event-pusher`,
    })

    eventBus.grantPutEventsTo(eventPusher)
  }
}
