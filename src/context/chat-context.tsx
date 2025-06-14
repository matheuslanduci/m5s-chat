import { useModelSelection } from '@/hooks/use-model-selection'
import type { BasicCategory } from '@/hooks/use-model-selection'
import { useUser } from '@clerk/clerk-react'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useNavigate } from '@tanstack/react-router'
import { useAction, useMutation, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'

// Types
export type Attachment = {
  id: Id<'attachment'>
  format: 'image' | 'pdf'
  url: string
  name: string
}

type Message = Doc<'message'>

export type UserPreferences = {
  theme?: string
  savedPrompt?: string
  generalPrompt?: string
  favoriteModel?: Id<'model'>
  favoriteCategory?: BasicCategory
  isAuto?: boolean
  uncategorized?: boolean
  autoSummarize?: boolean
}

export type ChatContextValue = {
  // Chat title
  title: string

  // Messages
  messages: Message[]

  // Streaming
  currentStreamId: StreamId | null
  drivenIds: Set<StreamId> // Set of stream IDs that this client should drive
  addDrivenId: (streamId: StreamId) => void // Helper to add a stream ID to drive
  removeDrivenId: (streamId: StreamId) => void // Helper to remove a stream ID from drive
  clearDrivenIds: () => void // Helper to clear all driven IDs

  // Input
  inputValue: string
  setInputValue: (value: string) => void

  // Attachments
  attachments: Attachment[]
  addAttachment: (attachment: Attachment) => void
  removeAttachment: (attachmentId: Id<'attachment'>) => Promise<void>
  clearAttachments: () => void

  // Actions
  send: () => Promise<void>
  pause: () => void
  clearHistory: () => void
  enhancePrompt: () => Promise<void>

  // State
  isLoading: boolean

  // Preferences
  userPreferences: UserPreferences | null
  updateUserPreference: (updates: Partial<UserPreferences>) => Promise<void>

  // Raw chat
  chat: Doc<'chat'> | null
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

interface ChatProviderProps {
  children: React.ReactNode
  chatId?: Id<'chat'> // Optional chatId for existing chat mode
}

export function ChatProvider({ children, chatId }: ChatProviderProps) {
  const { user } = useUser()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [currentStreamId, setCurrentStreamId] = useState<StreamId | null>(null)
  const [drivenIds, setDrivenIds] = useState<Set<StreamId>>(new Set())

  const { selection, selectedModel } = useModelSelection()

  const userPreferences = useQuery(api.userPreference.getUserPreferences)
  const existingChat = useQuery(
    api.chat.getChatById,
    chatId ? { chatId } : 'skip'
  )
  const existingMessages = useQuery(
    api.message.getMessagesByChatId,
    chatId ? { chatId } : 'skip'
  )
  const updateUserPreferencesMutation = useMutation(
    api.userPreference.upsertUserPreferences
  )
  const enhancePromptAction = useAction(api.ai.enhancePrompt)
  const createChatAction = useAction(api.chat.createChat)
  const deleteAttachmentMutation = useMutation(api.attachment.deleteAttachment)
  const sendMessageMutation = useMutation(api.message.sendMessage)

  const title = existingChat?.title || 'New Chat' // Set the current stream ID for existing chats
  useEffect(() => {
    if (existingChat?.streamId) {
      setCurrentStreamId(existingChat.streamId as StreamId)
      // Don't drive the stream for existing chats unless we're actively sending
      setDrivenIds(new Set())
    }
  }, [existingChat?.streamId])

  const addAttachment = useCallback((attachment: Attachment) => {
    setAttachments((prev) => [...prev, attachment])
  }, [])

  const removeAttachment = useCallback(
    async (attachmentId: Id<'attachment'>) => {
      try {
        setAttachments((prev) => prev.filter((att) => att.id !== attachmentId))

        await deleteAttachmentMutation({ attachmentId })

        toast.success('Attachment removed')
      } catch (error) {
        console.error('Failed to delete attachment:', error)
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
          deleteAttachmentMutation({ attachmentId: attachment.id })
        )
      )

      toast.success('All attachments cleared')
    } catch (error) {
      console.error('Failed to clear attachments:', error)
      toast.error('Failed to clear some attachments')
    }
  }, [deleteAttachmentMutation, attachments])

  // Preferences update function
  const updateUserPreference = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user?.id) return

      try {
        await updateUserPreferencesMutation(updates)
      } catch (error) {
        console.error('Failed to update user preferences:', error)
        toast.error('Failed to update preferences')
      }
    },
    [user?.id, updateUserPreferencesMutation]
  )

  // Enhance prompt function
  const enhancePrompt = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    try {
      setIsLoading(true)
      const result = await enhancePromptAction({
        userPrompt: inputValue.trim(),
        generalPrompt: userPreferences?.generalPrompt
      })

      if (result.isReliable) {
        setInputValue(result.enhancedPrompt)
      } else {
        toast.warning('Unable to enhance prompt', {
          description: 'The prompt appears to be unclear or invalid.'
        })
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
      toast.error('Enhancement failed', {
        description: 'Unable to enhance the prompt. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    inputValue,
    isLoading,
    enhancePromptAction,
    userPreferences?.generalPrompt
  ])

  const send = useCallback(async () => {
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return

    const messageContent = inputValue.trim()
    if (!messageContent && attachments.length === 0) return

    try {
      setIsLoading(true)

      if (chatId) {
        const { streamId } = await sendMessageMutation({
          chatId,
          content: messageContent || '[File(s) attached]',
          attachments: attachments.map((att) => att.id)
        })

        // Clear input and attachments
        setInputValue('')
        setAttachments([]) // Set up streaming for AI response
        if (streamId) {
          setCurrentStreamId(streamId as StreamId)
          setDrivenIds((prev) => new Set([...prev, streamId as StreamId])) // This client drives the stream
        }

        toast.success('Message sent!')
      } else {
        // New chat mode - create new chat
        // Determine model selection parameters based on current selection
        let modelType: 'auto' | 'category' | 'key'
        let model: string | undefined
        let category: string | undefined

        switch (selection.mode) {
          case 'auto':
            modelType = 'auto'
            break
          case 'category': {
            modelType = 'category'
            category = selection.category
            break
          }
          case 'model': {
            modelType = 'key'
            model = selectedModel?.key
            break
          }
          default:
            modelType = 'auto'
        }
        const result = await createChatAction({
          prompt: messageContent || '[File(s) attached]',
          modelType,
          model,
          category: category as BasicCategory
        })

        setCurrentStreamId(result.streamId as StreamId)
        setDrivenIds((prev) => new Set([...prev, result.streamId as StreamId])) // This client drives the stream

        setInputValue('')
        setAttachments([])

        await navigate({
          to: '/chat/$chatId',
          params: { chatId: result.chatId },
          viewTransition: true
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [
    inputValue,
    attachments,
    isLoading,
    chatId,
    sendMessageMutation,
    selection,
    selectedModel,
    createChatAction,
    navigate
  ])

  const pause = useCallback(() => {
    setIsLoading(false)
    //setMessages((prev) => prev.filter((msg) => !msg.isTyping))
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  // Helper functions for managing driven IDs
  const addDrivenId = useCallback((streamId: StreamId) => {
    setDrivenIds((prev) => new Set([...prev, streamId]))
  }, [])

  const removeDrivenId = useCallback((streamId: StreamId) => {
    setDrivenIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(streamId)
      return newSet
    })
  }, [])

  const clearDrivenIds = useCallback(() => {
    setDrivenIds(new Set())
  }, [])

  if (chatId && existingChat === undefined) {
    return (
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 mb-4 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (chatId && existingChat === null) {
    return (
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
            <p className="text-muted-foreground">
              The chat you're looking for doesn't exist or you don't have access
              to it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const value: ChatContextValue = {
    messages: existingMessages || messages,
    currentStreamId,
    drivenIds,
    addDrivenId,
    removeDrivenId,
    clearDrivenIds,
    inputValue,
    setInputValue,
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    send,
    pause,
    clearHistory,
    enhancePrompt,
    isLoading,
    userPreferences: userPreferences || null,
    updateUserPreference,
    title,
    chat: existingChat || null
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}
