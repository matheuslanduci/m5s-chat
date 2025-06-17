import { useChat } from '@/chat/chat'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import type { Id } from 'convex/_generated/dataModel'
import { FileImage, FileText, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type AttachmentPreviewProps = {
  attachmentId: Id<'attachment'>
  format: 'image' | 'pdf'
  url: string
  name: string
}

export function AttachmentPreview({
  attachmentId,
  format,
  url,
  name
}: AttachmentPreviewProps) {
  const { removeAttachment } = useChat()
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async (event: React.MouseEvent) => {
    event.stopPropagation()
    setOpen(false)

    try {
      setIsRemoving(true)
      await removeAttachment(attachmentId)
    } catch (error) {
      console.error('Failed to remove attachment:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleTriggerClick = (
    event: React.MouseEvent | React.KeyboardEvent<HTMLDivElement>
  ) => {
    event.preventDefault()
    setOpen(!open)
  }

  return (
    <HoverCard
      open={open}
      onOpenChange={(val) => {
        if (isRemoving) return
        setOpen(val)
      }}
    >
      <HoverCardTrigger asChild>
        <div
          className="relative inline-flex items-center gap-2 bg-muted px-2 py-1 rounded-md border cursor-pointer hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={handleTriggerClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleTriggerClick(event)
            }
          }}
          aria-expanded={open}
          aria-label={`Preview ${name}`}
        >
          <div className="flex items-center gap-2">
            {format === 'image' ? (
              <FileImage className="size-4 text-primary" />
            ) : (
              <FileText className="size-4 text-primary" />
            )}
            <span className="text-sm font-medium truncate max-w-[120px]">
              {name}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-5 p-0 hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold truncate">{name}</h4>
          {format === 'image' ? (
            <div className="mt-2">
              <img
                src={url}
                alt={name}
                className="max-w-full h-auto max-h-48 rounded-md object-cover"
                onError={() => {
                  toast.error('Failed to load image preview')
                }}
              />
            </div>
          ) : (
            <div className="mt-2 p-4 border rounded-md bg-muted/50 text-center">
              <FileText className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Preview not supported for PDF files
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
