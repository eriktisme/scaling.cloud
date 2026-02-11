import { Construct } from 'constructs'
import { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventConsumer, Stack } from '@evandam93/cdk-utils'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { StripeProps } from './types'

interface IntegrationConnectedBackfillProcessorProps {
  databaseUrl: string
  eventBus: IEventBus
  stripe: StripeProps
}

export class IntegrationConnectedBackfillProcessor extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IntegrationConnectedBackfillProcessorProps
  ) {
    super(scope, id)

    const stack = Stack.getStack(this)

    const { handler } = new EventConsumer(this, 'consumer', {
      eventBus: props.eventBus,
      eventPattern: {
        detailType: ['integration.connected'],
      },
      /**
       * We do not want to batch these events together,
       * as each event can take a long time to process (up to 15 minutes, or longer),
       * this depends on the amount of data we need to backfill for each connected account.
       */
      eventSourceProps: {
        batchSize: 1,
        maxConcurrency: 5,
      },
      handlerProps: {
        entry:
          'src/application/integration-connected-backfill-processor/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
          EVENT_BUS_NAME: props.eventBus.eventBusName,
          PROJECT_NAME: stack.projectName,
          STAGE: stack.stage,
          STRIPE_SECRET_KEY: props.stripe.secretKey,
        },
        runtime: Runtime.NODEJS_24_X,
        /**
         * We currently limit the execution time of the handler to 15 minutes.
         *
         * Can be increased if needed, I will monitor this.
         */
        timeout: Duration.minutes(15),
      },
    })

    props.eventBus.grantPutEventsTo(handler)
  }
}
