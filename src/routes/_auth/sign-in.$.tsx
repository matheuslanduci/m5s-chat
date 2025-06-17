import { SignIn } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-in/$')({
  component: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      <SignIn />
    </div>
  )
})
