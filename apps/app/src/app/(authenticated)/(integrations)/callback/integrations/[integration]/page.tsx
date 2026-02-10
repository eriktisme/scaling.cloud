import { notFound } from 'next/navigation'
import { FinalizeIntegrationPageTemplate } from '@/features/integrations'

interface PageProps {
  params: Promise<{
    integration: string
  }>
  /**
   * Once we support more providers, I need to look into how to type this properly.
   */
  searchParams: Promise<{
    code: string
    state?: string
  }>
}

const SUPPORTED_INTEGRATIONS = ['stripe']

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  if (!SUPPORTED_INTEGRATIONS.includes(params.integration)) {
    notFound()
  }

  if (!searchParams.code) {
    return notFound()
  }

  const { source } = JSON.parse(searchParams.state ?? '{}')

  return (
    <FinalizeIntegrationPageTemplate
      provider={params.integration}
      code={searchParams.code}
      source={source}
    />
  )
}
