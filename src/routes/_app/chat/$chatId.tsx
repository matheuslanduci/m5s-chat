import { ChatInput } from '@/components/chat-input'
import { ChatMessages } from '@/components/chat-messages'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/_app/chat/$chatId')({
  component: ChatComponent,
  loader: ({ params }) => {
    // Validate chatId format (basic validation)
    if (!params.chatId) {
      throw notFound()
    }
    return { chatId: params.chatId as Id<'chat'> }
  }
})

function ChatComponent() {
  const { chatId } = Route.useLoaderData()
  const chat = useQuery(api.chat.getChatById, { chatId })

  if (chat === undefined) {
    return (
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (chat === null) {
    return (
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
            <p className="text-muted-foreground">
              The chat you're looking for doesn't exist or you don't have access
              to it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background">
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
