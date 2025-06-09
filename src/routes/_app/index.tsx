import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUp,
  Bot,
  Brain,
  ChevronDown,
  Code,
  Copy,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  Paperclip,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_app/')({
  component: RouteComponent
})

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

type BasicCategory =
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

type AdvancedModel =
  | 'GPT-4 Turbo'
  | 'GPT-4'
  | 'Claude 3.5 Sonnet'
  | 'Claude 3 Opus'
  | 'Gemini Pro'
  | 'Llama 3.1 70B'
  | 'Mistral Large'

interface ModelSelection {
  mode: 'basic' | 'advanced'
  isAuto: boolean
  basic?: BasicCategory
  advanced?: AdvancedModel
}

interface SearchableOptionsProps {
  options: string[]
  selectedValue?: string
  onSelect: (value: string) => void
  isOpen?: boolean
}

interface CategoryItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  provider: 'openai' | 'google' | 'anthropic' | 'deepseek'
  model: string
}

// Provider Icon Components
const OpenAIIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    aria-label="OpenAI"
  >
    <title>OpenAI</title>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>
)

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    aria-label="Google Gemini"
  >
    <title>Google Gemini</title>
    <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
  </svg>
)

const AnthropicIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    aria-label="Anthropic"
  >
    <title>Anthropic</title>
    <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
  </svg>
)

const DeepSeekIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    aria-label="DeepSeek"
  >
    <title>DeepSeek</title>
    <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
  </svg>
)

const basicCategories: CategoryItem[] = [
  {
    name: 'Programming',
    icon: Code,
    description: 'Optimized for coding and technical tasks',
    provider: 'anthropic',
    model: 'Claude 3.5 Sonnet'
  },
  {
    name: 'Roleplay',
    icon: Users,
    description: 'Creative character interactions and storytelling',
    provider: 'openai',
    model: 'GPT-4o-mini'
  },
  {
    name: 'Marketing',
    icon: TrendingUp,
    description: 'Content creation and marketing strategies',
    provider: 'anthropic',
    model: 'Claude 3.5 Sonnet'
  },
  {
    name: 'SEO',
    icon: Globe,
    description: 'Search engine optimization and web content',
    provider: 'google',
    model: 'Gemini 2.0 Flash'
  },
  {
    name: 'Technology',
    icon: Lightbulb,
    description: 'Tech discussions and innovations',
    provider: 'deepseek',
    model: 'DeepSeek V3'
  },
  {
    name: 'Science',
    icon: Brain,
    description: 'Scientific research and analysis',
    provider: 'google',
    model: 'Gemini 2.5 Pro'
  },
  {
    name: 'Translation',
    icon: FileText,
    description: 'Language translation and localization',
    provider: 'openai',
    model: 'GPT-4o-mini'
  },
  {
    name: 'Legal',
    icon: Shield,
    description: 'Legal advice and document analysis',
    provider: 'anthropic',
    model: 'Claude 3.5 Sonnet'
  },
  {
    name: 'Finance',
    icon: DollarSign,
    description: 'Financial planning and analysis',
    provider: 'google',
    model: 'Gemini 2.5 Pro'
  },
  {
    name: 'Health',
    icon: Heart,
    description: 'Health and wellness information',
    provider: 'google',
    model: 'Gemini 2.5 Pro'
  },
  {
    name: 'Trivia',
    icon: HelpCircle,
    description: 'Fun facts and general knowledge',
    provider: 'deepseek',
    model: 'DeepSeek V3'
  },
  {
    name: 'Academia',
    icon: GraduationCap,
    description: 'Academic research and education',
    provider: 'anthropic',
    model: 'Claude 3.5 Sonnet'
  }
]

interface CategoryGridProps {
  categories: CategoryItem[]
  selectedValue?: BasicCategory
  onSelect: (category: BasicCategory) => void
}

