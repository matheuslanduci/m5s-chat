import { useChat } from '@/chat/chat'
import { useQuery } from 'convex/react'
import Markdown from 'react-markdown'
import { Fragment } from 'react/jsx-runtime'
import { api } from '../../convex/_generated/api'
import { ChatMessage } from './chat-message'
import { ChatReplies } from './chat-replies'

export function ChatMessages() {
  const { chat } = useChat()

  const messages = useQuery(
    api.message.getMessagesByChatId,
    chat ? { chatId: chat._id } : 'skip'
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {messages?.map((message) => (
        <Fragment key={message._id}>
          <ChatMessage author="user" creationTime={message._creationTime}>
            <Markdown>{message.content}</Markdown>
          </ChatMessage>
          <ChatReplies message={message} />
        </Fragment>
      ))}
    </div>
  )
}
