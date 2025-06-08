import { convex } from '@/lib/convex'
import { env } from '@/lib/env'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

export const Route = createRootRoute({
  component: () => (
    <>
      <ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Outlet />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </>
  )
})
