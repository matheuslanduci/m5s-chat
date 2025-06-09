import {
  AnthropicIcon,
  DeepSeekIcon,
  GoogleIcon,
  OpenAIIcon
} from '@/components/provider-icons'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Doc } from '../../convex/_generated/dataModel'

interface SearchableOptionsProps {
  options: string[] | Doc<'model'>[]
  selectedValue?: string
  onSelect: (value: string) => void
  isOpen?: boolean
}

export function SearchableOptions({
  options,
  selectedValue,
  onSelect,
  isOpen
}: SearchableOptionsProps) {
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Helper functions to handle both string arrays and model objects
  const getDisplayName = (option: string | Doc<'model'>): string => {
    return typeof option === 'string' ? option : option.name
  }

  const getSelectValue = (option: string | Doc<'model'>): string => {
    return typeof option === 'string' ? option : option.name
  }

  const getProvider = (option: string | Doc<'model'>): string | null => {
    if (typeof option === 'string') {
      // Legacy logic for string-based options
      if (option.includes('GPT')) return 'openai'
      if (option.includes('Claude')) return 'anthropic'
      if (option.includes('Gemini')) return 'google'
      return null
    }
    return option.provider
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

  const filteredOptions = options.filter((option) => {
    const displayName = getDisplayName(option)
    return displayName.toLowerCase().includes(search.toLowerCase())
  })

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
          const displayName = getDisplayName(option)
          const selectValue = getSelectValue(option)
          const provider = getProvider(option)
          const ProviderIcon = getProviderIcon(provider)
          const key = typeof option === 'string' ? option : option._id

          return (
            <DropdownMenuItem
              key={key}
              onSelect={() => onSelect(selectValue)}
              className={`text-sm h-9 px-3 rounded-md cursor-pointer ${
                selectedValue === selectValue
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                {ProviderIcon && (
                  <ProviderIcon className="size-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="flex-1">{displayName}</span>
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
