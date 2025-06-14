import { type Infer, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalAction, internalQuery, query } from './_generated/server'
import { generateCategory } from './ai'
import { clientInputError, serverError, unauthorized } from './error'
import { category } from './schema'

// Internal queries to wrap database operations
export const _getModelByKey = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('model')
      .withIndex('byKey', (q) => q.eq('key', args.key))
      .first()
  }
})

export const _getBestModelByCategory = internalQuery({
  args: { category },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('bestModel')
      .withIndex('byCategory', (q) => q.eq('category', args.category))
      .first()
  }
})

export const _getModelById = internalQuery({
  args: { modelId: v.id('model') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.modelId)
  }
})

// Public queries for UI
export const getAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('model').collect()
  }
})

export const getAllBestModels = query({
  args: {},
  handler: async (ctx) => {
    const bestModels = await ctx.db.query('bestModel').collect()

    // Fetch the actual model details for each best model
    const modelsWithDetails = await Promise.all(
      bestModels.map(async (bestModel) => {
        const model = await ctx.db.get(bestModel.model)
        return {
          category: bestModel.category,
          model: model
        }
      })
    )

    return modelsWithDetails.filter((item) => item.model !== null)
  }
})

export const getBestModelByCategory = query({
  args: { category },
  handler: async (ctx, args) => {
    const bestModel = await ctx.db
      .query('bestModel')
      .withIndex('byCategory', (q) => q.eq('category', args.category))
      .first()

    if (!bestModel) {
      return null
    }

    const model = await ctx.db.get(bestModel.model)

    return {
      category: bestModel.category,
      model: model
    }
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

export const _getModel = internalAction({
  args: {
    type: v.union(v.literal('key'), v.literal('category'), v.literal('auto')),
    selectedModel: v.optional(v.string()),
    selectedCategory: v.optional(category),
    prompt: v.string()
  },
  handler: async (ctx, args): Promise<Doc<'model'>> => {
    const { selectedModel } = args

    if (args.type === 'key') {
      if (!selectedModel) {
        throw clientInputError
      }

      const model = await ctx.runQuery(internal.model._getModelByKey, {
        key: selectedModel
      })

      if (!model) {
        throw clientInputError
      }

      return model
    }

    let selectedCategory: Infer<typeof category> | undefined =
      args.selectedCategory

    if (args.type === 'auto') {
      selectedCategory = await generateCategory(args.prompt)

      if (selectedCategory === 'Other') {
        selectedCategory = 'Trivia'
      }
    }

    if (!selectedCategory) {
      throw clientInputError
    }

    const result = await ctx.runQuery(internal.model._getBestModelByCategory, {
      category: selectedCategory
    })

    if (!result) {
      throw serverError
    }

    const model = await ctx.runQuery(internal.model._getModelById, {
      modelId: result.model
    })

    if (!model) {
      throw serverError
    }

    return model
  }
})
