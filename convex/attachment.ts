import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { unauthorized } from './error'

// Generate upload URL for file upload
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.storage.generateUploadUrl()
  }
})

// Create attachment record after file upload
export const createAttachment = mutation({
  args: {
    storageId: v.string(),
    format: v.union(v.literal('image'), v.literal('pdf'))
  },
  returns: v.id('attachment'),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    // Get the file URL from storage
    const url = await ctx.storage.getUrl(args.storageId)

    if (!url) {
      throw new Error('Failed to get file URL')
    }

    // Create attachment record
    const attachmentId = await ctx.db.insert('attachment', {
      userId: user.subject,
      storageId: args.storageId,
      format: args.format,
      url
    })

    return attachmentId
  }
})

// Get user's attachments
export const getUserAttachments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('attachment'),
      _creationTime: v.number(),
      userId: v.string(),
      storageId: v.string(),
      format: v.union(v.literal('image'), v.literal('pdf')),
      url: v.string()
    })
  ),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.db
      .query('attachment')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .order('desc')
      .collect()
  }
})

// Get attachment by ID
export const getAttachment = query({
  args: { attachmentId: v.id('attachment') },
  returns: v.union(
    v.object({
      _id: v.id('attachment'),
      _creationTime: v.number(),
      userId: v.string(),
      storageId: v.string(),
      format: v.union(v.literal('image'), v.literal('pdf')),
      url: v.string()
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const attachment = await ctx.db.get(args.attachmentId)

    if (!attachment || attachment.userId !== user.subject) {
      return null
    }

    return attachment
  }
})

// Delete attachment
export const deleteAttachment = mutation({
  args: { attachmentId: v.id('attachment') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const attachment = await ctx.db.get(args.attachmentId)

    if (!attachment || attachment.userId !== user.subject) {
      throw new Error('Attachment not found or access denied')
    }

    // Delete the file from storage
    await ctx.storage.delete(attachment.storageId)

    // Delete the attachment record
    await ctx.db.delete(args.attachmentId)

    return null
  }
})
