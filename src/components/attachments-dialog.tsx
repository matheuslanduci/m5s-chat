import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Attachment } from '@/context/chat-context'
import { FileImage, FileText, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Id } from '../../convex/_generated/dataModel'

type AttachmentsDialogProps = {
  attachments: Attachment[]
  hiddenCount: number
  onClearAll: () => void
  onRemoveAttachment: (attachmentId: Id<'attachment'>) => void
}

export function AttachmentsDialog({
  attachments,
  hiddenCount,
  onClearAll,
  onRemoveAttachment
}: AttachmentsDialogProps) {
  const [selectedAttachment, setSelectedAttachment] =
    useState<Attachment | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && attachments.length > 0) {
      setSelectedAttachment(attachments[0] || null)
    } else if (!newOpen) {
      setSelectedAttachment(null)
    }
  }

  const handleClearAll = () => {
    onClearAll()
    setOpen(false) // Close dialog after clearing
  }

  const handleRemoveAttachment = (attachmentId: Id<'attachment'>) => {
    onRemoveAttachment(attachmentId)

    if (attachments.length > 0) {
      const nextAttachment = attachments.find((att) => att.id !== attachmentId)
      setSelectedAttachment(nextAttachment || null)
    } else {
      setSelectedAttachment(null)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-12 flex flex-col items-center justify-center text-xs hover:bg-muted/50"
        >
          <span className="font-medium">+{hiddenCount}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl! max-h-[85vh] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            All Attachments ({attachments.length})
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-4 h-[65vh]">
          <div className="w-full md:w-1/3 border-r-0 md:border-r pr-0 md:pr-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id} className="relative group">
                    <Button
                      variant={
                        selectedAttachment?.id === attachment.id
                          ? 'default'
                          : 'ghost'
                      }
                      className="w-full justify-start p-3 h-auto pr-12"
                      onClick={() => setSelectedAttachment(attachment)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0">
                          {attachment.format === 'image' ? (
                            <FileImage className="size-4 text-primary" />
                          ) : (
                            <FileText className="size-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium truncate text-sm">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {attachment.format} • #{index + 1}
                          </div>
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveAttachment(attachment.id)
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 md:p-4">
            {selectedAttachment ? (
              <div className="w-full h-full flex flex-col items-center justify-center max-w-4xl">
                {selectedAttachment.format === 'image' ? (
                  <div className="space-y-4 w-full">
                    <div className="text-center">
                      <h3 className="font-medium text-sm md:text-base">
                        {selectedAttachment.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Image Preview
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <img
                        src={selectedAttachment.url}
                        alt={selectedAttachment.name}
                        className="max-w-full max-h-[40vh] md:max-h-[50vh] min-w-[150px] md:min-w-[200px] min-h-[100px] md:min-h-[150px] w-auto h-auto rounded-lg shadow-lg object-contain"
                        style={{
                          aspectRatio: 'auto'
                        }}
                        onError={() => {
                          toast.error('Failed to load image preview')
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 w-full max-w-md">
                    <div>
                      <h3 className="font-medium text-sm md:text-base">
                        {selectedAttachment.name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        PDF Document
                      </p>
                    </div>
                    <div className="p-4 md:p-8 border-2 border-dashed rounded-lg">
                      <FileText className="size-12 md:size-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm md:text-base">
                        Preview not available for PDF files
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <FileImage className="size-12 md:size-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm md:text-base">
                  Select an attachment to preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clear All Button at the bottom */}
        {attachments.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All Attachments
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
