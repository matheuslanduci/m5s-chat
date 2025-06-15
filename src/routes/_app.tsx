import { AppLayout } from '@/components/app-layout'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: ({ context }) => {
    if (!context.user.isSignedIn) {
      throw redirect({
        to: '/sign-in/$',
        params: {
          _splat: '' // If not provided, it shows `/undefined` in the URL
        }
      })
    }
  }
})
