import { type Infer, v } from 'convex/values'
import { internalQuery, query } from './_generated/server'
import { generateCategory } from './ai'
import { clientInputError, serverError, unauthorized } from './error'
import { category } from './schema'

// Public queries for UI
export const getAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('model').collect()
  }
})

export const getUserModelPreference = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const userPreference = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .first()

    if (!userPreference) {
      return { type: 'isAuto' as const, isAuto: true }
    }

    // Priority: favoriteModel > favoriteCategory > isAuto
    if (userPreference.favoriteModel) {
      const model = await ctx.db.get(userPreference.favoriteModel)
      if (model) {
        return {
          type: 'favoriteModel' as const,
          model,
          isAuto: false
        }
      }
    }

    if (userPreference.favoriteCategory) {
      return {
        type: 'favoriteCategory' as const,
        category: userPreference.favoriteCategory,
        isAuto: false
      }
    }

    return {
      type: 'isAuto' as const,
      isAuto: userPreference.isAuto ?? true
    }
  }
})

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const bestModels = await ctx.db.query('bestModel').collect()
    return bestModels.map((bm) => bm.category)
  }
})

export const getModelByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('model')
      .withIndex('byKey', (q) => q.eq('key', args.key))
      .first()
  }
})

export const _getModel = internalQuery({
  args: {
    type: v.union(v.literal('key'), v.literal('category'), v.literal('auto')),
    selectedModel: v.optional(v.string()),
    selectedCategory: v.optional(category),
    prompt: v.string()
  },
  handler: async (ctx, args) => {
    const { selectedModel } = args

    if (args.type === 'key') {
      if (!selectedModel) {
        throw clientInputError
      }

      const model = await ctx.db
        .query('model')
        .withIndex('byKey', (q) => q.eq('key', selectedModel))
        .first()

      if (!model) {
        throw clientInputError
      }

      return model
    }

    let selectedCategory: Infer<typeof category> | undefined =
      args.selectedCategory

    if (args.type === 'auto') {
      selectedCategory = await generateCategory(args.prompt)
    }

    if (!selectedCategory) {
      throw clientInputError
    }

    const result = await ctx.db
      .query('bestModel')
      .withIndex('byCategory', (q) => q.eq('category', selectedCategory))
      .first()

    if (!result) {
      throw serverError
    }

    const model = await ctx.db.get(result.model)

    if (!model) {
      throw serverError
    }

    return model
  }
})
