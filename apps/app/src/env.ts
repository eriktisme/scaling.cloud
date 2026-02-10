import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  client: {
    //
  },
  runtimeEnv: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    EVENT_BUS_NAME: process.env.EVENT_BUS_NAME,
    STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID,
    STRIPE_REDIRECT_URL: process.env.STRIPE_REDIRECT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_SIGNING_SECRET: process.env.STRIPE_SIGNING_SECRET,
  },
  server: {
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_REGION: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    EVENT_BUS_NAME: z.string().min(1),
    STRIPE_CLIENT_ID: z.string().min(1),
    STRIPE_REDIRECT_URL: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_SIGNING_SECRET: z.string().min(1),
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
})
