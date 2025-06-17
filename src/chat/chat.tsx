import { useRouter } from '@tanstack/react-router'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
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
  setDrivenIds: React.Dispatch<React.SetStateAction<Set<string>>>
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
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  wrapperRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: (smooth?: boolean) => void
  isEditing: boolean
  setIsEditing: (editing: boolean, message: Doc<'message'> | null) => void
  editingMessageId: Id<'message'> | null
  summarizeChat: (chatId: Id<'chat'>) => void
  summary: string | null
}

export const chatContext = createContext<ChatContext>({} as ChatContext)

export function ChatProvider({
  children,
  chatId: initialChatId
}: { children: React.ReactNode; chatId?: string }) {
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)
  const [content, setContent] = useState('')
  const [previousContent, setPreviousContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [actionsEnabled, setActionsEnabled] = useState(true)
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<Doc<'attachment'>[]>([])
  const [cachedChats, setCachedChats] = useState<
    Map<Id<'chat'>, ChatWithMessages>
  >(new Map<Id<'chat'>, ChatWithMessages>())
  const [isEditing, setIsEditing] = useState(false)
  const [editingMessageId, setEditingMessageId] =
    useState<Id<'message'> | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const chat = useQuery(api.chat.getChat, chatId ? { chatId } : 'skip')
  const createChat = useAction(api.chat.createChat)
  const createMessage = useAction(api.message.createMessage)
  const createChatBranchMutation = useMutation(api.chat.createChatBranch)
  const retryMessageAction = useAction(api.message.retryMessage)
  const deleteAttachmentMutation = useMutation(api.attachment.deleteAttachment)
  const enhancePromptAction = useAction(api.ai.enhancePrompt)
  const editAndRetryMessageAction = useAction(api.message.editAndRetryMessage)
  const summarizeChatAction = useAction(api.ai.summarizeChat)

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

  const scrollToBottom = useCallback((smooth = false) => {
    if (wrapperRef.current) {
      wrapperRef.current.scroll({
        top: wrapperRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }, [])

  const send = useCallback(async () => {
    if (isSending || isStreaming) return

    setIsSending(true)

    if (isEditing && editingMessageId) {
      try {
        await editAndRetryMessageAction({
          messageId: editingMessageId,
          content
        })
      } catch (error) {
        console.error('Failed to edit message:', error)
        toast.error('Failed to edit message. Please try again.')
        return
      } finally {
        setIsEditing(false)
        setEditingMessageId(null)
      }

      setIsSending(false)
      setContent('')
      return
    }

    if (!chatId) {
      try {
        const contentTrimmed = content.trim()
        const clientId = crypto.randomUUID()
        const attachmentIds = attachments.map((attachment) => attachment._id)

        await router.navigate({
          to: '/chat/$id',
          params: { id: clientId },
          viewTransition: true
        })
        setAttachments([])
        setContent('')

        const { messageId } = await createChat({
          clientId,
          initialPrompt: contentTrimmed,
          attachments: attachmentIds
        })

        setDrivenIds((prev) => {
          prev.add(messageId)

          return prev
        })

        setIsStreaming(true)

        // Scroll to bottom after sending message
        setTimeout(() => scrollToBottom(true), 100)
      } catch (error) {
        console.error('Failed to create chat:', error)
        toast.error('Failed to create chat. Please try again.')
        return
      } finally {
        setIsSending(false)
      }

      return
    }

    try {
      const contentTrimmed = content.trim()
      const attachmentIds = attachments.map((attachment) => attachment._id)

      setContent('')
      setAttachments([])

      const { messageId } = await createMessage({
        chatId,
        content: contentTrimmed,
        attachments: attachmentIds
      })

      setDrivenIds((prev) => {
        prev.add(messageId)

        return prev
      })

      setIsStreaming(true)

      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
      return
    } finally {
      setIsSending(false)
    }
  }, [
    chatId,
    content,
    createChat,
    router,
    createMessage,
    isStreaming,
    isEditing,
    editingMessageId,
    editAndRetryMessageAction,
    attachments,
    scrollToBottom,
    isSending
  ])

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

  const setIsEditingCallback = useCallback(
    (editing: boolean, message: Doc<'message'> | null) => {
      if (editing && message) {
        setIsEditing(true)
        setEditingMessageId(message._id)
        textareaRef.current?.focus()
        setPreviousContent(content)
        setContent(message.content)
      } else {
        setIsEditing(false)
        setEditingMessageId(null)
        setContent(previousContent)
        textareaRef.current?.focus()
      }
    },
    [content, previousContent]
  )

  const summarizeChat = useCallback(
    async (chatId: Id<'chat'>) => {
      try {
        disableActions()

        const summary = await summarizeChatAction({ chatId })

        setSummary(summary)
      } catch (error) {
        console.error('Failed to summarize chat:', error)
        toast.error('Failed to summarize chat. Please try again.')
      } finally {
        enableActions()
      }
    },
    [summarizeChatAction, disableActions, enableActions]
  )

  return (
    <chatContext.Provider
      value={{
        wrapperRef,
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
        createChatBranch,
        textareaRef,
        scrollToBottom,
        isEditing,
        setIsEditing: setIsEditingCallback,
        editingMessageId,
        setDrivenIds,
        summarizeChat,
        summary
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
