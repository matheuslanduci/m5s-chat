import { v } from 'convex/values'
import { internalQuery, mutation, query } from './_generated/server'
import { serverError, unauthorized } from './error'
import { category } from './schema'

export const _getUserPreference = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', args.userId))
      .unique()
  }
})

export const getUserPreference = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const userPreference = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (!userPreference) return null

    if (
      userPreference.defaultModelSelection === 'model' &&
      userPreference.defaultModelId
    ) {
      const model = await ctx.db.get(userPreference.defaultModelId)

      if (!model) throw serverError

      return {
        ...userPreference,
        defaultModel: model
      }
    }

    return {
      ...userPreference,
      defaultModel: undefined
    }
  }
})

export const setUserPreference = mutation({
  args: {
    theme: v.optional(
      v.union(v.literal('light'), v.literal('dark'), v.literal('system'))
    ),
    generalPrompt: v.optional(v.string()),
    defaultModelSelection: v.optional(
      v.union(v.literal('auto'), v.literal('category'), v.literal('model'))
    ),
    defaultModelId: v.optional(v.id('model')),
    defaultCategory: v.optional(category)
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const userPreference = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (userPreference) {
      return await ctx.db.patch(userPreference._id, {
        ...args,
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.generalPrompt !== undefined && {
          generalPrompt: args.generalPrompt
        }),
        userId: user.subject
      })
    }

    return await ctx.db.insert('userPreference', {
      ...args,
      userId: user.subject
    })
  }
})
