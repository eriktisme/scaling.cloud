import { SignedIn, SignedOut } from '@clerk/nextjs'
import { LandingPage } from '@/features/marketing'
import { DefaultLayout } from '@/features/default-layout'
import { IntegrationsPageTemplate } from '@/features/integrations'

export default function Page() {
  return (
    <>
      <SignedIn>
        <DefaultLayout>
          <IntegrationsPageTemplate />
        </DefaultLayout>
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  )
}
