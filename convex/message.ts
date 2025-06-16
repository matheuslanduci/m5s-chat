import { StreamIdValidator } from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { unauthorized } from './error'

export const _createMessage = internalMutation({
  args: {
    chatId: v.id('chat'),
    content: v.string(),
    streamId: StreamIdValidator,
    userId: v.string(),
    modelId: v.optional(v.id('model'))
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('message', {
      chatId: args.chatId,
      content: args.content,
      streamId: args.streamId,
      userId: args.userId,
      modelId: args.modelId
    })
  }
})

export const getMessagesByChatId = query({
  args: { chatId: v.id('chat') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw new Error('Unauthorized')

    const chat = await ctx.db.get(args.chatId)

    if (!chat?.collaborators?.includes(user.subject)) throw unauthorized

    return ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', args.chatId))
      .collect()
  }
})
