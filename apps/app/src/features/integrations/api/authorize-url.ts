import { useMutation } from '@tanstack/react-query'

import type { MutationConfig } from '@/lib/react-query'
import { AuthorizeBody, AuthorizeUrlResponse } from '../server/schema'

interface Params {
  provider: string
  body?: AuthorizeBody
}

interface UseAuthorizeUrlOptions {
  mutationConfig?: MutationConfig<
    (
      params: Params
    ) => Promise<
      { error?: string; success: false } | { data: string; success: true }
    >
  >
}

export const useAuthorizeUrl = ({ mutationConfig }: UseAuthorizeUrlOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig ?? {}

  return useMutation({
    onSuccess: async (...args) => {
      await onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: async (params: Params) => {
      const request = await fetch(
        `/api/integrations/${params.provider}/authorize-url`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(params.body ?? {}),
        }
      )

      if (!request.ok) {
        return {
          error: 'Failed to get authorize url',
          success: false,
        }
      }

      const response: AuthorizeUrlResponse = await request.json()

      return {
        success: true,
        data: response.url,
      }
    },
  })
}
