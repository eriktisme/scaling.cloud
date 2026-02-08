import type { ReactNode } from 'react'

import { DefaultLayout } from '@/features/default-layout'

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <DefaultLayout>{children}</DefaultLayout>
}
