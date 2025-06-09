import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useChat } from '@/context/chat-context'
import { useState } from 'react'

export function UserPreferencesDemo() {
  const { userPreferences, updateUserPreference, isLoadingPreferences } =
    useChat()
  const [localGeneralPrompt, setLocalGeneralPrompt] = useState('')
  const [localTheme, setLocalTheme] = useState('')

  if (isLoadingPreferences) {
    return <div className="p-4">Loading preferences...</div>
  }

  const handleGeneralPromptChange = (value: string) => {
    setLocalGeneralPrompt(value)
    updateUserPreference('generalPrompt', value)
  }

  const handleThemeChange = (value: string) => {
    setLocalTheme(value)
    updateUserPreference('theme', value)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Preferences Demo</CardTitle>
        <CardDescription>
          These preferences are automatically saved to Convex with debouncing
          (500ms delay)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Setting */}
        <div className="space-y-2">
          <label htmlFor="theme-input" className="text-sm font-medium">
            Theme
          </label>
          <Input
            id="theme-input"
            value={localTheme || userPreferences?.theme || ''}
            onChange={(e) => handleThemeChange(e.target.value)}
            placeholder="e.g., dark, light, auto"
          />
          <p className="text-xs text-muted-foreground">
            Current saved theme: {userPreferences?.theme || 'None'}
          </p>
        </div>

        <Separator />

        {/* General Prompt Setting */}
        <div className="space-y-2">
          <label htmlFor="general-prompt-input" className="text-sm font-medium">
            General Prompt
          </label>
          <Input
            id="general-prompt-input"
            value={localGeneralPrompt || userPreferences?.generalPrompt || ''}
            onChange={(e) => handleGeneralPromptChange(e.target.value)}
            placeholder="e.g., Please be concise and helpful"
          />
          <p className="text-xs text-muted-foreground">
            This will be used by the "Enhance prompt" button in the chat
          </p>
          <p className="text-xs text-muted-foreground">
            Current saved prompt: {userPreferences?.generalPrompt || 'None'}
          </p>
        </div>

        <Separator />

        {/* Boolean Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Auto Summarize</div>
              <p className="text-xs text-muted-foreground">
                Automatically summarize long conversations
              </p>
            </div>
            <Switch
              checked={userPreferences?.autoSummarize || false}
              onCheckedChange={(checked) =>
                updateUserPreference('autoSummarize', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Show Uncategorized</div>
              <p className="text-xs text-muted-foreground">
                Show uncategorized models in selector
              </p>
            </div>
            <Switch
              checked={userPreferences?.uncategorized || false}
              onCheckedChange={(checked) =>
                updateUserPreference('uncategorized', checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Current Favorite Category */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Favorite Category</div>
          <p className="text-sm text-muted-foreground">
            {userPreferences?.favoriteCategory || 'None selected'}
          </p>
          <p className="text-xs text-muted-foreground">
            This is automatically saved when you change the model selection
          </p>
        </div>

        <Separator />

        {/* Saved Prompt Preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Saved Prompt (Draft)</div>
          <p className="text-sm text-muted-foreground">
            {userPreferences?.savedPrompt || 'None'}
          </p>
          <p className="text-xs text-muted-foreground">
            This is automatically saved as you type in the chat input
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs font-mono">
            Debug: {JSON.stringify(userPreferences, null, 2)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
