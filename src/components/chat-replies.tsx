import { useChat } from '@/chat/chat'
import { useMessage } from '@/chat/message'
import type { Doc } from 'convex/_generated/dataModel'
import { ChatMessage } from './chat-message'
import { MarkdownContent } from './markdown-content'
import { ServerMessage } from './server-message'

type ChatRepliesProps = {
  message: Doc<'message'>
}

export function ChatReplies({ message }: ChatRepliesProps) {
  const { drivenIds, setIsStreaming } = useChat()
  const { selectedIndex, setSelectedIndex } = useMessage()

  const response = message.responses?.[selectedIndex]

  return (
    <ChatMessage
      author="assistant"
      creationTime={response?.createdAt || Date.now()}
      currentResponseIndex={selectedIndex}
      totalResponses={message.responses?.length || 1}
      onResponseIndexChange={setSelectedIndex}
      modelName={response?.modelName}
      provider={response?.provider}
      responseCreationTime={response?.createdAt}
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
