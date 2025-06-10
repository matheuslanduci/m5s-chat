import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { useChat } from '@/context/chat-context'
import { FileImage, FileText, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Id } from '../../convex/_generated/dataModel'

interface AttachmentPreviewProps {
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
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      await removeAttachment(attachmentId)
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="relative inline-flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border cursor-pointer">
          <div className="flex items-center gap-2">
            {format === 'image' ? (
              <FileImage className="size-4 text-blue-500" />
            ) : (
              <FileText className="size-4 text-red-500" />
            )}
            <span className="text-sm font-medium truncate max-w-[120px]">
              {name}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
          <h4 className="text-sm font-semibold">{name}</h4>
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
