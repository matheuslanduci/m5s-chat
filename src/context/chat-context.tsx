import { useUser } from '@clerk/clerk-react'
import { useAction, useMutation, useQuery } from 'convex/react'
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
import type { Id } from '../../convex/_generated/dataModel'

// Types
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

export interface UserPreferences {
  theme?: string
  savedPrompt?: string
  generalPrompt?: string
  favoriteModel?: Id<'model'>
  favoriteCategory?: BasicCategory
  isAuto?: boolean
  uncategorized?: boolean
  autoSummarize?: boolean
}

export interface ChatContextValue {
  // Messages
  messages: Message[]

  // Input
  inputValue: string
  setInputValue: (value: string) => void

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
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  // Local state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Queries and mutations
  const userPreferences = useQuery(api.userPreference.getUserPreferences)
  const updateUserPreferencesMutation = useMutation(
    api.userPreference.upsertUserPreferences
  )
  const enhancePromptAction = useAction(api.ai.enhancePrompt)

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hello! I'm your AI assistant. How can I help you today?",
          timestamp: new Date()
        }
      ])
    }
  }, [messages.length])

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

  // Mock AI response (you can replace this with actual AI integration)
  const simulateAIResponse = useCallback(
    async (userMessage: string): Promise<string> => {
      // Simulate API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      )

      const responses = [
        "That's a great question! Let me think about that...",
        "I understand what you're asking. Here's my perspective:",
        "Interesting! I'd be happy to help you with that.",
        "That's something I can definitely assist you with.",
        "Great point! Here's what I think about that:",
        "I see what you're getting at. Let me provide some insights:"
      ]

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)]
      const elaboration = ` Based on your message about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}", I can see you're interested in exploring this topic further.`

      return randomResponse + elaboration
    },
    []
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
          description:
            result.unreliableReason ||
            'The prompt appears to be unclear or invalid.'
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

  // Send message function
  const send = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      const response = await simulateAIResponse(userMessage.content)

      // Remove typing indicator and add actual response
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping)
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date()
          }
        ]
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping)
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          }
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading, simulateAIResponse])

  // Pause function
  const pause = useCallback(() => {
    setIsLoading(false)
    setMessages((prev) => prev.filter((msg) => !msg.isTyping))
  }, [])

  // Clear history function
  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date()
      }
    ])
  }, [])

  const value: ChatContextValue = {
    messages,
    inputValue,
    setInputValue,
    send,
    pause,
    clearHistory,
    enhancePrompt,
    isLoading,
    userPreferences: userPreferences || null,
    updateUserPreference
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

// Keep legacy types for backward compatibility
export type BasicCategory =
  | 'Programming'
  | 'Roleplay'
  | 'Marketing'
  | 'SEO'
  | 'Technology'
  | 'Science'
  | 'Translation'
  | 'Legal'
  | 'Finance'
  | 'Health'
  | 'Trivia'
  | 'Academia'

export type AdvancedModel = string

export interface ModelSelection {
  mode: 'basic' | 'advanced' | 'auto'
  isAuto: boolean
  basic?: BasicCategory
  advanced?: AdvancedModel
  modelKey?: string
}
