import { useChat } from '@/chat/chat'
import { useAuth } from '@clerk/clerk-react'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import type { Doc } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import { ChatMessage } from './chat-message'
import { MarkdownContent } from './markdown-content'
import { ServerMessage } from './server-message'

type ChatRepliesProps = {
  message: Doc<'message'>
}

export function ChatReplies({ message }: ChatRepliesProps) {
  const { getToken } = useAuth()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const { drivenIds, setIsStreaming, retryMessage } = useChat()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const response = message.responses?.[selectedIndex]

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken({
          template: 'convex'
        })
        setAuthToken(token)
      } catch (error) {
        console.error('Failed to get auth token:', error)
        setAuthToken(null)
      }
    }

    fetchToken()

    const interval = setInterval(fetchToken, 60 * 1000 * 30) // Refresh token every 30 minutes

    return () => clearInterval(interval)
  }, [getToken])

  if (!authToken) return null

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
        if (response) {
          setSelectedIndex(message.responses?.length || 1)
          retryMessage(message._id)
        }
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
          streamId={message.streamId as StreamId | undefined}
          authToken={authToken}
        />
      )}
    </ChatMessage>
  )
}
