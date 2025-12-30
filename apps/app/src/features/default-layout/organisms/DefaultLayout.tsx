import type { PropsWithChildren } from 'react'

import { AppHeader, AppSidebar } from '../components'
import { SidebarProvider } from '@/components/ui/sidebar'

export const DefaultLayout = (props: PropsWithChildren) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex w-full flex-1 flex-col">
        <AppHeader />
        {props.children}
      </main>
    </SidebarProvider>
  )
}
