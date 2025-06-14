import { ChatInput } from '@/components/chat-input'
import { WelcomeScreen } from '@/components/welcome-screen'
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
      <div className="w-full flex-1 flex flex-col gap-12 items-center justify-center">
        <WelcomeScreen />
        <ChatInput />
      </div>
    </div>
  )
}
