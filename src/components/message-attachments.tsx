import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import type { Doc } from 'convex/_generated/dataModel'
import { FileImage, FileText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type MessageAttachmentsProps = {
  attachments: Doc<'attachment'>[]
}

type MessageAttachmentItemProps = {
  attachment: Doc<'attachment'>
}

function MessageAttachmentItem({ attachment }: MessageAttachmentItemProps) {
  const [open, setOpen] = useState(false)

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpen(!open)
  }

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-muted/60 px-2 py-1 rounded-md border cursor-pointer hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={handleTriggerClick}
          aria-expanded={open}
          aria-label={`Preview ${attachment.name}`}
        >
          <div className="flex items-center gap-2">
            {attachment.format === 'image' ? (
              <FileImage className="size-4 text-muted-foreground" />
            ) : (
              <FileText className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm truncate max-w-[120px]">
              {attachment.name}
            </span>
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold truncate">{attachment.name}</h4>
          {attachment.format === 'image' ? (
            <div className="mt-2">
              <img
                src={attachment.url}
                alt={attachment.name}
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

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment) => (
        <MessageAttachmentItem key={attachment._id} attachment={attachment} />
      ))}
    </div>
  )
}
