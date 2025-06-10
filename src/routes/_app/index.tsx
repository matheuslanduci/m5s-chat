import { ChatInput } from '@/components/chat-input'
import { ChatMessages } from '@/components/chat-messages'
import { useChat } from '@/context/chat-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/')({
  component: RouteComponent
})

function RouteComponent() {
  const { clearHistory } = useChat()

  // Clear history when component mounts (user navigates to index page)
  useEffect(() => {
    clearHistory()
  }, [clearHistory])

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background">
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
