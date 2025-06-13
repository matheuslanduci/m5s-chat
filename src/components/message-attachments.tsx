import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import type { Attachment } from '@/context/chat-context'
import { FileImage, FileText } from 'lucide-react'

interface MessageAttachmentsProps {
  attachments: Attachment[]
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <HoverCard key={attachment.id}>
          <HoverCardTrigger asChild>
            <div
              className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer max-w-sm"
              onClick={() => window.open(attachment.url, '_blank')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  window.open(attachment.url, '_blank')
                }
              }}
            >
              {attachment.format === 'image' ? (
                <>
                  <FileImage className="size-4 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium truncate block">
                      {attachment.name}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="size-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {attachment.name}
                  </span>
                </>
              )}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{attachment.name}</h4>
              {attachment.format === 'image' ? (
                <div className="mt-2">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full h-auto max-h-48 rounded-md object-cover"
                    onError={() => {
                      // Handle image load errors gracefully
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
      ))}
    </div>
  )
}
