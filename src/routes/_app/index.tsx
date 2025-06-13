import { ChatInput } from '@/components/chat-input'
import { ChatMessages } from '@/components/chat-messages'
import { WelcomeScreen } from '@/components/welcome-screen'
import { useChat } from '@/context/chat-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/')({
  component: RouteComponent
})

function RouteComponent() {
  const { clearHistory, messages } = useChat()

  // Clear history when component mounts (user navigates to index page)
  useEffect(() => {
    clearHistory()
  }, [clearHistory])

  // Check if we have any user messages (exclude the default assistant welcome message)
  const hasUserMessages = messages.some((message) => message.role === 'user')

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-background">
      {hasUserMessages ? (
        <>
          <ChatMessages />
          <ChatInput />
        </>
      ) : (
        <>
          <WelcomeScreen />
          <ChatInput />
        </>
      )}
    </div>
  )
}
