import { Sparkles } from 'lucide-react'

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Sparkles className="size-12 text-primary" />
                <div className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Hey, how can I help you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              I'm your AI assistant. Start typing your question below to get
              started.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
