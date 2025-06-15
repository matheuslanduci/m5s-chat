import { useUser } from '@clerk/clerk-react'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from './components/theme-provider'
import { router } from './router'

export function App() {
  const user = useUser()

  if (!user.isLoaded) return null

  return (
    <ThemeProvider defaultTheme="system" storageKey="m5s-chat-theme">
      <RouterProvider router={router} context={{ user }} />
    </ThemeProvider>
  )
}
