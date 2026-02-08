import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { handle } from 'hono/vercel'

import { app as integrationsRoutes } from '@/features/integrations/server'

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ success: false }, 422)
    }

    return c.json({ success: true }, 200)
  },
}).basePath('/api')

app.get(
  '/',
  swaggerUI({
    url: '/api/openapi',
  })
)

app.doc('/openapi', {
  openapi: '3.1.0',
  info: {
    version: '0.1.0',
    title: 'Frontend API',
  },
})

app.onError((_, c) => {
  return c.json({ message: 'Internal Server Error' }, 500)
})

app.route('/', integrationsRoutes)

export const GET = handle(app)

export const POST = handle(app)

export const PUT = handle(app)

export const PATCH = handle(app)

export const DELETE = handle(app)
