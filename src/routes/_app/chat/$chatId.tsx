import { ChatInput } from '@/components/chat-input'
import { ChatMessages } from '@/components/chat-messages'
import { ChatProvider } from '@/context/chat-context'
import { createFileRoute, notFound } from '@tanstack/react-router'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_app/chat/$chatId')({
  component: ChatComponent,
  loader: ({ params }) => {
    if (!params.chatId) throw notFound()

    return { chatId: params.chatId as Id<'chat'> }
  }
})

function ChatComponent() {
  const { chatId } = Route.useLoaderData()

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background">
      <ChatProvider chatId={chatId}>
        <ChatMessages />
        <ChatInput />
      </ChatProvider>
    </div>
  )
}
