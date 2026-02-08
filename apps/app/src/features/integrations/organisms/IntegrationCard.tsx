'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ReactNode, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { BookIcon } from 'lucide-react'
import { Anchor } from '@/components/ui/anchor'
import { useAuthorizeUrl } from '../api'
import { toast } from 'sonner'

interface Props {
  logo?: ReactNode
  provider: string
  isConnected: boolean
  documentationUrl: string
}

export const IntegrationCard = (props: Props) => {
  const t = useTranslations()

  const authorizeUrl = useAuthorizeUrl({
    mutationConfig: {
      onSuccess: () => {
        //
      },
    },
  })

  const onAuthorize = useCallback(async () => {
    const result = await authorizeUrl.mutateAsync({
      provider: props.provider.toLowerCase(),
      body: {
        source: 'dashboard',
      },
    })

    if (result.success) {
      window.location.assign(result.data)

      return
    }

    toast.error('Failed to get authorization URL')
  }, [authorizeUrl, props.provider])

  return (
    <Card>
      <CardHeader className="min-h-30 flex-col">
        {props.logo}
        <CardTitle>
          {t(`IntegrationCard.${props.provider.toLowerCase()}.name`)}
        </CardTitle>
        <CardDescription>
          {t(`IntegrationCard.${props.provider.toLowerCase()}.description`)}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2.5">
        {!props.isConnected ? (
          <Button
            loading={authorizeUrl.isPending}
            onClick={onAuthorize}
            className="flex-1"
          >
            {t('IntegrationCard.connect')}
          </Button>
        ) : (
          <Button variant="destructive" className="flex-1">
            {t('IntegrationCard.disconnect')}
          </Button>
        )}
        <Anchor size="icon" variant="outline" href={props.documentationUrl}>
          <BookIcon />
        </Anchor>
      </CardFooter>
    </Card>
  )
}
