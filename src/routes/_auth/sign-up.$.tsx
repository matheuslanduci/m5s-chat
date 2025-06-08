import { SignUp } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/sign-up/$')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <SignUp />
    </div>
  )
}
