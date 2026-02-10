#!/usr/bin/env node
import { EventProcessorStack } from '../lib/event-processor-stack'
import { App } from 'aws-cdk-lib'

const app = new App({
  analyticsReporting: false,
})

new EventProcessorStack(app, 'event-processor', {
  projectName: 'scaling',
  /**
   * We currently only support a single stage.
   */
  stage: 'prod',
  env: {
    region: 'eu-west-1',
  },
})
