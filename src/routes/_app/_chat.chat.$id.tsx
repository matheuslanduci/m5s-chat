import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_chat/chat/$id')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_app/_chat/chat/$id"!</div>
}
