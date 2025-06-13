import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'
import { notFoundError, unauthorized } from './error'

// Get all messages for a specific chat
export const getMessagesByChatId = query({
  args: { chatId: v.id('chat') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw unauthorized
    }

    // First verify the user owns this chat
    const chat = await ctx.db.get(args.chatId)
    if (!chat || chat.userId !== user.subject) {
      throw notFoundError
    }

    // Get all messages for this chat ordered by creation time
    const messages = await ctx.db
      .query('message')
      .withIndex('byChatId', (q) => q.eq('chatId', args.chatId))
      .order('asc')
      .collect()

    return messages
  }
})

// Send a message to an existing chat
export const sendMessage = mutation({
  args: {
    chatId: v.id('chat'),
    content: v.string(),
    attachments: v.optional(v.array(v.id('attachment')))
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw unauthorized
    }

    // Verify the user owns this chat
    const chat = await ctx.db.get(args.chatId)
    if (!chat || chat.userId !== user.subject) {
      throw notFoundError
    }

    // Insert the user message
    const messageId = await ctx.db.insert('message', {
      chatId: args.chatId,
      role: 'user',
      content: args.content,
      attachments: args.attachments ?? [],
      status: 'completed',
      tokens: 0, // User messages don't have token costs
      verticalIndex: Date.now(),
      horizontalIndex: 0
    })

    return { messageId, streamId: chat.streamId }
  }
})

// Action to trigger AI response streaming
export const triggerAIResponse = action({
  args: {
    streamId: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) {
      throw unauthorized
    }

    try {
      // For now, just log that we would trigger AI response
      // The actual AI response streaming should be handled differently
      // or automatically when a user message is added
      console.log(
        'AI response should be triggered for streamId:',
        args.streamId
      )

      return { success: true }
    } catch (error) {
      console.error('Failed to trigger AI response:', error)
      throw error
    }
  }
})
