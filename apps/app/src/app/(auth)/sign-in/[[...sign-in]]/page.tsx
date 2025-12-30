import { SignIn } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function Page() {
  const user = await currentUser()

  if (user) {
    redirect('/')
  }

  return <SignIn fallbackRedirectUrl="/" />
}
