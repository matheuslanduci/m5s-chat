import { useChat } from '@/chat/chat'
import { MessageProvider } from '@/chat/message'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'
import { ChatMessage } from './chat-message'
import { ChatReplies } from './chat-replies'
import { MarkdownContent } from './markdown-content'

export function ChatMessages() {
  const { chat, cachedChats, cacheChat } = useChat()

  const messageContainerEndRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-0">
      <div className="w-full max-w-3xl mx-auto relative py-4">
        {messages?.map((message) => (
          <MessageProvider key={message._id} message={message}>
            <ChatMessage author="user" creationTime={message._creationTime}>
              <MarkdownContent>{message.content}</MarkdownContent>
            </ChatMessage>
            <ChatReplies message={message} />
          </MessageProvider>
        ))}

        <div ref={messageContainerEndRef} />
      </div>
    </div>
  )
}
