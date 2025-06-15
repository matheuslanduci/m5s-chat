import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import {
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  OpenAIIcon
} from './provider-icons'

interface ModelListProps {
  models: Doc<'model'>[]
  selectedModelId?: Id<'model'>
  onSelect: (modelId: Id<'model'>) => void
  disabled?: boolean
}

export const ModelList = memo(function ModelList({
  models,
  selectedModelId,
  onSelect,
  disabled = false
}: ModelListProps) {
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

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
        return null
    }
  }

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className={`space-y-3 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground/60" />
        <Input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="pl-10 h-9 text-sm"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') {
              e.stopPropagation()
            }
          }}
        />
      </div>
      <div className="max-h-36 overflow-y-auto space-y-1">
        {filteredModels.map((model) => {
          const ProviderIcon = getProviderIcon(model.provider)
          const isSelected = selectedModelId === model._id

          return (
            <Button
              key={model._id}
              variant="ghost"
              onClick={() => !disabled && onSelect(model._id)}
              disabled={disabled}
              className={`text-sm h-9 px-3 rounded-md cursor-pointer w-full justify-start ${
                isSelected
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/50 border border-transparent text-muted-foreground'
              } ${disabled ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2 w-full">
                {ProviderIcon && (
                  <ProviderIcon className="size-4 text-inherit flex-shrink-0" />
                )}
                <span className="flex-1 text-left">{model.name}</span>
              </div>
            </Button>
          )
        })}

        {filteredModels.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No models found
          </div>
        )}
      </div>
    </div>
  )
})
