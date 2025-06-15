import { type BasicCategory, useModelSelection } from '@/chat/model-selection'
import type { Id } from 'convex/_generated/dataModel'
import {
  Bot,
  Brain,
  ChevronDown,
  Code,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Lightbulb,
  Loader2,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { CategoryGrid } from './category-grid'
import { ModelList } from './model-list'
import {
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  OpenAIIcon
} from './provider-icons'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const categoryIcons = {
  Programming: Code,
  Roleplay: Users,
  Marketing: TrendingUp,
  SEO: Globe,
  Technology: Lightbulb,
  Science: Brain,
  Translation: FileText,
  Legal: Shield,
  Finance: DollarSign,
  Health: Heart,
  Trivia: HelpCircle,
  Academia: GraduationCap
} as const

const providerIcons = {
  openai: OpenAIIcon,
  google: GoogleIcon,
  anthropic: AnthropicIcon,
  deepseek: DeepSeekIcon
} as const

const categoryMeta = {
  Programming: {
    icon: Code,
    description: 'Optimized for coding and technical tasks'
  },
  Roleplay: {
    icon: Users,
    description: 'Creative character interactions and storytelling'
  },
  Marketing: {
    icon: TrendingUp,
    description: 'Content creation and marketing strategies'
  },
  SEO: {
    icon: Globe,
    description: 'Search engine optimization and web content'
  },
  Technology: {
    icon: Lightbulb,
    description: 'Tech discussions and innovations'
  },
  Science: {
    icon: Brain,
    description: 'Scientific research and analysis'
  },
  Translation: {
    icon: FileText,
    description: 'Language translation and localization'
  },
  Legal: {
    icon: Shield,
    description: 'Legal advice and document analysis'
  },
  Finance: {
    icon: DollarSign,
    description: 'Financial planning and analysis'
  },
  Health: {
    icon: Heart,
    description: 'Health and wellness information'
  },
  Trivia: {
    icon: HelpCircle,
    description: 'Fun facts and general knowledge'
  },
  Academia: {
    icon: GraduationCap,
    description: 'Academic research and education'
  }
} as const

type ModelSelectorProps = {
  onClose: () => void
}

export function ModelSelector({ onClose }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    selection,
    isFetching,
    setAutoMode,
    setCategoryMode,
    setModelMode,
    displayName,
    categoriesWithModels,
    models
  } = useModelSelection()

  const [selectedTab, setSelectedTab] = useState<'basic' | 'advanced'>(
    selection.defaultModelSelection === 'auto'
      ? 'basic'
      : selection.defaultModelSelection === 'category'
        ? 'basic'
        : 'advanced'
  )

  const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const shortcutKey = isMac ? '⌘' : 'Ctrl'

  const tooltipText = useMemo(() => {
    const baseText = `Select AI model (${shortcutKey} + L)`

    switch (selection.defaultModelSelection) {
      case 'auto':
        return `${baseText} • Auto mode active`
      case 'category':
        return `${baseText} • Category: ${selection.defaultCategory}`
      case 'model':
        return `${baseText} • Model: ${selection.defaultModel?.name || 'Unknown'}`
      default:
        return baseText
    }
  }, [selection, shortcutKey])

  const handleAutoToggle = (checked: boolean) => {
    if (checked) {
      setAutoMode()
    } else {
      if (selectedTab === 'basic') {
        const firstCategory = categoriesWithModels[0]?.category

        if (firstCategory) {
          setCategoryMode(firstCategory)
        }
      } else if (selectedTab === 'advanced') {
        const firstModel = models[0]?._id

        if (firstModel) {
          setModelMode(firstModel)
        }
      }
    }
  }

  useHotkeys(
    'meta+l,ctrl+l',
    (e) => {
      e.preventDefault()
      handleOpenChange(!isOpen)
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true
    }
  )

  const SelectionIcon = useMemo(() => {
    if (isFetching) {
      return Loader2
    }

    if (!selection) {
      return Bot
    }

    switch (selection.defaultModelSelection) {
      case 'auto':
        return Zap
      case 'category':
        if (
          selection.defaultCategory &&
          categoryIcons[selection.defaultCategory]
        ) {
          return categoryIcons[selection.defaultCategory]
        }
        return Bot
      case 'model':
        if (
          selection.defaultModel?.provider &&
          providerIcons[
            selection.defaultModel.provider as keyof typeof providerIcons
          ]
        ) {
          return providerIcons[
            selection.defaultModel.provider as keyof typeof providerIcons
          ]
        }
        return Bot
      default:
        return Bot
    }
  }, [selection, isFetching])

  const handleCategorySelect = (category: BasicCategory) => {
    setCategoryMode(category)
    handleOpenChange(false)
  }

  const handleModelSelect = (modelId: Id<'model'>) => {
    setModelMode(modelId)
    handleOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && onClose) {
      onClose()
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-left justify-start h-7 px-2 text-xs font-normal"
            onClick={() => setIsOpen(!isOpen)}
          >
            <SelectionIcon
              className={`size-3 ${isFetching ? 'animate-spin' : ''}`}
            />
            <span className="flex-1 truncate">{displayName}</span>
            <ChevronDown className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl h-[90vh] !max-h-[536px] sm:h-[80vh] sm:max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="size-5" />
              Model Selection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 sm:gap-3">
                <Zap className="size-4 sm:size-5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium">Auto Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Let AI choose the best model for your task
                  </p>
                </div>
              </div>
              <Switch
                checked={selection.defaultModelSelection === 'auto'}
                onCheckedChange={handleAutoToggle}
              />
            </div>
            <Separator />
            <Tabs
              value={selectedTab}
              onValueChange={(val) =>
                setSelectedTab(val as 'basic' | 'advanced')
              }
              className="w-full flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Zap className="size-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="flex items-center gap-2"
                >
                  <Settings className="size-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="basic"
                className="mt-4 sm:mt-6 flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-shrink-0">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <p className="sm:text-xs text-[.625rem] text-muted-foreground ml-auto">
                      Choose a category to optimize AI responses
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <CategoryGrid
                      categories={categoriesWithModels.map((c) => {
                        const meta = categoryMeta[c.category]

                        return {
                          name: c.category,
                          icon: meta.icon,
                          description: meta.description,
                          provider: c.model?.provider || 'openai',
                          model: c.model?.name || 'Unknown'
                        }
                      })}
                      selectedValue={
                        selection.defaultModelSelection === 'category'
                          ? selection.defaultCategory
                          : undefined
                      }
                      onSelect={handleCategorySelect}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="advanced"
                className="mt-4 sm:mt-6 flex-1 flex flex-col min-h-0"
              >
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-shrink-0">
                    <h3 className="text-sm font-medium">Model Selection</h3>
                    <p className="text-[.625rem] sm:text-xs text-muted-foreground ml-auto">
                      Select a specific model for precise control
                    </p>
                  </div>
                  <div className="min-h-0">
                    <ModelList
                      models={models}
                      selectedModelId={
                        selection.defaultModelSelection === 'model'
                          ? selection.defaultModelId
                          : undefined
                      }
                      onSelect={handleModelSelect}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
