import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'
import { convex } from './lib/convex.ts'
import { env } from './lib/env.ts'
import reportWebVitals from './reportWebVitals.ts'
import { routeTree } from './routeTree.gen'
import './styles.css'

const router = createRouter({
  routeTree,
  context: {
    user: {
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined
    }
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')

function App() {
  const user = useUser()

  return (
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="m5s-chat-theme">
        <RouterProvider
          router={router}
          context={{
            user
          }}
        />
        <Toaster />
      </ThemeProvider>
    </StrictMode>
  )
}

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <ClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

reportWebVitals()
