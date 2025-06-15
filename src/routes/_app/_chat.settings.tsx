import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  createFileRoute,
  useCanGoBack,
  useRouter
} from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_app/_chat/settings')({
  component: RouteComponent
})

function RouteComponent() {
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const { theme, setTheme } = useTheme()

  const userPreference = useQuery(api.userPreference.getUserPreference)
  const setUserPreference = useMutation(api.userPreference.setUserPreference)

  function goBack() {
    if (canGoBack) {
      return router.history.back()
    }

    return router.navigate({ to: '/' })
  }

  function savePrompt() {
    setUserPreference({ generalPrompt: prompt })
  }

  useEffect(() => {
    if (userPreference?.generalPrompt) {
      setPrompt(userPreference.generalPrompt)
    }
  }, [userPreference])

  return (
    <Dialog defaultOpen onOpenChange={() => goBack()}>
      <DialogContent className="!max-w-[660px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="theme-switch" className="text-sm font-medium">
                Theme
              </label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  const newTheme = checked ? 'dark' : 'light'
                  setTheme(newTheme)
                }}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              savePrompt()
            }}
          >
            <label htmlFor="general-prompt" className="text-sm font-medium">
              General Prompt
            </label>
            <p className="text-sm text-muted-foreground">
              Set a general prompt that will be used as context for all
              conversations
            </p>
            <Textarea
              id="general-prompt"
              placeholder="Enter your general prompt here..."
              className="min-h-24"
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
            />
            <div className="flex justify-end">
              <Button type="submit" variant="outline" size="sm">
                Save
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
