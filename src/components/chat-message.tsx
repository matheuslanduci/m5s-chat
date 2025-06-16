import { useIsMobile } from '@/hooks/use-mobile'
import { Copy, Edit, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type ChatMessageProps = {
  author: 'user' | 'assistant'
  children: React.ReactNode
  creationTime: number
}

export function ChatMessage({
  author,
  children,
  creationTime
}: ChatMessageProps) {
  const isMobile = useIsMobile()

  if (author === 'user') {
    return (
      <div className="group">
        <div className="flex gap-3 justify-end">
          <Card className="max-w-[80%] py-0 bg-transparent border">
            <CardContent className="p-3">
              <div className="markdown">{children}</div>
            </CardContent>
          </Card>
        </div>
        <div
          className={`flex flex-row items-center justify-end mt-2 transition-opacity duration-200 ${
            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span className="text-xs text-muted-foreground mr-2">
            {new Date(creationTime).toLocaleDateString([], {
              month: 'short',
              day: 'numeric'
            })}{' '}
            {new Date(creationTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <RotateCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Retry message</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <Edit className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit message</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <Copy className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Copy message</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="markdown">{children}</div>
    </>
  )
}
