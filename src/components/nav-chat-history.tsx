import { Link } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ScrollArea } from './ui/scroll-area'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem
} from './ui/sidebar'

export function NavChatHistory() {
  const chats = useQuery(api.chat.getChats)

  if (!chats) return null

  const today = new Date()

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const last7Days = new Date(today)
  last7Days.setDate(today.getDate() - 7)

  const pinnedChats = chats.filter((chat) => chat.pinned)
  const todayChats = chats.filter(
    (chat) =>
      (chat.lastMessageAt && chat.lastMessageAt) ??
      0 >= today.setHours(0, 0, 0, 0)
  )
  const yesterdayChats = chats.filter(
    (chat) =>
      (chat.lastMessageAt && chat.lastMessageAt) ??
      0 >= yesterday.setHours(0, 0, 0, 0)
  )
  const last7DaysChats = chats.filter(
    (chat) =>
      (chat.lastMessageAt && chat.lastMessageAt) ??
      0 >= last7Days.setHours(0, 0, 0, 0)
  )
  const olderChats = chats.filter(
    (chat) =>
      (chat.lastMessageAt && chat.lastMessageAt) ??
      0 < last7Days.setHours(0, 0, 0, 0)
  )

  const formatChatTitle = (chat: Doc<'chat'>) => {
    return chat.title || `${chat.initialPrompt?.slice(0, 40)}...` || 'New Chat'
  }

  const orderedChats = [
    {
      name: 'Pinned Chats',
      chats: pinnedChats
    },
    {
      name: 'Today',
      chats: todayChats
    },
    {
      name: 'Yesterday',
      chats: yesterdayChats
    },
    {
      name: 'Last 7 Days',
      chats: last7DaysChats
    },
    {
      name: 'Older Chats',
      chats: olderChats
    }
  ]

  return (
    <ScrollArea className="flex-1">
      {orderedChats.map(
        (group) =>
          group.chats.length > 0 && (
            <SidebarGroup key={group.name}>
              <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.chats.map((chat) => (
                    <SidebarMenuItem key={chat.clientId}>
                      <Link
                        to="/chat/$id"
                        params={{ id: chat.clientId }}
                        className="flex items-center justify-center"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {formatChatTitle(chat)}
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
      )}
    </ScrollArea>
  )
}
