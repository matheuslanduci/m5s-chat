import { MessageAttachments } from '@/components/message-attachments'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Doc } from 'convex/_generated/dataModel'
import { Bot, Copy, Edit, RotateCcw, User } from 'lucide-react'
import { ProviderIcon } from './provider-icons'

interface ChatMessageProps {
  message: Doc<'message'>
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isMobile = useIsMobile()
  return (
    <div className="group">
      <div
        className={`flex gap-3 ${
          message.role === 'user' ? 'justify-end' : 'justify-start'
        }`}
      >
        {message.role === 'assistant' && (
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/5 text-primary-foreground border border-primary/10">
              {message.model?.provider ? (
                <ProviderIcon
                  provider={message.model.provider}
                  className="size-4"
                />
              ) : (
                <Bot className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
        )}{' '}
        <Card
          className={`max-w-[80%] py-0 ${
            message.role === 'user' ? 'bg-transparent border' : 'bg-card'
          }`}
        >
          <CardContent className="p-3">
            <p className="text-sm leading-relaxed">{message.content}</p>
            {message.attachments && <MessageAttachments attachments={[]} />}
          </CardContent>
        </Card>
        {message.role === 'user' && (
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>{' '}
      {/* User Message Options - Bottom */}
      {message.role === 'user' && (
        <div
          className={`flex flex-col items-end mt-2 transition-opacity duration-200 ${
            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {/* Date and Time */}
          <span className="text-xs text-muted-foreground mb-1 mr-11">
            {new Date(message._creationTime).toLocaleDateString([], {
              month: 'short',
              day: 'numeric'
            })}{' '}
            {new Date(message._creationTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>

          <div className="flex items-center gap-1 mr-11">
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
      )}
    </div>
  )
}
