import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

type ChatContext = {
  actionsEnabled: boolean
  addAttachment: (attachment: Doc<'attachment'>) => void
  removeAttachment: (attachmentId: Id<'attachment'>) => Promise<void>
  clearAttachments: () => Promise<void>
  attachments: Doc<'attachment'>[]
  chat: Doc<'chat'> | undefined
  disableActions: () => void
  enableActions: () => void
  drivenIds: Set<string>
}

export const chatContext = createContext<ChatContext>({} as ChatContext)

export function ChatProvider({
  children,
  chatId
}: { children: React.ReactNode; chatId?: string }) {
  const [actionsEnabled, setActionsEnabled] = useState(true)
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<Doc<'attachment'>[]>([])

  const deleteAttachmentMutation = useMutation(api.attachment.deleteAttachment)

  const addAttachment = useCallback((attachment: Doc<'attachment'>) => {
    setAttachments((prev) => [...prev, attachment])
  }, [])

  const removeAttachment = useCallback(
    async (attachmentId: Id<'attachment'>) => {
      try {
        setAttachments((prev) =>
          prev.filter((attachment) => attachment._id !== attachmentId)
        )

        await deleteAttachmentMutation({
          attachmentId
        })

        toast.success('Attachment removed successfully')
      } catch (error) {
        console.error('Failed to remove attachment:', error)
        toast.error('Failed to remove attachment')
      }
    },
    [deleteAttachmentMutation]
  )

  const clearAttachments = useCallback(async () => {
    try {
      setAttachments([])

      await Promise.all(
        attachments.map((attachment) =>
          deleteAttachmentMutation({ attachmentId: attachment._id })
        )
      )

      toast.success('All attachments cleared')
    } catch (error) {
      console.error('Failed to clear attachments:', error)
      toast.error('Failed to clear some attachments')
    }
  }, [deleteAttachmentMutation, attachments])

  const disableActions = useCallback(() => {
    setActionsEnabled(false)
  }, [])

  const enableActions = useCallback(() => {
    setActionsEnabled(true)
  }, [])

  const chat = useQuery(api.chat.getChat, chatId ? { chatId } : 'skip')

  return (
    <chatContext.Provider
      value={{
        drivenIds,
        chat,
        actionsEnabled,
        attachments,
        addAttachment,
        disableActions,
        enableActions,
        removeAttachment,
        clearAttachments
      }}
    >
      {children}
    </chatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(chatContext)

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }

  return context
}
