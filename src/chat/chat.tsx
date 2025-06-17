import { useRouter } from '@tanstack/react-router'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

type ChatWithMessages = Doc<'chat'> & {
  messages: Doc<'message'>[]
}

type ChatContext = {
  actionsEnabled: boolean
  addAttachment: (attachment: Doc<'attachment'>) => void
  removeAttachment: (attachmentId: Id<'attachment'>) => Promise<void>
  clearAttachments: () => Promise<void>
  attachments: Doc<'attachment'>[]
  chat: Doc<'chat'> | undefined | null
  disableActions: () => void
  enableActions: () => void
  drivenIds: Set<string>
  enhancePrompt: () => void
  content: string
  setContent: (content: string) => void
  send: () => void
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  chatId: string | undefined
  setChatId: (chatId: string | undefined) => void
  cachedChats: Map<Id<'chat'>, ChatWithMessages>
  cacheChat: (chat: ChatWithMessages) => void
  retryMessage: (messageId: Id<'message'>) => Promise<void>
  createChatBranch: (messageId: Id<'message'>) => Promise<void>
}

export const chatContext = createContext<ChatContext>({} as ChatContext)

export function ChatProvider({
  children,
  chatId: initialChatId
}: { children: React.ReactNode; chatId?: string }) {
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [actionsEnabled, setActionsEnabled] = useState(true)
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<Doc<'attachment'>[]>([])
  const [cachedChats, setCachedChats] = useState<
    Map<Id<'chat'>, ChatWithMessages>
  >(new Map<Id<'chat'>, ChatWithMessages>())

  const router = useRouter()

  const chat = useQuery(api.chat.getChat, chatId ? { chatId } : 'skip')
  const createChat = useAction(api.chat.createChat)
  const createMessage = useAction(api.message.createMessage)
  const createChatBranchMutation = useMutation(api.chat.createChatBranch)
  const retryMessageAction = useAction(api.message.retryMessage)
  const deleteAttachmentMutation = useMutation(api.attachment.deleteAttachment)
  const enhancePromptAction = useAction(api.ai.enhancePrompt)

  const addAttachment = useCallback((attachment: Doc<'attachment'>) => {
    setAttachments((prev) => [...prev, attachment])
  }, [])

  const removeAttachment = useCallback(
    async (attachmentId: Id<'attachment'>) => {
      try {
        setAttachments((prev) =>
          prev.filter((attachment) => attachment._id !== attachmentId)
        )

        await deleteAttachmentMutation({
          attachmentId
        })

        toast.success('Attachment removed successfully')
      } catch (error) {
        console.error('Failed to remove attachment:', error)
        toast.error('Failed to remove attachment')
      }
    },
    [deleteAttachmentMutation]
  )

  const clearAttachments = useCallback(async () => {
    try {
      setAttachments([])

      await Promise.all(
        attachments.map((attachment) =>
          deleteAttachmentMutation({ attachmentId: attachment._id })
        )
      )

      toast.success('All attachments cleared')
    } catch (error) {
      console.error('Failed to clear attachments:', error)
      toast.error('Failed to clear some attachments')
    }
  }, [deleteAttachmentMutation, attachments])

  const disableActions = useCallback(() => {
    setActionsEnabled(false)
  }, [])

  const enableActions = useCallback(() => {
    setActionsEnabled(true)
  }, [])

  const enhancePrompt = useCallback(async () => {
    if (!content) return

    disableActions()

    try {
      const { isReliable, enhancedPrompt } = await enhancePromptAction({
        prompt: content
      })

      if (!isReliable) {
        toast.error('Please provide a more assertive prompt for enhancement.')
        return
      }

      setContent(enhancedPrompt)
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
      toast.error('Failed to enhance prompt')
    } finally {
      enableActions()
    }
  }, [content, disableActions, enableActions, enhancePromptAction])

  const send = useCallback(async () => {
    if (isStreaming) return

    if (!chatId) {
      try {
        const contentTrimmed = content.trim()
        const clientId = crypto.randomUUID()

        await router.navigate({
          to: '/chat/$id',
          params: { id: clientId },
          viewTransition: true
        })
        setContent('')

        const { messageId } = await createChat({
          clientId,
          initialPrompt: contentTrimmed
        })

        setDrivenIds((prev) => {
          prev.add(messageId)

          return prev
        })

        setIsStreaming(true)
      } catch (error) {
        console.error('Failed to create chat:', error)
        toast.error('Failed to create chat. Please try again.')
        return
      }

      return
    }

    try {
      const contentTrimmed = content.trim()

      setContent('')

      const { messageId } = await createMessage({
        chatId,
        content: contentTrimmed
      })

      setDrivenIds((prev) => {
        prev.add(messageId)

        return prev
      })

      setIsStreaming(true)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
      return
    }
  }, [chatId, content, createChat, router, createMessage, isStreaming])

  const retryMessage = useCallback(
    async (messageId: Id<'message'>) => {
      if (isStreaming) return

      try {
        await retryMessageAction({
          messageId
        })

        setDrivenIds((prev) => {
          prev.add(messageId)

          return prev
        })

        setIsStreaming(true)
      } catch (error) {
        console.error('Failed to retry message:', error)
        toast.error('Failed to retry message. Please try again.')
      }
    },
    [retryMessageAction, isStreaming]
  )

  const cacheChat = useCallback((chat: ChatWithMessages) => {
    setCachedChats((prev) => {
      prev.set(chat._id, chat)
      return prev
    })
  }, [])

  const createChatBranch = useCallback(
    async (messageId: Id<'message'>) => {
      try {
        const clientId = crypto.randomUUID()

        disableActions()

        await router.navigate({
          to: '/chat/$id',
          params: { id: clientId },
          viewTransition: true
        })

        await createChatBranchMutation({
          clientId,
          messageId
        })
      } catch (error) {
        console.error('Failed to create chat branch:', error)
        toast.error('Failed to create chat branch. Please try again.')
      } finally {
        enableActions()
      }
    },
    [createChatBranchMutation, disableActions, enableActions, router]
  )

  return (
    <chatContext.Provider
      value={{
        drivenIds,
        chat,
        actionsEnabled,
        attachments,
        addAttachment,
        disableActions,
        enableActions,
        removeAttachment,
        clearAttachments,
        content,
        setContent,
        enhancePrompt,
        send,
        isStreaming,
        setIsStreaming,
        chatId,
        setChatId,
        cachedChats,
        cacheChat,
        retryMessage,
        createChatBranch
      }}
    >
      {children}
    </chatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(chatContext)

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}
