import { useChat } from '@/chat/chat'
import { ChatBox } from '@/components/chat-box'
import { ChatHeader } from '@/components/chat-header'
import { ChatMessages } from '@/components/chat-messages'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/_chat/chat/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { setChatId } = useChat()

  useEffect(() => {
    if (id) {
      setChatId(id)
    }
  }, [id, setChatId])

  return (
    <>
      <ChatHeader />

      {/* Sorry, Theo, stole your code for the wrapper */}

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col flex-1 min-w-0 bg-background">
              <div className="absolute top-0 bottom-0 w-full">
                <div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
                  <div className="relative mx-auto text-center">
                    <ChatBox />
                  </div>
                </div>

                <div
                  className="absolute inset-0 overflow-y-scroll sm:pt-12 z-[5]"
                  style={{
                    paddingBottom: 160,
                    scrollbarGutter: 'stable both-edges'
                  }}
                >
                  <ChatMessages />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
