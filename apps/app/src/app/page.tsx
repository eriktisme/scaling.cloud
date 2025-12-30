import { SignedIn, SignedOut } from '@clerk/nextjs'
import { LandingPage } from '@/features/marketing'

export default function Page() {
  return (
    <>
      <SignedIn>Signed In</SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  )
}
