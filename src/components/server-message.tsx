import { useStream } from '@/hooks/use-stream'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect, useMemo } from 'react'
import { MarkdownContent } from './markdown-content'

type ServerMessageProps = {
  onFinish: () => void
  onStopStreaming: () => void
  isDriven: boolean
  messageId?: Id<'message'> | undefined
}

export function ServerMessage({
  onFinish,
  onStopStreaming,
  isDriven,
  messageId
}: ServerMessageProps) {
  console.log('ServerMessage', {
    isDriven,
    messageId
  })
  const { text, status } = useStream({
    isDriven,
    messageId
  })

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false

    return status === 'streaming' || status === 'pending'
  }, [isDriven, status])

  useEffect(() => {
    if (isCurrentlyStreaming || !isDriven) return

    onStopStreaming()
  }, [isCurrentlyStreaming, isDriven, onStopStreaming])

  useEffect(() => {
    if (!text) return

    onFinish()
  }, [text, onFinish])

  return <MarkdownContent>{text}</MarkdownContent>
}
