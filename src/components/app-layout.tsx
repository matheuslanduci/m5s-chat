import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
