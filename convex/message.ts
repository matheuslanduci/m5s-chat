import { StreamIdValidator } from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { internalMutation, internalQuery, query } from './_generated/server'
import { serverError, unauthorized } from './error'

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

export const _getMessageByStreamId = internalQuery({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) => {
    return ctx.db
      .query('message')
      .withIndex('byStreamId', (q) => q.eq('streamId', args.streamId))
      .unique()
  }
})

export const _getMessagesByChatId = internalQuery({
  args: { chatId: v.id('chat') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', args.chatId))
      .collect()
  }
})

export const _addResponseToMessage = internalMutation({
  args: {
    messageId: v.id('message'),
    response: v.object({
      content: v.string(),
      modelId: v.optional(v.id('model')),
      provider: v.union(
        v.literal('openai'),
        v.literal('anthropic'),
        v.literal('google'),
        v.literal('deepseek')
      ),
      tokens: v.number(),
      createdAt: v.number()
    })
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)

    if (!message) throw serverError

    return ctx.db.patch(args.messageId, {
      responses: [
        ...(message.responses || []),
        {
          content: args.response.content,
          modelId: args.response.modelId,
          provider: args.response.provider,
          tokens: args.response.tokens,
          createdAt: args.response.createdAt
        }
      ]
    })
  }
})
