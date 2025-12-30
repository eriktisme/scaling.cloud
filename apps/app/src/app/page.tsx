import { SignedIn, SignedOut } from '@clerk/nextjs'
import { LandingPage } from '@/features/marketing'
import { DefaultLayout } from '@/features/default-layout'

export default function Page() {
  return (
    <>
      <SignedIn>
        <DefaultLayout>Signed In</DefaultLayout>
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  )
}
