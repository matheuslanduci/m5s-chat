import { useMessage } from '@/chat/message'
import { useEffect } from 'react'
import { ChatMessage } from './chat-message'
import { MarkdownContent } from './markdown-content'

export function ChatRequests() {
  const { selectedMessageIndex, setSelectedMessageIndex, message } =
    useMessage()

  const request = message.contentHistory?.[selectedMessageIndex]

  useEffect(() => {
    if (message.contentHistory?.length) {
      setSelectedMessageIndex(message.contentHistory.length - 1)
    }
  }, [message.contentHistory, setSelectedMessageIndex])

  return (
    <ChatMessage
      author="user"
      creationTime={request?.createdAt || message._creationTime}
      currentRequestIndex={selectedMessageIndex}
      totalRequests={message.contentHistory?.length || 1}
      onRequestIndexChange={setSelectedMessageIndex}
    >
      <MarkdownContent>{request?.content || message.content}</MarkdownContent>
    </ChatMessage>
  )
}
