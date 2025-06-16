import { useChat } from '@/chat/chat'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import type { Doc } from 'convex/_generated/dataModel'
import { useState } from 'react'
import { ChatMessage } from './chat-message'
import { ServerMessage } from './server-message'

type ChatRepliesProps = {
  message: Doc<'message'>
}

export function ChatReplies({ message }: ChatRepliesProps) {
  const { drivenIds, setIsStreaming } = useChat()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const response = message.responses?.[selectedIndex]

  if (!response) return null

  return (
    <ChatMessage author="assistant" creationTime={response.createdAt}>
      <ServerMessage
        onFinish={() => {}}
        onStopStreaming={() => {
          setIsStreaming(false)
        }}
        isDriven={drivenIds.has(message._id)}
        streamId={message.streamId as StreamId | undefined}
      />
    </ChatMessage>
  )
}
