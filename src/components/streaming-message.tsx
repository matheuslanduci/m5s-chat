import type { Message } from '@/context/chat-context'
import { env } from '@/lib/env'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'
import { ChatMessage } from './chat-message'

interface StreamingMessageProps {
  streamId: StreamId
  shouldStream: boolean // Whether this client should drive the stream
  initialMessage?: Message
  onTextUpdate?: () => void // Callback for when text updates (for auto-scroll)
}

export function StreamingMessage({
  streamId,
  shouldStream,
  initialMessage,
  onTextUpdate
}: StreamingMessageProps) {
  const { text, status } = useStream(
    api.chat.getChatBody,
    new URL(`${env.VITE_CONVEX_SITE}/chat-stream`),
    shouldStream,
    streamId
  )

  // Notify parent when text updates (for auto-scroll)
  useEffect(() => {
    onTextUpdate?.()
  }, [text, onTextUpdate])

  // Create a message object for the ChatMessage component
  const message: Message = {
    id: `stream-${streamId}`,
    role: 'assistant',
    content: text || initialMessage?.content || '',
    timestamp: initialMessage?.timestamp || new Date(),
    isTyping: status === 'streaming'
  }

  return <ChatMessage message={message} />
}
