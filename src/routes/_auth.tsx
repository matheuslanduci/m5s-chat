import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
  beforeLoad({ context }) {
    if (context.user.isLoaded && context.user.isSignedIn) {
      throw redirect({
        to: '/'
      })
    }
  }
})
