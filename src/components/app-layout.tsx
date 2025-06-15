import { Outlet } from '@tanstack/react-router'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from './ui/sidebar'

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <ChatProvider>
          <SiteHeader /> */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex-1 flex flex-col min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
        {/* </ChatProvider>
         */}
      </SidebarInset>
    </SidebarProvider>
  )
}
