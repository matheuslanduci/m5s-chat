import { useChat } from '@/chat/chat'
import { useMessage } from '@/chat/message'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  GitBranch,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { ProviderIcon } from './provider-icons'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type ChatMessageProps = {
  author: 'user' | 'assistant'
  children: React.ReactNode
  creationTime: number
  currentResponseIndex?: number
  totalResponses?: number
  onResponseIndexChange?: (index: number) => void
  modelName?: string
  provider?: 'openai' | 'google' | 'anthropic' | 'deepseek'
  responseCreationTime?: number
}

export function ChatMessage({
  author,
  children,
  creationTime,
  currentResponseIndex = 0,
  totalResponses = 1,
  onResponseIndexChange,
  modelName,
  provider,
  responseCreationTime
}: ChatMessageProps) {
  const isMobile = useIsMobile()
  const { retryMessage, createChatBranch } = useChat()
  const { setSelectedIndex, message } = useMessage()

  const retry = () => {
    setSelectedIndex(message?.responses?.length || 1)
    retryMessage(message?._id)
  }

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => {
                    retry()
                  }}
                >
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        message?.content || ''
                      )
                      toast.success('Message copied to clipboard')
                    } catch (err) {
                      console.error('Failed to copy message:', err)
                      toast.error('Failed to copy message')
                    }
                  }}
                >
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
    <div className="group">
      <div className="flex gap-3">
        <div className="flex-1 max-w-3xl">
          <div className="markdown">{children}</div>
        </div>
      </div>
      <div
        className={`flex flex-row-reverse items-left justify-between mt-2 transition-opacity duration-200 ${
          isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {modelName && provider && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ProviderIcon provider={provider} className="size-3.5" />
              <span>{modelName}</span>
            </div>
          )}

          {totalResponses > 1 && (
            <div className="flex items-center gap-1 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    disabled={currentResponseIndex === 0}
                    onClick={() =>
                      onResponseIndexChange?.(currentResponseIndex - 1)
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Previous response</p>
                </TooltipContent>
              </Tooltip>

              <span className="text-xs text-muted-foreground px-1">
                {currentResponseIndex + 1}/
                {currentResponseIndex + 1 > totalResponses
                  ? currentResponseIndex + 1
                  : totalResponses}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    disabled={currentResponseIndex === totalResponses - 1}
                    onClick={() =>
                      onResponseIndexChange?.(currentResponseIndex + 1)
                    }
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Next response</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex flex-row-reverse justify-end items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(responseCreationTime || new Date()).toLocaleDateString(
              [],
              {
                month: 'short',
                day: 'numeric'
              }
            )}{' '}
            {new Date(responseCreationTime || new Date()).toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit'
              }
            )}
          </span>{' '}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={async () => {
                    try {
                      // For assistant messages, we need to get the current response content
                      const contentToCopy =
                        message?.responses?.[currentResponseIndex]?.content ||
                        message?.content ||
                        ''
                      await navigator.clipboard.writeText(contentToCopy)
                      toast.success('Message copied to clipboard')
                    } catch (err) {
                      console.error('Failed to copy message:', err)
                      toast.error('Failed to copy message')
                    }
                  }}
                >
                  <Copy className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Copy message</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => createChatBranch(message._id)}
                >
                  <GitBranch className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Branch off</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => {
                    retry()
                  }}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Retry message</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
