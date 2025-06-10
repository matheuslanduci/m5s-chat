import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ChatProvider } from '@/context/chat-context'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: () => (
    <div className="h-dvh">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 p-2 border-b shrink-0">
            <SidebarTrigger />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <ChatProvider>
              <Outlet />
            </ChatProvider>
          </div>
        </main>
      </SidebarProvider>
    </div>
  ),
  beforeLoad({ context }) {
    if (context.user.isLoaded && !context.user.isSignedIn) {
      throw redirect({
        to: '/sign-in/$'
      })
    }
  }
})
