'use client'

import { GalleryVerticalEnd, HomeIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { NavUser } from './NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'

interface SidebarLogoOrTriggerProps {
  hovered: boolean
  open: boolean
}

function SidebarLogoOrTrigger(props: Readonly<SidebarLogoOrTriggerProps>) {
  if (props.hovered && !props.open) {
    return <SidebarTrigger />
  }

  return (
    <Link href="/">
      <div className="flex aspect-square items-center justify-center rounded-lg">
        <GalleryVerticalEnd className="size-4" />
      </div>
    </Link>
  )
}

export const AppSidebar = () => {
  const [hovered, setHovered] = useState(false)

  const { open } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between">
        <SidebarMenuButton
          onMouseOver={() => {
            setHovered(true)
          }}
          onMouseOut={() => {
            setHovered(false)
          }}
          className="w-auto"
          asChild
        >
          {SidebarLogoOrTrigger({ hovered, open })}
        </SidebarMenuButton>
        {open ? (
          <div className="flex">
            <SidebarTrigger />
          </div>
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <HomeIcon />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
