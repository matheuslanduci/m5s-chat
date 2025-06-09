import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat-message'
import { useChat } from '@/context/chat-context'
import { useEffect, useRef } from 'react'

export function ChatMessages() {
  const { messages } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    )
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
