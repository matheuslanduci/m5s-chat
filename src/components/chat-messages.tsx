import { useChat } from '@/chat/chat'
import { MessageProvider } from '@/chat/message'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'
import { ChatReplies } from './chat-replies'
import { ChatRequests } from './chat-requests'

export function ChatMessages() {
  const { chat, cachedChats, cacheChat, scrollToBottom } = useChat()

  const messagesToFetch = useQuery(
    api.message.getMessagesByChatId,
    chat ? { chatId: chat._id } : 'skip'
  )

  const messages =
    messagesToFetch ||
    cachedChats.get(chat?._id || ('' as Id<'chat'>))?.messages ||
    []

  useEffect(() => {
    if (!chat) return

    if (messagesToFetch) {
      cacheChat({
        ...chat,
        messages: messagesToFetch
      })
    }
  }, [chat, messagesToFetch, cacheChat])

  // Auto-scroll when messages are loaded or updated
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100)
    }
  }, [messages.length, scrollToBottom])

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-0">
      <div className="w-full max-w-3xl mx-auto relative py-4">
        {messages?.map((message) => (
          <MessageProvider key={message._id} message={message}>
            <ChatRequests />
            <ChatReplies />
          </MessageProvider>
        ))}
      </div>
    </div>
  )
}
