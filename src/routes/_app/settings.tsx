import { UserPreferencesDemo } from '@/components/user-preferences-demo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsComponent
})

function SettingsComponent() {
  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <div className="flex-1 overflow-auto p-6">
        <UserPreferencesDemo />
      </div>
    </div>
  )
}
