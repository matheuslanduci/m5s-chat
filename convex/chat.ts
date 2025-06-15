import { v } from 'convex/values'
import { query } from './_generated/server'
import { unauthorized } from './error'

export const getChats = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.db
      .query('chat')
      .withIndex('byOwnerId', (q) => q.eq('ownerId', user.subject))
      .order('desc')
      .collect()
  }
})

export const getChat = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db
      .query('chat')
      .withIndex('byClientId', (q) => q.eq('clientId', args.chatId))
      .first()

    if (chat?.collaborators?.includes(user.subject) !== true) throw unauthorized

    return chat
  }
})
