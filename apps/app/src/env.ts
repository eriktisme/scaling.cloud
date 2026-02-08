import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  client: {
    //
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID,
    STRIPE_REDIRECT_URL: process.env.STRIPE_REDIRECT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  },
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    STRIPE_CLIENT_ID: z.string().min(1),
    STRIPE_REDIRECT_URL: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
})
