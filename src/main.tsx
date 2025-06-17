import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { convex } from './lib/convex'
import { env } from './lib/env'
import { queryClient } from './lib/query-client'
import './styles.css'

const renderTarget = document.getElementById('target')

if (!renderTarget) throw new Error('Render target not found')

const root = createRoot(renderTarget)

root.render(
  <QueryClientProvider client={queryClient}>
    <ClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </QueryClientProvider>
)
