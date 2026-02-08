import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/nextjs'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import { NextIntlClientProvider } from 'next-intl'

export const metadata: Metadata = {
  title: {
    template: '%s | scaling.cloud',
    default: 'scaling.cloud',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="flex min-h-svh flex-col bg-white font-sans text-stone-900 antialiased dark:bg-stone-950 dark:text-white">
          <ClerkLoading>
            <div className="flex min-h-svh flex-1 items-center justify-center">
              <div className="flex flex-row items-center gap-1.5">
                <Spinner className="text-stone-500 dark:text-white" />
                <div className="font-medium text-stone-700">Loading...</div>
              </div>
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <NextIntlClientProvider>
              <Providers>{children}</Providers>
            </NextIntlClientProvider>
          </ClerkLoaded>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
