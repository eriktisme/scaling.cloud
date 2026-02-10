import { z } from '@hono/zod-openapi'

export const NotFoundErrorSchema = z.object({
  statusCode: z.number().openapi({
    example: 404,
  }),
  type: z.string().openapi({
    example: 'invalid_request_error',
  }),
  code: z.string().openapi({
    example: 'not_found',
  }),
  requestId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426655440000',
  }),
})

export const NotAuthorizedErrorSchema = z.object({
  statusCode: z.number().openapi({
    example: 404,
  }),
  type: z.string().openapi({
    example: 'not_authorized_error',
  }),
  code: z.string().openapi({
    example: 'not_authorized',
  }),
  requestId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426655440000',
  }),
})

export const ConflictErrorSchema = z.object({
  statusCode: z.number().openapi({
    example: 409,
  }),
  type: z.string().openapi({
    example: 'invalid_request_error',
  }),
  code: z.string().openapi({
    example: '',
  }),
  requestId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426655440000',
  }),
})

export const BadRequestErrorSchema = z.object({
  statusCode: z.number().openapi({
    example: 400,
  }),
  type: z.string().openapi({
    example: 'invalid_request_error',
  }),
  code: z.string().openapi({
    example: 'validation_type',
  }),
  requestId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426655440000',
  }),
})

export const InvalidServerErrorSchema = z.object({
  statusCode: z.number().openapi({
    example: 500,
  }),
  type: z.string().openapi({
    example: 'invalid_error',
  }),
  code: z.string().openapi({
    example: '',
  }),
  requestId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426655440000',
  }),
})
