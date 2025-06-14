import { ChatMessage } from '@/components/chat-message'
import { StreamingMessage } from '@/components/streaming-message'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@/context/chat-context'
import { useCallback, useRef } from 'react'

export function ChatMessages() {
  const { messages, currentStreamId, drivenIds, removeDrivenId } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    )
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message._id} message={message} />
          ))}
          {currentStreamId && (
            <StreamingMessage
              streamId={currentStreamId}
              shouldStream={drivenIds.has(currentStreamId)}
              onTextUpdate={scrollToBottom}
              onStop={() => {
                removeDrivenId(currentStreamId)
                scrollToBottom()
              }}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
