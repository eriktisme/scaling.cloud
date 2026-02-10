'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { useCreateIntegration } from '../api'
import { useRouter } from 'next/navigation'

interface Props {
  code: string
  provider: string
  source?: string
}

export const FinalizeIntegrationPageTemplate = (props: Props) => {
  const router = useRouter()

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
    } else {
      toast.success('Integration connected successfully')
    }

    router.push('/')
  }, [createIntegration, props.code, props.provider, router])

  useEffect(() => {
    void onCreateIntegration()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
