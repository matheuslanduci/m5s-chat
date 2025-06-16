import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import { action, internalMutation, query } from './_generated/server'
import { unauthorized } from './error'
import { streamingComponent } from './streaming'

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

export const _createChat = internalMutation({
  args: {
    clientId: v.string(),
    initialPrompt: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('chat', {
      ownerId: args.userId,
      clientId: args.clientId,
      initialPrompt: args.initialPrompt,
      pinned: false,
      contextTokens: 0,
      collaborators: [args.userId]
    })
  }
})

export const createChat = action({
  args: {
    clientId: v.string(),
    initialPrompt: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const [chatId, model, streamId] = (await Promise.all([
      ctx.runMutation(internal.chat._createChat, {
        clientId: args.clientId,
        initialPrompt: args.initialPrompt,
        userId: user.subject
      }),
      ctx.runAction(internal.model._resolveModel, {
        userId: user.subject,
        prompt: args.initialPrompt
      }),
      streamingComponent.createStream(ctx)
    ])) as [Id<'chat'>, Doc<'model'>, StreamId]

    await ctx.runMutation(internal.message._createMessage, {
      chatId: chatId,
      content: args.initialPrompt,
      streamId: streamId,
      userId: user.subject,
      modelId: model._id
    })

    return {
      chatId,
      streamId
    }
  }
})
