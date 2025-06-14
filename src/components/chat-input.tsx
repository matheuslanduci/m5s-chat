import { AttachmentPreview } from '@/components/attachment-preview'
import { AttachmentsDialog } from '@/components/attachments-dialog'
import { FileUpload } from '@/components/file-upload'
import { ModelSelector } from '@/components/model-selector-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useChat } from '@/context/chat-context'
import { useResponsiveAttachmentLimit } from '@/hooks/use-responsive-attachment-limit'
import { ArrowUp, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'

export function ChatInput() {
  const {
    inputValue,
    setInputValue,
    isLoading,
    send,
    attachments,
    clearAttachments,
    enhancePrompt,
    removeAttachment
  } = useChat()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachmentLimit = useResponsiveAttachmentLimit()

  const visibleAttachments = useMemo(() => {
    if (attachments.length <= attachmentLimit) {
      return attachments
    }
    return attachments.slice(0, attachmentLimit)
  }, [attachments, attachmentLimit])

  const hiddenCount = attachments.length - attachmentLimit

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleModelSelectorClose = () => {
    // LOL: It doesn't trigger focus if not wrapped in setTimeout
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 1)
  }

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="p-4 w-full">
      <div className="max-w-4xl mx-auto relative">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: 60,
                opacity: 0
              }}
              className="border rounded-t-2xl flex flex-wrap gap-2 absolute -top-12 z-0 w-full bg-background p-2 pb-16"
            >
              {visibleAttachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachmentId={attachment.id}
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
                    disabled={isLoading}
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

        <div className="border rounded-2xl bg-background p-2 z-10 relative">
          <div className="mb-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="border-0 px-2 shadow-none focus-visible:ring-0 min-h-12 max-h-32 resize-none !bg-transparent"
              rows={1}
            />
          </div>{' '}
          {/* Bottom Row: Model Selection, Attachment, Enhance & Send */}
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

            <div className="flex-1" />

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={enhancePrompt}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7 mr-2"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Sparkles className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {inputValue.trim()
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
                      (!inputValue.trim() && attachments.length === 0) ||
                      isLoading
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
