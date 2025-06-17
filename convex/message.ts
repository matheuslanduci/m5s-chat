import {
  type StreamId,
  StreamIdValidator
} from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import {
  action,
  internalMutation,
  internalQuery,
  query
} from './_generated/server'
import { notFoundError, serverError, unauthorized } from './error'
import { streamingComponent } from './streaming'

export const _createMessage = internalMutation({
  args: {
    chatId: v.id('chat'),
    content: v.string(),
    streamId: StreamIdValidator,
    userId: v.string(),
    modelId: v.optional(v.id('model')),
    attachments: v.optional(v.array(v.id('attachment')))
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('message', {
      chatId: args.chatId,
      content: args.content,
      streamId: args.streamId,
      userId: args.userId,
      modelId: args.modelId,
      attachments: args.attachments,
      contentHistory: [
        {
          content: args.content,
          createdAt: Date.now()
        }
      ]
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
      modelName: v.optional(v.string()),
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
          modelName: args.response.modelName,
          provider: args.response.provider,
          tokens: args.response.tokens,
          createdAt: args.response.createdAt
        }
      ]
    })
  }
})

export const createMessage = action({
  args: {
    chatId: v.string(),
    content: v.string(),
    attachments: v.optional(v.array(v.id('attachment')))
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.runQuery(internal.chat._getChatByClientId, {
      clientId: args.chatId
    })

    if (!chat) throw notFoundError

    if (!chat.collaborators?.includes(user.subject)) throw unauthorized

    const [model, streamId] = (await Promise.all([
      ctx.runAction(internal.model._resolveModel, {
        userId: user.subject,
        prompt: args.content
      }),
      streamingComponent.createStream(ctx)
    ])) as [Doc<'model'>, StreamId]

    const messageId: Id<'message'> = await ctx.runMutation(
      internal.message._createMessage,
      {
        chatId: chat._id,
        content: args.content,
        streamId: streamId,
        userId: user.subject,
        modelId: model._id,
        attachments: args.attachments
      }
    )

    return {
      messageId,
      streamId
    }
  }
})

export const editAndRetryMessage = action({
  args: {
    messageId: v.id('message'),
    content: v.string()
  },
  handler: async (ctx, args): Promise<Id<'message'>> => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const message: Doc<'message'> | null = await ctx.runQuery(
      internal.message._getMessageById,
      {
        messageId: args.messageId
      }
    )

    if (!message) throw notFoundError

    const chat: Doc<'chat'> | null = await ctx.runQuery(
      internal.chat._getChatById,
      {
        chatId: message.chatId
      }
    )

    if (!chat) throw notFoundError

    if (!chat.collaborators?.includes(user.subject)) throw unauthorized

    const [model, streamId] = (await Promise.all([
      ctx.runAction(internal.model._resolveModel, {
        userId: user.subject,
        prompt: args.content
      }),
      streamingComponent.createStream(ctx)
    ])) as [Doc<'model'>, StreamId]

    await ctx.runMutation(internal.message._editMessage, {
      messageId: message._id,
      content: args.content,
      streamId,
      modelId: model._id
    })

    return message._id
  }
})

export const retryMessage = action({
  args: {
    messageId: v.id('message')
  },
  handler: async (
    ctx,
    args
  ): Promise<{ messageId: Id<'message'>; streamId: StreamId }> => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const message: Doc<'message'> | null = await ctx.runQuery(
      internal.message._getMessageById,
      {
        messageId: args.messageId
      }
    )

    if (!message) throw notFoundError

    const chat: Doc<'chat'> | null = await ctx.runQuery(
      internal.chat._getChatById,
      {
        chatId: message.chatId
      }
    )

    if (!chat) throw notFoundError

    if (!chat.collaborators?.includes(user.subject)) throw unauthorized

    const [model, streamId] = (await Promise.all([
      ctx.runAction(internal.model._resolveModel, {
        userId: user.subject,
        prompt: message.content
      }),
      streamingComponent.createStream(ctx)
    ])) as [Doc<'model'>, StreamId]

    await ctx.runMutation(internal.message._editMessageStreamId, {
      messageId: message._id,
      streamId,
      modelId: model._id
    })

    return {
      messageId: message._id,
      streamId
    }
  }
})

export const _getMessageById = internalQuery({
  args: { messageId: v.id('message') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.messageId)
  }
})

export const _editMessageStreamId = internalMutation({
  args: {
    messageId: v.id('message'),
    streamId: StreamIdValidator,
    modelId: v.optional(v.id('model'))
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.messageId, {
      streamId: args.streamId,
      modelId: args.modelId
    })
  }
})

export const _editMessage = internalMutation({
  args: {
    messageId: v.id('message'),
    streamId: StreamIdValidator,
    modelId: v.optional(v.id('model')),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)

    if (!message) throw notFoundError

    return ctx.db.patch(args.messageId, {
      content: args.content,
      streamId: args.streamId,
      modelId: args.modelId,
      contentHistory: [
        ...(message.contentHistory || []),
        {
          content: args.content,
          createdAt: Date.now()
        }
      ]
    })
  }
})
