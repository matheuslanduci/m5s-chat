import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query
} from './_generated/server'
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

    if (!chat) return null

    if (!chat.collaborators?.includes(user.subject)) throw unauthorized

    return chat
  }
})

export const _createChat = internalMutation({
  args: {
    title: v.optional(v.string()),
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
      title: args.title,
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

    const [model, streamId, title] = (await Promise.all([
      ctx.runAction(internal.model._resolveModel, {
        userId: user.subject,
        prompt: args.initialPrompt
      }),
      streamingComponent.createStream(ctx),
      ctx
        .runAction(internal.ai._generateTitle, {
          prompt: args.initialPrompt
        })
        .catch(() => 'New Chat' as string)
    ])) as [Doc<'model'>, StreamId, string]

    const chatId: Id<'chat'> = await ctx.runMutation(
      internal.chat._createChat,
      {
        title,
        clientId: args.clientId,
        initialPrompt: args.initialPrompt,
        userId: user.subject
      }
    )

    const messageId: Id<'message'> = await ctx.runMutation(
      internal.message._createMessage,
      {
        chatId: chatId,
        content: args.initialPrompt,
        streamId: streamId,
        userId: user.subject,
        modelId: model._id
      }
    )

    return {
      chatId,
      streamId,
      messageId
    }
  }
})

export const toggleChatPin = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db
      .query('chat')
      .withIndex('byClientId', (q) => q.eq('clientId', args.chatId))
      .first()

    if (!chat || !chat.collaborators?.includes(user.subject)) {
      throw unauthorized
    }

    return ctx.db.patch(chat._id, {
      pinned: !chat.pinned
    })
  }
})

export const deleteChat = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db
      .query('chat')
      .withIndex('byClientId', (q) => q.eq('clientId', args.chatId))
      .first()

    if (!chat || chat.ownerId !== user.subject) {
      throw unauthorized
    }

    return ctx.db.delete(chat._id)
  }
})

export const _getChatByClientId = internalQuery({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('chat')
      .withIndex('byClientId', (q) => q.eq('clientId', args.clientId))
      .first()
  }
})

export const _getChatById = internalQuery({
  args: { chatId: v.id('chat') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.chatId)
  }
})

export const createChatBranch = mutation({
  args: { messageId: v.id('message'), clientId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const message = await ctx.db.get(args.messageId)

    if (!message) throw unauthorized

    const chat = await ctx.db.get(message.chatId)

    if (!chat?.collaborators?.includes(user.subject)) throw unauthorized

    const newChatId = await ctx.db.insert('chat', {
      ownerId: user.subject,
      clientId: args.clientId,
      initialPrompt: message.content,
      pinned: false,
      title: chat.title,
      contextTokens: 0,
      collaborators: [user.subject],
      isBranch: true,
      branchOf: chat._id
    })

    const messages = await ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', chat._id))
      .filter((q) => q.lte(q.field('_creationTime'), message._creationTime))
      .collect()

    for (const msg of messages) {
      await ctx.db.insert('message', {
        content: msg.content,
        userId: msg.userId,
        modelId: msg.modelId,
        responses: msg.responses,
        streamId: msg.streamId,
        attachments: msg.attachments,
        chatId: newChatId
      })
    }

    return newChatId
  }
})
