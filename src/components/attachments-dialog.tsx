import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileImage,
  FileText,
  Grid3X3,
  Trash2,
  X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Doc, Id } from '../../convex/_generated/dataModel'

type AttachmentsDialogProps = {
  attachments: Doc<'attachment'>[]
  hiddenCount: number
  onClearAll: () => void
  onRemoveAttachment: (attachmentId: Id<'attachment'>) => void
}

const getFormattedAttachmentType = (format?: string) => {
  switch (format) {
    case 'image':
      return 'Image'
    case 'pdf':
      return 'PDF'
    default:
      return 'File'
  }
}

export function AttachmentsDialog({
  attachments,
  hiddenCount,
  onClearAll,
  onRemoveAttachment
}: AttachmentsDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'preview'>('preview')

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && attachments.length > 0) {
      setSelectedIndex(0)
    }
  }

  const handleClearAll = () => {
    onClearAll()
    setOpen(false)
  }

  const handleRemoveAttachment = (attachmentId: Id<'attachment'>) => {
    const currentAttachment = attachments[selectedIndex]
    onRemoveAttachment(attachmentId)

    if (attachments.length <= 1) {
      setOpen(false)
    } else if (currentAttachment?._id === attachmentId) {
      if (selectedIndex >= attachments.length - 1) {
        setSelectedIndex(Math.max(0, selectedIndex - 1))
      }
    }
  }

  const navigateAttachment = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1))
    } else {
      setSelectedIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0))
    }
  }

  const selectedAttachment = attachments[selectedIndex]

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs font-medium hover:bg-muted/80 transition-colors"
              >
                +{hiddenCount}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View all {attachments.length} attachments</p>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="!max-w-6xl w-[95vw] max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-lg font-semibold">
                  Attachments
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="text-xs hidden md:inline-flex"
                >
                  {attachments.length}{' '}
                  {attachments.length === 1 ? 'file' : 'files'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 pr-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setViewMode(viewMode === 'grid' ? 'preview' : 'grid')
                      }
                      className="h-8 w-8 p-0"
                    >
                      {viewMode === 'grid' ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Grid3X3 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Switch to {viewMode === 'grid' ? 'preview' : 'grid'} view
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear all attachments</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </DialogHeader>

          <Separator className="flex-shrink-0" />
          {viewMode === 'grid' ? (
            <div className="p-6 w-full flex-1 min-h-0">
              <ScrollArea className="h-full max-h-[calc(90vh-10rem)]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {attachments.map((attachment, index) => (
                    <div key={attachment._id} className="group relative">
                      <button
                        type="button"
                        className="relative bg-muted/30 rounded-lg p-4 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onClick={() => {
                          setSelectedIndex(index)
                          setViewMode('preview')
                        }}
                        aria-label={`View ${attachment.name}`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            {attachment.format === 'image' ? (
                              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileImage className="h-8 w-8 text-primary" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-8 w-8 text-orange-600" />
                              </div>
                            )}
                          </div>

                          <div className="text-center space-y-1 max-w-full">
                            <p className="font-medium text-sm truncate max-w-full">
                              {attachment.name}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {getFormattedAttachmentType(attachment.format)}
                            </Badge>
                          </div>
                        </div>
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAttachment(attachment._id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between min-w-0 px-1 sm:px-6 pb-3 flex-shrink-0">
                <div className="flex items-center sm:gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateAttachment('prev')}
                    disabled={attachments.length <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {selectedIndex + 1} of {attachments.length}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateAttachment('next')}
                    disabled={attachments.length <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center flex-1 min-w-0 gap-2 truncate">
                  <div className="text-sm font-medium ml-2 min-w-0 text-foreground truncate max-w-[140px] sm:max-w-[400px] lg:max-w-[600px] xl:max-w-[800px] ">
                    {selectedAttachment?.name}
                  </div>
                  <Badge
                    variant="outline"
                    className="capitalize hidden sm:inline-flex ml-auto"
                  >
                    {getFormattedAttachmentType(selectedAttachment?.format)}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      selectedAttachment &&
                      handleRemoveAttachment(selectedAttachment._id)
                    }
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto sm:ml-[unset]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="flex-shrink-0" />

              <div className="min-w-0 flex-1 flex items-center justify-center p-6 overflow-hidden">
                {selectedAttachment ? (
                  <div className="w-full h-full flex items-center justify-center max-h-[calc(70vh-8rem)]">
                    {selectedAttachment.format === 'image' ? (
                      <div className="relative max-w-full max-h-full flex items-center justify-center">
                        <img
                          src={selectedAttachment.url}
                          alt={selectedAttachment.name}
                          className="max-w-full max-h-[calc(70vh-12rem)] w-auto h-auto rounded-lg shadow-lg object-contain"
                          onError={() => {
                            toast.error('Failed to load image preview')
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-6 max-w-md">
                        <div className="w-24 h-24 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto">
                          <FileText className="h-12 w-12 text-orange-600" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">
                            PDF Document
                          </h3>
                          <p className="text-muted-foreground">
                            Preview not available for PDF files
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      No attachment selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
