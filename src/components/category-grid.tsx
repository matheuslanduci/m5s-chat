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
import { useBestModels } from '@/hooks/use-best-models'
import { Brain } from 'lucide-react'
import { memo } from 'react'

interface CategoryItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  provider: 'openai' | 'google' | 'anthropic' | 'deepseek'
  model: string
}

interface CategoryGridProps {
  categories?: CategoryItem[]
  selectedValue?: BasicCategory
  onSelect: (category: BasicCategory) => void
  compact?: boolean
  disabled?: boolean
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  selectedValue,
  onSelect,
  compact = false,
  disabled = false
}: CategoryGridProps) {
  const { categoriesWithModels, isLoading } = useBestModels()

  // Use provided categories or fall back to best models from database
  // Only fetch from hook if no categories are provided
  const displayCategories = categories || categoriesWithModels
  const isDataLoading = isLoading && !categories

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
  if (isDataLoading) {
    return (
      <div
        className={`grid gap-1.5 ${compact ? 'grid-cols-5' : 'grid-cols-4'}`}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={`loading-skeleton-${item}`}
            className={`${compact ? 'py-1.5 px-1' : 'py-2 px-1.5'} rounded-md border animate-pulse bg-muted/50`}
          >
            <div
              className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-1.5'}`}
            >
              <div
                className={`${compact ? 'size-4' : 'size-5'} bg-muted rounded`}
              />
              <div
                className={`${compact ? 'h-3' : 'h-4'} w-12 bg-muted rounded`}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div
      className={`grid gap-1.5 ${compact ? 'grid-cols-5' : 'grid-cols-4'} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      {displayCategories.map((category) => {
        const IconComponent = category.icon
        const ProviderIcon = getProviderIcon(category.provider)
        const isSelected = selectedValue === category.name

        return (
          <HoverCard key={category.name} openDelay={800}>
            <HoverCardTrigger asChild>
              <button
                onClick={() =>
                  !disabled && onSelect(category.name as BasicCategory)
                }
                disabled={disabled}
                className={`${compact ? 'py-1.5 px-1' : 'py-2 px-1.5'} rounded-md border transition-all text-left group hover:border-primary/50 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card hover:bg-muted/50'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
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
})
