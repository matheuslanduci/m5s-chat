import { useChat } from '@/chat/chat'
import { useStream } from '@/hooks/use-stream'
import type { Id } from 'convex/_generated/dataModel'
import { Ellipsis } from 'lucide-react'
import { useEffect } from 'react'
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
  const { scrollToBottom } = useChat()
  const { text, status } = useStream({
    isDriven,
    messageId
  })

  useEffect(() => {
    if (!isDriven) return

    if (status === 'done' || status === 'error' || status === 'timeout') {
      onStopStreaming()
    }
  }, [status, onStopStreaming, isDriven])

  useEffect(() => {
    if (!text) return

    onFinish()
  }, [text, onFinish])

  // Auto-scroll when text is being streamed
  useEffect(() => {
    if (text && isDriven && (status === 'streaming' || status === 'pending')) {
      scrollToBottom(true)
    }
  }, [text, isDriven, status, scrollToBottom])

  if (!text) return <Ellipsis className="animate-pulse text-muted-foreground" />

  return <MarkdownContent>{text}</MarkdownContent>
}
