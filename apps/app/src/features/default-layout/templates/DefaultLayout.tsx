import type { PropsWithChildren } from 'react'

import { AppHeader, AppSidebar } from '../organisms'
import { SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'

export const DefaultLayout = async (props: PropsWithChildren) => {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="relative flex flex-1 flex-col items-stretch overflow-hidden">
        <AppHeader />
        {props.children}
      </main>
    </SidebarProvider>
  )
}
