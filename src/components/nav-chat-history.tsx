import { Link, useLocation, useRouter } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { MoreHorizontal, Pin, PinOff, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar'

const CHAT_TITLE_MAX_LENGTH = 30
const DEFAULT_CHAT_TITLE = 'New Chat'

type ChatGroup = {
  name: string
  chats: Doc<'chat'>[]
}

function getTimeBounds() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const last7Days = new Date(today)
  last7Days.setDate(today.getDate() - 7)

  return { today, yesterday, last7Days }
}

function getChatTimestamp(chat: Doc<'chat'>): number {
  return chat.lastMessageAt || chat._creationTime
}

function formatChatTitle(chat: Doc<'chat'>): string {
  const title = chat.title || chat.initialPrompt || DEFAULT_CHAT_TITLE
  return title.length > CHAT_TITLE_MAX_LENGTH
    ? `${title.slice(0, CHAT_TITLE_MAX_LENGTH)}...`
    : title
}

function sortChatsByDate(chats: Doc<'chat'>[]): Doc<'chat'>[] {
  return [...chats].sort((a, b) => {
    const aTime = getChatTimestamp(a)
    const bTime = getChatTimestamp(b)
    return bTime - aTime
  })
}

function categorizeChats(chats: Doc<'chat'>[]): ChatGroup[] {
  const { today, yesterday, last7Days } = getTimeBounds()

  const pinnedChats = chats.filter((chat) => chat.pinned)
  const unpinnedChats = chats.filter((chat) => !chat.pinned)

  const todayChats = unpinnedChats.filter((chat) => {
    const timestamp = getChatTimestamp(chat)
    return timestamp >= today.getTime()
  })

  const yesterdayChats = unpinnedChats.filter((chat) => {
    const timestamp = getChatTimestamp(chat)
    return timestamp >= yesterday.getTime() && timestamp < today.getTime()
  })

  const last7DaysChats = unpinnedChats.filter((chat) => {
    const timestamp = getChatTimestamp(chat)
    return timestamp >= last7Days.getTime() && timestamp < yesterday.getTime()
  })

  const olderChats = unpinnedChats.filter((chat) => {
    const timestamp = getChatTimestamp(chat)
    return timestamp < last7Days.getTime()
  })

  return [
    { name: 'Pinned Chats', chats: sortChatsByDate(pinnedChats) },
    { name: 'Today', chats: sortChatsByDate(todayChats) },
    { name: 'Yesterday', chats: sortChatsByDate(yesterdayChats) },
    { name: 'Last 7 Days', chats: sortChatsByDate(last7DaysChats) },
    { name: 'Older Chats', chats: sortChatsByDate(olderChats) }
  ]
}

type ChatItemProps = {
  chat: Doc<'chat'>
  onPin: (chatId: string) => void
  onDelete: (chatId: string) => void
}

function ChatItem({ chat, onPin, onDelete }: ChatItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          to="/chat/$id"
          params={{ id: chat.clientId }}
          className="flex items-center justify-between"
          activeProps={{
            className: 'bg-accent text-accent-foreground'
          }}
        >
          <div className="flex min-w-0">
            <div className="font-medium text-sm truncate">
              {formatChatTitle(chat)}
            </div>
          </div>
          {chat.pinned && <Pin className="size-3 text-muted-foreground" />}
        </Link>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction>
            <MoreHorizontal className="size-4" />
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem
            onSelect={() => {
              onPin(chat.clientId)
            }}
          >
            {chat.pinned ? (
              <>
                <PinOff className="size-4 mr-2" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="size-4 mr-2" />
                Pin
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => {
              onDelete(chat.clientId)
            }}
          >
            <Trash2 className="size-4 mr-2 text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

type ChatGroupProps = {
  group: ChatGroup
  onPin: (chatId: string) => void
  onDelete: (chatId: string) => void
}

function ChatGroupComponent({ group, onPin, onDelete }: ChatGroupProps) {
  if (group.chats.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.chats.map((chat) => (
            <ChatItem
              key={chat.clientId}
              chat={chat}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavChatHistory() {
  const chats = useQuery(api.chat.getChats)
  const togglePin = useMutation(api.chat.toggleChatPin)
  const deleteChat = useMutation(api.chat.deleteChat)

  const router = useRouter()
  const location = useLocation()

  const handlePinChat = async (chatId: string) => {
    try {
      await togglePin({ chatId })
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      toast.error('Failed to toggle pin for chat')
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this chat? This action cannot be undone.'
    )
    if (!confirmDelete) return

    try {
      if (location.pathname.includes(chatId)) {
        await router.navigate({
          to: '/'
        })
      }

      await deleteChat({ chatId })
    } catch (error) {
      console.error('Failed to delete chat:', error)
      toast.error('Failed to delete chat')
      return
    }
  }

  const chatGroups = useMemo(() => {
    if (!chats) return []
    return categorizeChats(chats)
  }, [chats])

  if (!chats) return null

  return (
    <>
      {chatGroups.map((group) => (
        <ChatGroupComponent
          key={group.name}
          group={group}
          onPin={handlePinChat}
          onDelete={handleDeleteChat}
        />
      ))}
    </>
  )
}
