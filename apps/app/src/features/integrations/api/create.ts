import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CreateIntegrationBody } from '../server/schema'
import type { MutationConfig } from '@/lib/react-query'

interface Params {
  body: CreateIntegrationBody
  provider: string
}

interface UseCreateIntegrationOptions {
  mutationConfig?: MutationConfig<
    (params: Params) => Promise<{ error?: string; success: boolean }>
  >
}

export const useCreateIntegration = ({
  mutationConfig,
}: UseCreateIntegrationOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig ?? {}

  return useMutation({
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['integrations'] })

      await queryClient.refetchQueries({ queryKey: ['integrations'] })

      await onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: async (params: Params) => {
      const request = await fetch(`/api/integrations/${params.provider}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(params.body),
      })

      if (!request.ok) {
        return {
          error: 'Failed to create integration',
          success: false,
        }
      }

      return {
        success: true,
      }
    },
  })
}
