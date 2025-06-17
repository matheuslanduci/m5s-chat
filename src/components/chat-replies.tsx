import { useChat } from '@/chat/chat'
import { useMessage } from '@/chat/message'
import { ChatMessage } from './chat-message'
import { MarkdownContent } from './markdown-content'
import { ServerMessage } from './server-message'

export function ChatReplies() {
  const { drivenIds, setIsStreaming, isStreaming, setDrivenIds } = useChat()
  const { selectedReplyIndex, setSelectedReplyIndex, message } = useMessage()

  const response = message.responses?.[selectedReplyIndex]

  return (
    <ChatMessage
      author="assistant"
      creationTime={response?.createdAt || Date.now()}
      currentResponseIndex={selectedReplyIndex}
      totalResponses={message.responses?.length || 1}
      onResponseIndexChange={setSelectedReplyIndex}
      modelName={response?.modelName}
      provider={response?.provider}
      responseCreationTime={response?.createdAt}
    >
      {!isStreaming && response ? (
        <MarkdownContent>{response.content}</MarkdownContent>
      ) : (
        <ServerMessage
          onFinish={() => {}}
          onStopStreaming={() => {
            setIsStreaming(false)
            setDrivenIds((prev) => {
              prev.delete(message._id)

              return prev
            })
          }}
          isDriven={drivenIds.has(message._id)}
          messageId={message._id}
        />
      )}
    </ChatMessage>
  )
}
