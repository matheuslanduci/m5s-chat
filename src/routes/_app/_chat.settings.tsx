import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useMutation as useRQMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  useCanGoBack,
  useRouter
} from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/_app/_chat/settings')({
  component: RouteComponent
})

function RouteComponent() {
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [byokEnabled, setByokEnabled] = useState(false)
  const [byokKey, setByokKey] = useState('')
  const { theme, setTheme } = useTheme()

  const userPreference = useQuery(api.userPreference.getUserPreference)
  const setUserPreference = useMutation(api.userPreference.setUserPreference)

  const setUserPreferenceMutation = useRQMutation({
    mutationFn: setUserPreference,
    onSuccess: () => {
      toast.success('Settings saved successfully')
    },
    onError: (error) => {
      toast.error('Oops! Something went wrong while saving settings.')
      console.error('Error saving user preference:', error)
      setPrompt(userPreference?.generalPrompt || '')
    }
  })

  function goBack() {
    if (canGoBack) {
      return router.history.back()
    }

    return router.navigate({ to: '/' })
  }
  function savePrompt() {
    setUserPreferenceMutation.mutate({
      generalPrompt: prompt
    })
  }

  function saveBYOK() {
    localStorage.setItem('byok:apikey', byokKey)
    toast.success('API key saved successfully')
  }

  useEffect(() => {
    if (userPreference?.generalPrompt) {
      setPrompt(userPreference.generalPrompt)
    }

    const savedByokKey = localStorage.getItem('byok:apikey')
    if (savedByokKey) {
      setByokKey(savedByokKey)
      setByokEnabled(true)
    } else {
      setByokEnabled(false)
      setByokKey('')
    }
  }, [userPreference])

  if (!userPreference) {
    return (
      <Dialog defaultOpen onOpenChange={() => goBack()}>
        <DialogContent className="!max-w-[660px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center p-4">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

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
                  setUserPreferenceMutation.mutate({
                    theme: newTheme
                  })
                }}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="byok-switch" className="text-sm font-medium">
                  Bring Your Own Key (BYOK)
                </label>
                <p className="text-sm text-muted-foreground">
                  Use your own API keys for AI models
                </p>
              </div>{' '}
              <Switch
                id="byok-switch"
                checked={byokEnabled}
                onCheckedChange={(checked) => {
                  setByokEnabled(checked)
                  if (!checked) {
                    // Clear API key from localStorage when disabled
                    localStorage.removeItem('byok:apikey')
                    setByokKey('')
                    toast.success('BYOK disabled and API key cleared')
                  }
                }}
              />
            </div>

            {byokEnabled && (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveBYOK()
                }}
              >
                <label htmlFor="byok-key" className="text-sm font-medium">
                  OpenRouter API Key
                </label>
                <Input
                  id="byok-key"
                  type="password"
                  placeholder="Enter your API key..."
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className={`button-grid ${setUserPreferenceMutation.isPending ? 'button-grid-loading' : ''}`}
                  >
                    <Loader2 className="animate-spin button-grid-spinner mx-auto" />
                    <span className="button-grid-content">Save Key</span>
                  </Button>
                </div>
              </form>
            )}
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
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className={`button-grid ${setUserPreferenceMutation.isPending ? 'button-grid-loading' : ''}`}
              >
                <Loader2 className="animate-spin button-grid-spinner mx-auto" />
                <span className="button-grid-content">Save</span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
