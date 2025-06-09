import { ChatHeader } from '@/components/chat-header'
import { ChatMessages } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useChat } from '@/context/chat-context'

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
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
