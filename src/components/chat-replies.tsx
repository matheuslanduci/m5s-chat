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
  const { drivenIds, setIsStreaming } = useChat()
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
  }, [getToken])

  if (!authToken) return null

  return (
    <ChatMessage
      author="assistant"
      creationTime={response?.createdAt || Date.now()}
    >
      {response ? (
        <MarkdownContent>{response.content}</MarkdownContent>
      ) : (
        <ServerMessage
          // TODO: Implement auto scroll - not for me right now
          onFinish={() => {}}
          onStopStreaming={() => {
            setIsStreaming(false)
            drivenIds.delete(message._id)
          }}
          isDriven={drivenIds.has(message._id)}
          streamId={message.streamId as StreamId | undefined}
          authToken={authToken}
        />
      )}
    </ChatMessage>
  )
}
