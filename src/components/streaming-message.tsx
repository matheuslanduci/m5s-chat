import { useChat } from '@/context/chat-context'
import { useModelSelection } from '@/hooks/use-model-selection'
import { env } from '@/lib/env'
import { useAuth } from '@clerk/clerk-react'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { ChatMessage } from './chat-message'

interface StreamingMessageProps {
  streamId: StreamId
  shouldStream: boolean // Whether this client should drive the stream

  onTextUpdate?: () => void // Callback for when text updates (for auto-scroll)
  onStop: () => void // Callback when streaming stops
}

export function StreamingMessage({
  streamId,
  shouldStream,
  onTextUpdate,
  onStop
}: StreamingMessageProps) {
  const { getToken } = useAuth()
  const [authToken, setAuthToken] = useState<string | null>(null)

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

  const { text, status } = useStream(
    api.chat.getChatBody,
    new URL(`${env.VITE_CONVEX_SITE}/chat-stream`),
    shouldStream && authToken !== null, // Only stream when we have a token
    streamId,
    {
      authToken: authToken || undefined
    }
  )
  const { chat } = useChat()
  const { selection, selectedModel } = useModelSelection()

  const isCurrentlyStreaming = useMemo(() => {
    if (!shouldStream || authToken === null) return false
    return status === 'pending' || status === 'streaming'
  }, [shouldStream, authToken, status])

  useEffect(() => {
    if (!shouldStream || isCurrentlyStreaming || authToken === null) return

    onStop()
  }, [shouldStream, isCurrentlyStreaming, authToken, onStop])

  useEffect(() => {
    if (!text) return

    onTextUpdate?.()
  }, [text, onTextUpdate])

  const message: Doc<'message'> = {
    _id: `stream-${streamId}` as Id<'message'>,
    _creationTime: Date.now(),
    role: 'assistant',
    content: text || '',
    attachments: [],
    model:
      selection.mode === 'model' && selectedModel
        ? {
            id: selectedModel._id,
            name: selectedModel.name,
            provider: selectedModel.provider as
              | 'openai'
              | 'anthropic'
              | 'google'
              | 'deepseek'
          }
        : undefined,
    chatId: chat?._id || ('default-chat' as Id<'chat'>),
    horizontalIndex: 0,
    verticalIndex: 0,
    status: isCurrentlyStreaming ? 'pending' : 'completed',
    tokens: 0
  }

  return <ChatMessage message={message} />
}
