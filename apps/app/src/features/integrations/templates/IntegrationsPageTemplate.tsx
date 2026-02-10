import { PageTemplate } from '@/templates'
import { IntegrationCard } from '../organisms'
import { SiStripe } from '@icons-pack/react-simple-icons'

export const IntegrationsPageTemplate = () => {
  return (
    <PageTemplate title="Integrations">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <IntegrationCard
          logo={<SiStripe />}
          provider="stripe"
          isConnected={false}
          documentationUrl="#"
        />
      </div>
    </PageTemplate>
  )
}
