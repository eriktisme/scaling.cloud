'use client'

import { PageTemplate } from '@/templates'
import { IntegrationCard, IntegrationCardSkeleton } from '../organisms'
import { SiStripe } from '@icons-pack/react-simple-icons'
import { listIntegrationsOptions } from '../api'
import { queryConfig } from '@/lib/react-query'
import { useQueries } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

export const IntegrationsPageTemplate = () => {
  const t = useTranslations()

  const [integrationsQuery] = useQueries({
    queries: [
      {
        ...listIntegrationsOptions,
        ...queryConfig,
      },
    ],
  })

  return (
    <PageTemplate
      isLoading={integrationsQuery.isLoading}
      skeleton={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      }
      title={t('IntegrationsPageTemplate.title')}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <IntegrationCard
          logo={<SiStripe />}
          provider="stripe"
          isConnected={
            integrationsQuery.data?.data?.some(
              (integration) => integration.name === 'stripe'
            ) ?? false
          }
          documentationUrl="#"
        />
      </div>
    </PageTemplate>
  )
}
