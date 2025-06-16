import { useChat } from '@/chat/chat'
import { ChatBox } from '@/components/chat-box'
import { ChatHeader } from '@/components/chat-header'
import { WelcomeScreen } from '@/components/welcome-screen'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/_chat/')({
  component: RouteComponent
})

function RouteComponent() {
  const { setChatId } = useChat()

  useEffect(() => {
    setChatId(undefined)
  }, [setChatId])

  return (
    <>
      <ChatHeader />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col flex-1 min-w-0 bg-background">
              <div className="w-full flex-1 flex flex-col gap-12 items-center justify-center">
                <WelcomeScreen />
                <ChatBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
