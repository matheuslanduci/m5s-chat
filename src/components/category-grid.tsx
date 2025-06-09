import {
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  OpenAIIcon
} from '@/components/provider-icons'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import type { BasicCategory } from '@/context/chat-context'
import {
  Brain,
  Code,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Lightbulb,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react'

interface CategoryItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  provider: 'openai' | 'google' | 'anthropic' | 'deepseek'
  model: string
}

interface CategoryGridProps {
  categories: CategoryItem[]
  selectedValue?: BasicCategory
  onSelect: (category: BasicCategory) => void
  compact?: boolean
}

export const basicCategories: CategoryItem[] = [
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

export function CategoryGrid({
  categories,
  selectedValue,
  onSelect,
  compact = false
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
    <div className={`grid gap-1.5 ${compact ? 'grid-cols-5' : 'grid-cols-4'}`}>
      {categories.map((category) => {
        const IconComponent = category.icon
        const ProviderIcon = getProviderIcon(category.provider)
        const isSelected = selectedValue === category.name

        return (
          <HoverCard key={category.name} openDelay={800}>
            <HoverCardTrigger asChild>
              <button
                onClick={() => onSelect(category.name as BasicCategory)}
                className={`${compact ? 'py-1.5 px-1' : 'py-2 px-1.5'} rounded-md border transition-all text-left group hover:border-primary/50 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
                type="button"
              >
                <div
                  className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-1.5'}`}
                >
                  <IconComponent
                    className={`${compact ? 'size-4' : 'size-5'} ${
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span
                    className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-center ${
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
