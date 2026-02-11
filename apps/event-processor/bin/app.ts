#!/usr/bin/env node
import { EventProcessorStack } from '../lib/event-processor-stack'
import { App } from 'aws-cdk-lib'

const app = new App({
  analyticsReporting: false,
})

const databaseUrl =
  process.env.DATABASE_URL ||
  (() => {
    throw new Error('DATABASE_URL environment variable is required')
  })()

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY ||
  (() => {
    throw new Error('STRIPE_SECRET_KEY environment variable is required')
  })()

new EventProcessorStack(app, 'event-processor', {
  databaseUrl,
  stripe: {
    secretKey: stripeSecretKey,
  },
  projectName: 'scaling',
  /**
   * We currently only support a single stage.
   */
  stage: 'prod',
  env: {
    region: 'eu-west-1',
  },
})
