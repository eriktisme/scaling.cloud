'use client'

import { PageTemplate } from '@/templates'
import { IntegrationCard } from '../organisms'
import { SiStripe } from '@icons-pack/react-simple-icons'
import { listIntegrationsOptions } from '../api'
import { queryConfig } from '@/lib/react-query'
import { useQueries } from '@tanstack/react-query'

export const IntegrationsPageTemplate = () => {

  const [integrationsQuery] = useQueries({
    queries: [
      {
        ...listIntegrationsOptions,
        ...queryConfig,
      },
    ],
  })

  return (
    <PageTemplate title="Integrations">
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
