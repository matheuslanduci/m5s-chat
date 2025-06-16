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
  scrollToBottomRef: React.RefObject<HTMLDivElement | null>
}

export function ChatReplies({ message, scrollToBottomRef }: ChatRepliesProps) {
  const { getToken } = useAuth()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const { drivenIds, setIsStreaming, isStreaming } = useChat()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [breakAutoScroll, setBreakAutoScroll] = useState<boolean>(false)

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

  useEffect(() => {
    const handleScroll = () => {
      if (scrollToBottomRef.current && isStreaming) {
        setBreakAutoScroll(true)
      }
    }

    const scrollContainer = scrollToBottomRef.current?.parentElement
    scrollContainer?.addEventListener('scroll', handleScroll)
  }, [scrollToBottomRef, isStreaming])

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
          onFinish={() => {}}
          onStopStreaming={() => {
            if (!breakAutoScroll)
              scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' })

            setBreakAutoScroll(false)
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
