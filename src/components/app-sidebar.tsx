import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator
} from '@/components/ui/sidebar'
import { useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  Archive,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Settings,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface Chat {
  _id: Id<'chat'>
  _creationTime: number
  userId: string
  title?: string
  pinned: boolean
  initialPrompt?: string
}

export function AppSidebar() {
  const { user } = useUser()
  const navigate = useNavigate()

  const chats = useQuery(api.chat.getUserChats)
  const togglePin = useMutation(api.chat.toggleChatPin)
  const deleteChat = useMutation(api.chat.deleteChat)

  // Separate pinned and unpinned chats
  const pinnedChats = chats?.filter((chat) => chat.pinned) ?? []
  const unpinnedChats = chats?.filter((chat) => !chat.pinned) ?? []

  const handleNewChat = () => {
    navigate({ to: '/' })
  }

  const handleTogglePin = async (chatId: Id<'chat'>) => {
    try {
      await togglePin({ chatId })
      toast.success('Chat pin status updated')
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      toast.error('Failed to update chat')
    }
  }

  const handleDeleteChat = async (chatId: Id<'chat'>) => {
    try {
      await deleteChat({ chatId })
      toast.success('Chat deleted')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to delete chat:', error)
      toast.error('Failed to delete chat')
    }
  }

  const formatChatTitle = (chat: Chat) => {
    return chat.title || `${chat.initialPrompt?.slice(0, 40)}...` || 'New Chat'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const renderChatItem = (chat: Chat) => (
    <SidebarMenuItem key={chat._id}>
      <SidebarMenuButton asChild>
        <Link
          to="/chat/$chatId"
          params={{ chatId: chat._id }}
          className="flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{formatChatTitle(chat)}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(chat._creationTime)}
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
          <DropdownMenuItem onClick={() => handleTogglePin(chat._id)}>
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
            onClick={() => handleDeleteChat(chat._id)}
            className="text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="font-bold">M5</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">M5S Chat</span>
                  <span className="truncate text-xs">AI Assistant</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupAction onClick={handleNewChat} title="New Chat">
            <Plus className="size-4" />
            <span className="sr-only">New Chat</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            {chats === undefined ? (
              <SidebarMenu>
                {[1, 2, 3, 4, 5].map((id) => (
                  <SidebarMenuItem key={`skeleton-${id}`}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : (
              <SidebarMenu>
                {chats.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="text-sm text-muted-foreground p-2">
                      No chats yet. Start a new conversation!
                    </div>
                  </SidebarMenuItem>
                ) : (
                  <>
                    {pinnedChats.length > 0 && (
                      <>
                        {pinnedChats.map(renderChatItem)}
                        {unpinnedChats.length > 0 && (
                          <SidebarSeparator className="my-2" />
                        )}
                      </>
                    )}
                    {unpinnedChats.map(renderChatItem)}
                  </>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="font-bold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullName || 'User'}
                    </span>
                    <span className="truncate text-xs">
                      {user?.primaryEmailAddress?.emailAddress ||
                        'user@example.com'}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Archive className="size-4 mr-2" />
                    Archived Chats
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
