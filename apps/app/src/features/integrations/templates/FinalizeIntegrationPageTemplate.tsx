'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { useCreateIntegration } from '../api'

interface Props {
  code: string
  provider: string
  source?: string
}

export const FinalizeIntegrationPageTemplate = (props: Props) => {
  const createIntegration = useCreateIntegration({
    mutationConfig: {
      onSuccess: () => {
        // Intentionally left blank
      },
    },
  })

  const onCreateIntegration = useCallback(async () => {
    const result = await createIntegration.mutateAsync({
      provider: props.provider,
      body: {
        code: props.code,
      },
    })

    if (!result.success) {
      toast.error('Failed to connect integration')
    }
  }, [createIntegration, props.code, props.provider])

  useEffect(() => {
    void onCreateIntegration()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
