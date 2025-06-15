import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { unauthorized } from './error'

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.storage.generateUploadUrl()
  }
})

export const createAttachment = mutation({
  args: {
    storageId: v.string(),
    format: v.union(v.literal('image'), v.literal('pdf')),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const url = await ctx.storage.getUrl(args.storageId)

    if (!url) {
      throw new Error('Failed to get file URL')
    }

    const attachmentId = await ctx.db.insert('attachment', {
      userId: user.subject,
      storageId: args.storageId,
      format: args.format,
      name: args.name,
      url
    })

    return ctx.db.get(attachmentId)
  }
})

export const deleteAttachment = mutation({
  args: { attachmentId: v.id('attachment') },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const attachment = await ctx.db.get(args.attachmentId)

    if (!attachment || attachment.userId !== user.subject) throw unauthorized

    await ctx.storage.delete(attachment.storageId)
    await ctx.db.delete(args.attachmentId)

    return true
  }
})
