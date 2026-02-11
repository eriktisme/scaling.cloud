import { Construct } from 'constructs'
import { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventConsumer, Stack } from '@evandam93/cdk-utils'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { Match } from 'aws-cdk-lib/aws-events'
import { StripeProps } from './types'

interface EventProcessorHandlerProps {
  databaseUrl: string
  eventBus: IEventBus
  stripe: StripeProps
}

export class BillingEventsReceivedProcessor extends Construct {
  constructor(scope: Construct, id: string, props: EventProcessorHandlerProps) {
    super(scope, id)

    const stack = Stack.getStack(this)

    const { handler } = new EventConsumer(this, 'consumer', {
      eventBus: props.eventBus,
      /**
       * We process only 'billing-events.received',
       * events from the event bus from any source.
       */
      eventPattern: {
        source: Match.prefix(''),
        detailType: ['billing-event.received'],
      },
      /**
       * We want to process events in batches to improve performance and reduce costs.
       */
      eventSourceProps: {
        batchSize: 25,
        maxConcurrency: 2,
        maxBatchingWindow: Duration.seconds(5),
      },
      handlerProps: {
        entry: 'src/application/billing-events-received-processor/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
          EVENT_BUS_NAME: props.eventBus.eventBusName,
          PROJECT_NAME: stack.projectName,
          STAGE: stack.stage,
          STRIPE_SECRET_KEY: props.stripe.secretKey,
        },
        runtime: Runtime.NODEJS_24_X,
      },
    })

    props.eventBus.grantPutEventsTo(handler)
  }
}
