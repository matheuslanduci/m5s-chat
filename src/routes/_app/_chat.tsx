import { ChatProvider } from '@/chat/chat'
import { ModelSelectionProvider } from '@/chat/model-selection'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_chat')({
  component: () => (
    <>
      <ModelSelectionProvider>
        <ChatProvider>
          <Outlet />
        </ChatProvider>
      </ModelSelectionProvider>
    </>
  )
})
