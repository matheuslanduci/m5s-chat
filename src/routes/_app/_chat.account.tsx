import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { UserProfile } from '@clerk/clerk-react'
import {
  createFileRoute,
  useCanGoBack,
  useRouter
} from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_chat/account')({
  component: RouteComponent
})

function RouteComponent() {
  const canGoBack = useCanGoBack()
  const router = useRouter()

  function goBack() {
    if (canGoBack) {
      return router.history.back()
    }

    return router.navigate({ to: '/' })
  }

  return (
    <Dialog defaultOpen onOpenChange={() => goBack()}>
      <DialogContent className="!max-w-fit !p-0">
        <DialogTitle className="sr-only">Account Settings</DialogTitle>
        <UserProfile />
      </DialogContent>
    </Dialog>
  )
}
