import { Button } from '@/components/ui/button'
import { useChat } from '@/context/chat-context'
import { useMutation } from 'convex/react'
import { Loader2, Paperclip } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

export function FileUpload() {
  const { addAttachment, attachments } = useChat()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const generateUploadUrl = useMutation(api.attachment.generateUploadUrl)
  const createAttachment = useMutation(api.attachment.createAttachment)

  const handleFileSelect = () => {
    // Check attachment limit before opening file dialog
    if (attachments.length >= 5) {
      toast.error('Maximum attachments reached', {
        description: 'You can upload up to 5 attachments per message.'
      })
      return
    }

    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    // Double check attachment limit
    if (attachments.length >= 5) {
      toast.error('Maximum attachments reached', {
        description: 'You can upload up to 5 attachments per message.'
      })
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description:
          'Please upload an image (JPEG, PNG, GIF, WebP) or PDF file.'
      })
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Please upload a file smaller than 10MB.'
      })
      return
    }

    try {
      setIsUploading(true)
      toast.loading('Uploading file...', { id: 'file-upload' })

      const uploadUrl = await generateUploadUrl()

      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
      })

      if (!result.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await result.json()

      const format = file.type.startsWith('image/') ? 'image' : 'pdf'

      const attachmentId = await createAttachment({
        storageId,
        format
      })

      addAttachment({
        id: attachmentId,
        format,
        url: URL.createObjectURL(file), // Temporary URL for preview
        name: file.name
      })

      toast.success('File uploaded successfully', { id: 'file-upload' })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        id: 'file-upload',
        description: 'Please try again.'
      })
    } finally {
      setIsUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 size-7"
        onClick={handleFileSelect}
        disabled={isUploading || attachments.length >= 5}
      >
        {isUploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Paperclip className="size-3.5" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
