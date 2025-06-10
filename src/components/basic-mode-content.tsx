import { CategoryGrid } from '@/components/category-grid'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { BasicCategory, ModelSelection } from '@/context/chat-context'
import { HelpCircle, Zap } from 'lucide-react'

interface BasicModeContentProps {
  modelSelection: ModelSelection
  setModelSelection: (selection: ModelSelection) => void
  categories: string[]
}

export function BasicModeContent({
  modelSelection,
  setModelSelection,
  categories
}: BasicModeContentProps) {
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
          onCheckedChange={(checked) => {
            if (checked) {
              // Enable auto mode - clear all specific selections
              setModelSelection({
                ...modelSelection,
                mode: 'auto',
                isAuto: true,
                basic: undefined,
                advanced: undefined,
                modelKey: undefined
              })
            } else {
              // Disable auto mode - ensure we have a selection
              const currentSelection = modelSelection.basic
              const firstCategory = categories[0] as BasicCategory
              setModelSelection({
                ...modelSelection,
                mode: 'basic',
                isAuto: false,
                basic: currentSelection || firstCategory,
                // Clear advanced selections when switching to basic mode
                advanced: undefined,
                modelKey: undefined
              })
            }
          }}
        />
      </div>

      {/* Category Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-medium">Choose a category</p>
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
          </Tooltip>{' '}
        </div>
        <CategoryGrid
          selectedValue={
            modelSelection.isAuto ? undefined : modelSelection.basic
          }
          onSelect={(category) =>
            setModelSelection({
              mode: 'basic',
              isAuto: false,
              basic: category,
              // Clear advanced selection when selecting basic category
              advanced: undefined,
              modelKey: undefined
            })
          }
        />
      </div>
    </div>
  )
}
