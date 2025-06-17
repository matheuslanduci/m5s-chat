import type { Doc } from 'convex/_generated/dataModel'
import { createContext, useContext, useState } from 'react'

type MessageContext = {
  message: Doc<'message'>
  selectedReplyIndex: number
  setSelectedReplyIndex: (index: number) => void
  selectedMessageIndex: number
  setSelectedMessageIndex: (index: number) => void
}

export const messageContext = createContext<MessageContext>(
  {} as MessageContext
)

export function MessageProvider({
  children,
  message
}: {
  children: React.ReactNode
  message: Doc<'message'>
}) {
  const [selectedReplyIndex, setSelectedReplyIndex] = useState<number>(
    message.responses?.length ? message.responses.length - 1 : 0
  )
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(
    message.contentHistory?.length ? message.contentHistory.length - 1 : 0
  )

  return (
    <messageContext.Provider
      value={{
        message,
        selectedReplyIndex,
        setSelectedReplyIndex,
        selectedMessageIndex,
        setSelectedMessageIndex
      }}
    >
      {children}
    </messageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(messageContext)

  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }

  return context
}
