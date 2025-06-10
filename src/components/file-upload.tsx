import { Button } from '@/components/ui/button'
import { useChat } from '@/context/chat-context'
import { useMutation } from 'convex/react'
import { Loader2, Paperclip } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

export function FileUpload() {
  const { addAttachment } = useChat()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const generateUploadUrl = useMutation(api.attachment.generateUploadUrl)
  const createAttachment = useMutation(api.attachment.createAttachment)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
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

    // Validate file size (max 10MB)
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

      // Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
      })

      if (!result.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await result.json()

      // Determine format
      const format = file.type.startsWith('image/') ? 'image' : 'pdf'

      // Create attachment record
      const attachmentId = await createAttachment({
        storageId,
        format
      })

      // Add to local state
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
      // Reset file input
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
        disabled={isUploading}
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
