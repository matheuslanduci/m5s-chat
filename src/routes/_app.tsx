import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChatProvider } from '@/context/chat-context'
import { useUser } from '@clerk/clerk-react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

function AppLayout() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ChatProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex-1 flex flex-col min-w-0">
                <Outlet />
              </div>
            </div>
          </div>
        </ChatProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad({ context }) {
    if (context.user.isLoaded && !context.user.isSignedIn) {
      throw redirect({
        to: '/sign-in/$'
      })
    }
  }
})
