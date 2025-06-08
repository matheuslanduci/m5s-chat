import type { useUser } from '@clerk/clerk-react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{
  user: ReturnType<typeof useUser>
}>()({
  component: () => <Outlet />
})
