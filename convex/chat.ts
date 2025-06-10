import {
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator
} from '@convex-dev/persistent-text-streaming'
import { v } from 'convex/values'
import { z } from 'zod'
import { components, internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import {
  httpAction,
  internalMutation,
  internalQuery,
  mutation,
  query
} from './_generated/server'
import { generateTitle, streamText } from './ai'
import { notFoundError, unauthorized } from './error'
import { category } from './schema'

const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
)

export const createChat = mutation({
  args: {
    prompt: v.string(),
    modelType: v.union(
      // When a model was picked from the model list
      v.literal('key'),
      // When a model was picked from the category list
      v.literal('category'),
      // When a model was not picked and AI will choose the best model
      v.literal('auto')
    ),
    model: v.optional(v.string()), // Present if modelType is 'key'
    category: v.optional(category) // Present if modelType is 'category'
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw unauthorized
    }

    const [streamId, title, model] = (await Promise.all([
      persistentTextStreaming.createStream(ctx),
      generateTitle(args.prompt),
      ctx.runQuery(internal.model._getModel, {
        type: args.modelType,
        selectedModel: args.model,
        selectedCategory: args.category,
        prompt: args.prompt
      })
    ])) as [StreamId, string, Doc<'model'>]

    const chatId: Id<'chat'> = await ctx.db.insert('chat', {
      pinned: false,
      userId: user.subject,
      selectedModel: model._id,
      title,
      streamId,
      initialPrompt: args.prompt
    })

    return { chatId, streamId, title, model }
  }
})

export const getChatBody = query({
  args: {
    streamId: StreamIdValidator
  },
  handler: async (ctx, { streamId }) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw unauthorized
    }

    const chat = await ctx.db
      .query('chat')
      .withIndex('byStreamIdAndUserId', (q) =>
        q.eq('streamId', streamId).eq('userId', user.subject)
      )
      .first()

    if (!chat) {
      throw notFoundError
    }

    return await persistentTextStreaming.getStreamBody(
      ctx,
      streamId as StreamId
    )
  }
})

export const streamChat = httpAction(async (ctx, request) => {
  const user = await ctx.auth.getUserIdentity()

  if (!user) {
    throw unauthorized
  }

  const body = await request.json()

  const parsed = z
    .object({
      streamId: z.string()
    })
    .safeParse(body)

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request body. Expected { streamId: string }'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { streamId } = parsed.data

  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    streamId as StreamId,
    async (ctx, request, streamId, chunkAppender) => {
      const { chat, messages } = await ctx.runQuery(
        internal.chat._getMessagesFromStreamId,
        {
          streamId,
          userId: user.subject
        }
      )

      await streamText({
        messages,
        model: chat.selectedModel,
        onTextPart: async (textPart) => {
          await chunkAppender(textPart)
        },
        onFinish: async ({ text, usage }) => {
          await ctx.runMutation(internal.chat._insertMessage, {
            chatId: chat._id,
            role: 'assistant',
            content: text,
            status: 'completed',
            tokens: usage.totalTokens
          })
        }
      })
    }
  )

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Vary', 'Origin')
  return response
})

export const _getMessagesFromStreamId = internalQuery({
  args: {
    streamId: StreamIdValidator,
    userId: v.string()
  },
  handler: async (ctx, { streamId, userId }) => {
    const chat = await ctx.db
      .query('chat')
      .withIndex('byStreamIdAndUserId', (q) =>
        q.eq('streamId', streamId).eq('userId', userId)
      )
      .first()

    if (!chat) {
      throw notFoundError
    }

    const messages = await ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', chat._id))
      .order('desc')
      .collect()

    return {
      messages,
      chat
    }
  }
})

export const _insertMessage = internalMutation({
  args: {
    chatId: v.id('chat'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    tokens: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('retrying'),
      v.literal('queued')
    ),
    attachments: v.optional(v.array(v.id('attachment')))
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('message', {
      ...args,
      attachments: args.attachments ?? [],
      verticalIndex: Date.now(),
      horizontalIndex: 0
    })

    return messageId
  }
})

// Get user's chat history
export const getUserChats = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('chat'),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.optional(v.string()),
      pinned: v.boolean(),
      initialPrompt: v.optional(v.string())
    })
  ),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.db
      .query('chat')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .order('desc')
      .collect()
  }
})

// Get chat by ID
export const getChatById = query({
  args: { chatId: v.id('chat') },
  returns: v.union(
    v.object({
      _id: v.id('chat'),
      _creationTime: v.number(),
      userId: v.string(),
      selectedModel: v.id('model'),
      title: v.optional(v.string()),
      pinned: v.boolean(),
      streamId: v.optional(v.string()),
      contextLength: v.optional(v.number()),
      initialPrompt: v.optional(v.string())
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db.get(args.chatId)

    if (!chat || chat.userId !== user.subject) {
      return null
    }

    return chat
  }
})

// Pin/unpin a chat
export const toggleChatPin = mutation({
  args: { chatId: v.id('chat') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db.get(args.chatId)

    if (!chat || chat.userId !== user.subject) {
      throw new Error('Chat not found or access denied')
    }

    await ctx.db.patch(args.chatId, {
      pinned: !chat.pinned
    })

    return null
  }
})

// Delete a chat
export const deleteChat = mutation({
  args: { chatId: v.id('chat') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const chat = await ctx.db.get(args.chatId)

    if (!chat || chat.userId !== user.subject) {
      throw new Error('Chat not found or access denied')
    }

    // Delete all messages associated with the chat
    const messages = await ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', args.chatId))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete the chat
    await ctx.db.delete(args.chatId)

    return null
  }
})
