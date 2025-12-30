import { SignUp } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default async function Page() {
  const user = await currentUser()

  if (user) {
    redirect('/')
  }

  return <SignUp />
}
