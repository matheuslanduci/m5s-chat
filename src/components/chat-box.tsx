import { useChat } from '@/chat/chat'
import { useResponsiveAttachmentLimit } from '@/hooks/use-responsive-attachment-limit'
import { ArrowUp, PenOff, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo } from 'react'
import { AttachmentPreview } from './attachment-preview'
import { AttachmentsDialog } from './attachments-dialog'
import { FileUpload } from './file-upload'
import { ModelSelector } from './model-selector'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export function ChatBox() {
  const {
    attachments,
    content,
    setContent,
    actionsEnabled,
    clearAttachments,
    enhancePrompt,
    removeAttachment,
    send,
    isStreaming,
    isEditing,
    setIsEditing,
    textareaRef,
    summarizeChat,
    summary,
    chat
  } = useChat()

  const attachmentLimit = useResponsiveAttachmentLimit()

  const visibleAttachments = useMemo(() => {
    if (attachments.length <= attachmentLimit) {
      return attachments
    }
    return attachments.slice(0, attachmentLimit)
  }, [attachments, attachmentLimit])

  const hiddenCount = attachments.length - attachmentLimit

  const handleModelSelectorClose = () => {
    // LOL: It doesn't trigger focus if not wrapped in setTimeout
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 1)
  }

  useEffect(() => {
    textareaRef.current?.focus()
  }, [textareaRef])

  return (
    <div className="p-4 w-full">
      <div className="max-w-3xl mx-auto relative pointer-events-auto">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: 20,
                opacity: 0
              }}
              className="border rounded-t-2xl flex flex-wrap gap-2 absolute -top-12 z-0 w-full bg-background/75 backdrop-blur-lg p-2 pb-16"
            >
              {visibleAttachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment._id}
                  attachmentId={attachment._id}
                  format={attachment.format}
                  url={attachment.url}
                  name={attachment.name}
                />
              ))}

              {hiddenCount > 0 && (
                <AttachmentsDialog
                  attachments={attachments}
                  hiddenCount={hiddenCount}
                  onClearAll={clearAttachments}
                  onRemoveAttachment={removeAttachment}
                />
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={clearAttachments}
                    disabled={!actionsEnabled}
                  >
                    <X className="size-3" />
                    <span className="sr-only">Clear attachments</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all attachments</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="border rounded-2xl bg-background/75 backdrop-blur-lg p-2 z-10 relative data-[editing='true']:border-primary"
          data-editing={isEditing ? 'true' : 'false'}
        >
          <div className="mb-2">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Type your message..."
              disabled={!actionsEnabled}
              className="border-0 px-2 shadow-none focus-visible:ring-0 min-h-12 max-h-32 resize-none !bg-transparent"
              rows={1}
            />
          </div>

          <div className="flex items-center gap-1">
            <ModelSelector onClose={handleModelSelectorClose} />

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <FileUpload />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {attachments.length >= 5
                  ? 'Maximum 5 attachments allowed'
                  : 'Attach files (images or PDFs)'}
              </TooltipContent>
            </Tooltip>

            {isEditing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7 mr-2"
                    onClick={() => setIsEditing(false, null)}
                  >
                    <PenOff className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel editing</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* {summary ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7 mr-2"
                    onClick={() => summarizeChat(chat?._id as Id<'chat'>)}
                  >
                    <NotebookText className="size-3.5" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Chat Summary</h4>
                    <p className="text-sm text-muted-foreground">{summary}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7 mr-2"
                    onClick={() => summarizeChat(chat?._id as Id<'chat'>)}
                    disabled={!actionsEnabled || !!summary}
                  >
                    <NotebookText className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Summarize chat</p>
                </TooltipContent>
              </Tooltip>
            )} */}

            <div className="flex-1" />

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={enhancePrompt}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7 mr-2"
                    disabled={
                      !actionsEnabled ||
                      !content.trim() ||
                      attachments.length > 0
                    }
                  >
                    <Sparkles className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {content.trim()
                      ? 'Enhance prompt with AI'
                      : 'Enter text to enhance'}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={send}
                    disabled={
                      !actionsEnabled ||
                      (isStreaming && !isEditing) ||
                      (isEditing && !content.trim() && attachments.length === 0)
                    }
                    size="icon"
                    className="size-7 border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
