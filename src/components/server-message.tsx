import { env } from '@/lib/env'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { useEffect, useMemo } from 'react'
import { api } from '../../convex/_generated/api'
import { MarkdownContent } from './markdown-content'

type ServerMessageProps = {
  onFinish: () => void
  onStopStreaming: () => void
  isDriven: boolean
  streamId?: StreamId
  authToken: string
}

export function ServerMessage({
  onFinish,
  onStopStreaming,
  isDriven,
  streamId,
  authToken
}: ServerMessageProps) {
  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${env.VITE_CONVEX_SITE}/chat`),
    isDriven,
    streamId,
    {
      authToken
    }
  )

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false

    return status === 'streaming' || status === 'pending'
  }, [isDriven, status])

  useEffect(() => {
    if (isCurrentlyStreaming || !isDriven) return

    console.log('Stream finished, calling onStopStreaming')

    onStopStreaming()
  }, [isCurrentlyStreaming, isDriven, onStopStreaming])

  useEffect(() => {
    if (!text) return

    onFinish()
  }, [text, onFinish])

  return <MarkdownContent>{text}</MarkdownContent>
}
