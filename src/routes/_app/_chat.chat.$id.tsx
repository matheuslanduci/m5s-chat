import { ChatProvider } from '@/chat/chat'
import { ModelSelectionProvider } from '@/chat/model-selection'
import { ChatBox } from '@/components/chat-box'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessages } from '@/components/chat-messages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_chat/chat/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <>
      <ModelSelectionProvider>
        <ChatProvider chatId={id}>
          <ChatHeader />

          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex flex-col flex-1 min-w-0 bg-background">
                  <ChatMessages />
                  <ChatBox />
                </div>
              </div>
            </div>
          </div>
        </ChatProvider>
      </ModelSelectionProvider>
    </>
  )
}
