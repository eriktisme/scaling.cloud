'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

export const AppHeader = () => {
  const { isMobile } = useSidebar()

  return (
    <div className="absolute top-0">
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div>{isMobile ? <SidebarTrigger /> : null}</div>
        </div>
      </header>
    </div>
  )
}
