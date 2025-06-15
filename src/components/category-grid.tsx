import type { BasicCategory } from '@/chat/model-selection'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Brain } from 'lucide-react'
import { memo } from 'react'
import {
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  OpenAIIcon
} from './provider-icons'

type CategoryItem = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  provider: 'openai' | 'google' | 'anthropic' | 'deepseek'
  model: string
}

type CategoryGridProps = {
  categories: CategoryItem[]
  selectedValue?: BasicCategory
  onSelect: (category: BasicCategory) => void
  disabled?: boolean
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  selectedValue,
  onSelect,
  disabled = false
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
    <div
      className={`grid gap-1.5 grid-cols-3 sm:grid-cols-4 md:grid-cols-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      {categories.map((category) => {
        const IconComponent = category.icon
        const ProviderIcon = getProviderIcon(category.provider)
        const isSelected = selectedValue === category.name

        return (
          <HoverCard key={category.name} closeDelay={0} openDelay={800}>
            <HoverCardTrigger asChild>
              <button
                onClick={() =>
                  !disabled && onSelect(category.name as BasicCategory)
                }
                disabled={disabled}
                className={`py-1.5 px-1 sm:py-2 sm:px-1.5 rounded-md border transition-all text-left group hover:border-primary/50 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card hover:bg-muted/50'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
                type="button"
              >
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <IconComponent
                    className={`size-4 sm:size-5 ${
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-xs font-medium text-center ${
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
})
