import { MessageAttachments } from '@/components/message-attachments'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { Message } from '@/context/chat-context'
import { Bot, Copy, RotateCcw, ThumbsDown, ThumbsUp, User } from 'lucide-react'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-3 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' && (
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={`max-w-[80%] ${
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card'
        }`}
      >
        <CardContent className="p-3">
          {message.isTyping ? (
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="size-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="size-2 bg-muted-foreground rounded-full animate-bounce" />
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                AI is typing...
              </span>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.attachments && (
                <MessageAttachments attachments={message.attachments} />
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <Copy className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy message</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <ThumbsUp className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Like message</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <ThumbsDown className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dislike message</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6">
                          <RotateCcw className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate response</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {message.role === 'user' && (
        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary">
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
