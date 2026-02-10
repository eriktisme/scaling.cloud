import { queryOptions } from '@tanstack/react-query'
import { IntegrationsResponse } from '../server/schema'

export const listIntegrationsOptions = queryOptions<IntegrationsResponse>({
  queryKey: ['integrations'],
  queryFn: () => fetch(`/api/integrations`).then((res) => res.json()),
})
