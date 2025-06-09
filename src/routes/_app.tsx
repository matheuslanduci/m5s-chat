import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ChatProvider } from '@/context/chat-context'

export const Route = createFileRoute('/_app')({
  component: () => (
    <ChatProvider>
      <Outlet />
    </ChatProvider>
  ),
  beforeLoad({ context }) {
    if (context.user.isLoaded && !context.user.isSignedIn) {
      throw redirect({
        to: '/sign-in/$'
      })
    }
  }
})
