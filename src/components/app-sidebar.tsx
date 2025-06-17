import { Link } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'
import { NavChatHistory } from './nav-chat-history'
import { NavUser } from './nav-user'
import { Button } from './ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <MessageCircle className="h-5 w-5" />
                <span className="text-base font-semibold">m5s.chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-shrink-0">
          <Button type="button" asChild>
            <Link to="/">New Chat</Link>
          </Button>
        </SidebarGroup>
        <div className="flex-1 overflow-auto scrollbar-hidden">
          <NavChatHistory />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