function CategoryGrid({
  categories,
  selectedValue,
  onSelect
}: CategoryGridProps) {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return OpenAIIcon
      case 'google':
        return GoogleIcon
      case 'anthropic':
        return AnthropicIcon
      case 'deepseek':
        return DeepSeekIcon
      default:
        return Brain
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((category) => {
        const IconComponent = category.icon
        const ProviderIcon = getProviderIcon(category.provider)
        const isSelected = selectedValue === category.name

        return (
          <HoverCard key={category.name} openDelay={800}>
            <HoverCardTrigger asChild>
              <button
                onClick={() => onSelect(category.name as BasicCategory)}
                className={`py-3 px-2 rounded-lg border-2 transition-all text-left group hover:border-primary/50 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
                type="button"
              >
                <div className="flex flex-col items-center gap-2">
                  <IconComponent
                    className={`size-6 ${
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium text-center ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" className="w-64">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconComponent className="size-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{category.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <ProviderIcon className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {category.model}
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      })}
    </div>
  )
}

function BasicModeContent({
  modelSelection,
  setModelSelection
}: {
  modelSelection: ModelSelection
  setModelSelection: (selection: ModelSelection) => void
}) {
  return (
    <div className="space-y-4">
      {/* Auto Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <Zap className="size-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Auto Mode</p>
            <p className="text-xs text-muted-foreground">
              Let AI choose the best model for your task
            </p>
          </div>
        </div>
        <Switch
          checked={modelSelection.isAuto}
          onCheckedChange={(checked) =>
            setModelSelection({
              ...modelSelection,
              isAuto: checked
            })
          }
        />
      </div>

      {/* Category Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-medium">Choose a category</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-4 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  The best model from OpenRouter ranking will be picked for each
                  category
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CategoryGrid
          categories={basicCategories}
          selectedValue={modelSelection.basic}
          onSelect={(category) =>
            setModelSelection({
              mode: 'basic',
              isAuto: false,
              basic: category
            })
          }
        />
      </div>
    </div>
  )
}

function SearchableOptions({
  options,
  selectedValue,
  onSelect,
  isOpen
}: SearchableOptionsProps) {
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Map models to their providers
  const getModelProvider = (
    model: string
  ): 'openai' | 'google' | 'anthropic' | 'deepseek' | null => {
    if (model.includes('GPT')) return 'openai'
    if (model.includes('Claude')) return 'anthropic'
    if (model.includes('Gemini')) return 'google'
    if (model.includes('Llama') || model.includes('Mistral')) return null // No specific icons for these
    return null
  }

  const getProviderIcon = (provider: string | null) => {
    switch (provider) {
      case 'openai':
        return OpenAIIcon
      case 'google':
        return GoogleIcon
      case 'anthropic':
        return AnthropicIcon
      case 'deepseek':
        return DeepSeekIcon
      default:
        return null
    }
  }

  // Auto-focus search input when dropdown opens and reset search when closed
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 150)
      return () => clearTimeout(timer)
    }

    if (!isOpen) {
      setSearch('')
    }
  }, [isOpen])

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground/60" />
        <Input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="pl-10 h-9 text-sm border-border/50 focus:border-primary/50 bg-muted/30 rounded-lg"
          onKeyDown={(e) => {
            // Prevent dropdown from closing when typing
            if (e.key !== 'Escape') {
              e.stopPropagation()
            }
          }}
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredOptions.map((option) => {
          const provider = getModelProvider(option)
          const ProviderIcon = getProviderIcon(provider)

          return (
            <DropdownMenuItem
              key={option}
              onSelect={() => onSelect(option)}
              className={`text-sm h-9 px-3 rounded-md cursor-pointer ${
                selectedValue === option
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                {ProviderIcon && (
                  <ProviderIcon className="size-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="flex-1">{option}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
        {filteredOptions.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No models found
          </div>
        )}
      </div>
    </div>
  )
}

function RouteComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    mode: 'basic',
    isAuto: true,
    basic: 'Programming'
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    )
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  })

  // Mock AI response function
  const simulateAIResponse = async (
    userMessage: string,
    model: ModelSelection
  ): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    )

    const modelInfo =
      model.mode === 'basic'
        ? `Using ${model.basic} optimization`
        : `Using ${model.advanced} model`

    const responses = [
      `${modelInfo}: That's a great question! Let me think about that...`,
      `${modelInfo}: I understand what you're asking. Here's my perspective on that topic:`,
      `${modelInfo}: Interesting! I'd be happy to help you with that.`,
      `${modelInfo}: That's something I can definitely assist you with. Let me break it down:`,
      `${modelInfo}: Great point! Here's what I think about that:`,
      `${modelInfo}: I see what you're getting at. Let me provide some insights:`
    ]

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)]
    const elaboration = ` Based on your message about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}", I can see you're interested in exploring this topic further. I'm here to provide helpful and accurate information to assist you.`

    return randomResponse + elaboration
  }

  const handleSendMessage = async () => {
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
      const response = await simulateAIResponse(
        userMessage.content,
        modelSelection
      )

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
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getModelDisplayName = () => {
    if (modelSelection.isAuto) {
      return 'Auto'
    }
    if (modelSelection.mode === 'basic') {
      return modelSelection.basic
    }
    return modelSelection.advanced
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-6 text-primary" />
              <h1 className="text-xl font-semibold">AI Chat</h1>
            </div>
            <Badge variant="secondary" className="gap-1">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Card
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card'
                    }`}
                  >
                    <CardContent className="p-3">
                      {message.isTyping ? (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="size-2 bg-muted-foreground rounded-full animate-bounce" />
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            AI is typing...
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6"
                                    >
                                      <Copy className="size-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy message</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6"
                                    >
                                      <ThumbsUp className="size-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Like message</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6"
                                    >
                                      <ThumbsDown className="size-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Dislike message</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-6"
                                    >
                                      <RotateCcw className="size-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Regenerate response</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {message.role === 'user' && (
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            {/* Unified Input Container */}
            <div className="border rounded-lg bg-background p-2">
              {/* Message Input */}
              <div className="mb-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="border-0 px-2 shadow-none focus-visible:ring-0 min-h-12 max-h-32 resize-none bg-transparent"
                  rows={1}
                />
              </div>

              {/* Bottom Row: Model Selection, Attachment, Enhance & Send */}
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu
                      open={isDropdownOpen}
                      onOpenChange={setIsDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-left justify-start h-7 px-2 text-xs font-normal"
                        >
                          <Brain className="size-3" />
                          <span className="flex-1 truncate">
                            {getModelDisplayName()}
                          </span>
                          <ChevronDown className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-96 p-4" align="start">
                        <Tabs
                          value={modelSelection.mode}
                          onValueChange={(value) =>
                            setModelSelection({
                              ...modelSelection,
                              mode: value as 'basic' | 'advanced'
                            })
                          }
                        >
                          <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
                            <TabsTrigger
                              value="basic"
                              className="gap-1 text-sm h-7"
                            >
                              <Zap className="size-3" />
                              Basic
                            </TabsTrigger>
                            <TabsTrigger
                              value="advanced"
                              className="gap-1 text-sm h-7"
                            >
                              <Settings className="size-3" />
                              Advanced
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="basic" className="mt-0">
                            <BasicModeContent
                              modelSelection={modelSelection}
                              setModelSelection={setModelSelection}
                            />
                          </TabsContent>

                          <TabsContent value="advanced" className="mt-0">
                            <SearchableOptions
                              options={[
                                'GPT-4 Turbo',
                                'GPT-4',
                                'Claude 3.5 Sonnet',
                                'Claude 3 Opus',
                                'Gemini Pro',
                                'Llama 3.1 70B',
                                'Mistral Large'
                              ]}
                              selectedValue={modelSelection.advanced}
                              onSelect={(model) =>
                                setModelSelection({
                                  ...modelSelection,
                                  mode: 'advanced',
                                  isAuto: false,
                                  advanced: model as AdvancedModel
                                })
                              }
                              isOpen={
                                isDropdownOpen &&
                                modelSelection.mode === 'advanced'
                              }
                            />
                          </TabsContent>
                        </Tabs>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select AI model</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-7"
                    >
                      <Paperclip className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex-1" />

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 size-7"
                      >
                        <Sparkles className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhance prompt</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                        className="size-7"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
