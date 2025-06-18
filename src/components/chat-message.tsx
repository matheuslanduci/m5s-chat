import { useChat } from '@/chat/chat'
import { useMessage } from '@/chat/message'
import { useIsMobile } from '@/hooks/use-mobile'
import { useQuery } from 'convex/react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  GitBranch,
  Pen,
  RotateCcw
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import { MessageAttachments } from './message-attachments'
import { ProviderIcon } from './provider-icons'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

// Retry stream might break, so we store a timeout so the user can't spam retries
const retryTimeoutCache = new Map<string, NodeJS.Timeout>()

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
  currentRequestIndex?: number
  totalRequests?: number
  onRequestIndexChange?: (index: number) => void
  hideIcons?: boolean
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
  responseCreationTime,
  currentRequestIndex = 0,
  totalRequests = 1,
  onRequestIndexChange,
  hideIcons = false
}: ChatMessageProps) {
  const isMobile = useIsMobile()
  const {
    retryMessage,
    createChatBranch,
    isEditing,
    editingMessageId,
    isStreaming
  } = useChat()
  const { setSelectedReplyIndex, message } = useMessage()
  const [isRetryDisabled, setIsRetryDisabled] = useState(false)

  const attachments = useQuery(
    api.attachment.getAttachments,
    message?.attachments?.length
      ? { attachmentIds: message.attachments }
      : 'skip'
  )

  useEffect(() => {
    return () => {
      if (message?._id) {
        const existingTimeout = retryTimeoutCache.get(message._id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          retryTimeoutCache.delete(message._id)
        }
      }
    }
  }, [message?._id])

  const retry = useCallback(() => {
    if (!message?._id || isRetryDisabled) return

    const existingTimeout = retryTimeoutCache.get(message._id)
    if (existingTimeout) {
      toast.error('Please wait before retrying this message')
      return
    }

    setIsRetryDisabled(true)
    setSelectedReplyIndex(message?.responses?.length || 1)
    retryMessage(message._id)

    const timeoutId = setTimeout(() => {
      setIsRetryDisabled(false)
      retryTimeoutCache.delete(message._id)
    }, 3000)

    retryTimeoutCache.set(message._id, timeoutId)
  }, [message, isRetryDisabled, setSelectedReplyIndex, retryMessage])

  if (author === 'user') {
    return (
      <div className="group mb-4">
        <div className="flex gap-3 items-center justify-end">
          {isEditing && editingMessageId === message?._id && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-muted-foreground">
                  <Pen className="size-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Editing message</p>
              </TooltipContent>
            </Tooltip>
          )}

          {totalRequests > 1 && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    disabled={currentRequestIndex === 0}
                    onClick={() =>
                      onRequestIndexChange?.(currentRequestIndex - 1)
                    }
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Previous request</p>
                </TooltipContent>
              </Tooltip>

              <span className="text-xs text-muted-foreground px-1">
                {currentRequestIndex + 1}/{totalRequests}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    disabled={currentRequestIndex === totalRequests - 1}
                    onClick={() =>
                      onRequestIndexChange?.(currentRequestIndex + 1)
                    }
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Next request</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <Card
            className="max-w-[80%] py-0 bg-transparent border data-[editing=true]:border-primary"
            data-editing={
              isEditing && editingMessageId === message?._id ? 'true' : 'false'
            }
          >
            <CardContent className="p-3">
              <MessageAttachments attachments={attachments || []} />
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
          </span>{' '}
          {!hideIcons && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    disabled={isStreaming || isRetryDisabled}
                    onClick={() => {
                      retry()
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {isRetryDisabled ? 'Retry in progress...' : 'Retry message'}
                  </p>
                </TooltipContent>
              </Tooltip>
              {/* Disable Edit for a while */}
              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => {
                      if (isEditing && editingMessageId === message?._id) {
                        setIsEditing(false, message)
                      } else {
                        setIsEditing(true, message)
                      }
                    }}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Edit message</p>
                </TooltipContent>
              </Tooltip> */}
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
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="group mb-4">
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
            )}{' '}
          </span>{' '}
          {!hideIcons && (
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
                    disabled={isStreaming || isRetryDisabled}
                    onClick={() => {
                      retry()
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {isRetryDisabled ? 'Retry in progress...' : 'Retry message'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
