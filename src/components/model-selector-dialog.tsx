import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  type BasicCategory,
  useModelSelection
} from '@/hooks/use-model-selection'
import { Bot, ChevronDown, Loader2, Settings, Zap } from 'lucide-react'
import { useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import { CategoryGrid, basicCategories } from './category-grid'
import { ModelList } from './model-list'

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    selection,
    isLoading,
    categories,
    models,
    setAutoMode,
    setCategoryMode,
    setModelMode,
    displayName
  } = useModelSelection()

  // Convert database categories to category items
  const categoryItems = categories.map((categoryName) => {
    const foundCategory = basicCategories.find((bc) => bc.name === categoryName)
    return (
      foundCategory || {
        name: categoryName,
        icon: Settings,
        description: 'Custom category',
        provider: 'openai' as const,
        model: 'Custom Model'
      }
    )
  })

  const handleAutoToggle = (checked: boolean) => {
    if (checked) {
      setAutoMode()
    } else {
      // If turning off auto, default to category mode with first available category
      const firstCategory = categoryItems[0]?.name as BasicCategory
      if (firstCategory) {
        setCategoryMode(firstCategory)
      }
    }
  }

  const handleCategorySelect = (category: BasicCategory) => {
    setCategoryMode(category)
  }

  const handleModelSelect = (modelId: string) => {
    setModelMode(modelId as Id<'model'>)
    setIsOpen(false)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-left justify-start h-7 px-2 text-xs font-normal"
            >
              {isLoading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Bot className="size-3" />
              )}
              <span className="flex-1 truncate">{displayName}</span>
              <ChevronDown className="size-3" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="size-5" />
                Model Selection
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Auto Mode Section */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Zap className="size-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-medium">Auto Mode</h3>
                    <p className="text-xs text-muted-foreground">
                      Let AI choose the best model for your task
                    </p>
                  </div>
                </div>
                <Switch
                  checked={selection.mode === 'auto'}
                  onCheckedChange={handleAutoToggle}
                />
              </div>

              {/* Category and Model Selection */}
              {selection.mode !== 'auto' && (
                <>
                  <Separator />

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="basic"
                        className="flex items-center gap-2"
                      >
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

                    <TabsContent value="basic" className="mt-6">
                      {/* Category Selection */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium">Categories</h3>
                          <p className="text-xs text-muted-foreground ml-auto">
                            Choose a category to optimize AI responses
                          </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          <CategoryGrid
                            categories={categoryItems}
                            selectedValue={selection.category}
                            onSelect={handleCategorySelect}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-6">
                      {/* Model Selection */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-sm font-medium">
                            Model Selection
                          </h3>
                          <p className="text-xs text-muted-foreground ml-auto">
                            Select a specific model for precise control
                          </p>
                        </div>
                        <ModelList
                          models={models}
                          selectedModelId={selection.modelId}
                          onSelect={handleModelSelect}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      <TooltipContent>
        <p>Select AI model</p>
      </TooltipContent>
    </Tooltip>
  )
}
