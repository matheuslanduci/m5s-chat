import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChatProvider } from '@/context/chat-context'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: () => (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex-1 flex flex-col min-w-0">
              <ChatProvider>
                <Outlet />
              </ChatProvider>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
  beforeLoad({ context }) {
    if (context.user.isLoaded && !context.user.isSignedIn) {
      throw redirect({
        to: '/sign-in/$'
      })
    }
  }
})
