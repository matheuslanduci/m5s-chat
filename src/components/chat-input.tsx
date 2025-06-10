import { AttachmentPreview } from '@/components/attachment-preview'
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
import { ArrowUp, Sparkles } from 'lucide-react'
import { useRef } from 'react'

export function ChatInput() {
  const {
    inputValue,
    setInputValue,
    isLoading,
    enhancePrompt,
    send,
    attachments
  } = useChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleEnhancePrompt = () => {
    enhancePrompt()
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Unified Input Container */}
        <div className="border rounded-lg bg-transparent p-2">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <AttachmentPreview
                  key={attachment.id}
                  attachmentId={attachment.id}
                  format={attachment.format}
                  url={attachment.url}
                  name={attachment.name}
                />
              ))}
            </div>
          )}

          {/* Message Input */}
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
          </div>

          {/* Bottom Row: Model Selection, Attachment, Enhance & Send */}
          <div className="flex items-center gap-3">
            <ModelSelector />

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <FileUpload />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach files</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleEnhancePrompt}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-7"
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
                    className="size-7"
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
