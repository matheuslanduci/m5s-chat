import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_chat')({
  component: () => <Outlet />
})
