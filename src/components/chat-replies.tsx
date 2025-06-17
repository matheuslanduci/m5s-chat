import { useChat } from '@/chat/chat'
import type { Doc } from 'convex/_generated/dataModel'
import { useState } from 'react'
import { ChatMessage } from './chat-message'
import { MarkdownContent } from './markdown-content'
import { ServerMessage } from './server-message'

type ChatRepliesProps = {
  message: Doc<'message'>
}

export function ChatReplies({ message }: ChatRepliesProps) {
  const { drivenIds, setIsStreaming, retryMessage } = useChat()
  const [selectedIndex, setSelectedIndex] = useState<number>(
    message.responses?.length ? message.responses.length - 1 : 0
  )

  const response = message.responses?.[selectedIndex]

  return (
    <ChatMessage
      author="assistant"
      message={message}
      creationTime={response?.createdAt || Date.now()}
      currentResponseIndex={selectedIndex}
      totalResponses={message.responses?.length || 1}
      onResponseIndexChange={setSelectedIndex}
      modelName={response?.modelName}
      provider={response?.provider}
      responseCreationTime={response?.createdAt}
      onRetry={() => {
        setSelectedIndex(message.responses?.length || 1)
        retryMessage(message._id)
      }}
    >
      {response ? (
        <MarkdownContent>{response.content}</MarkdownContent>
      ) : (
        <ServerMessage
          // TODO: Implement auto scroll - not for me right now
          onFinish={() => {}}
          onStopStreaming={() => {
            setIsStreaming(false)
          }}
          isDriven={drivenIds.has(message._id)}
          messageId={message._id}
        />
      )}
    </ChatMessage>
  )
}
