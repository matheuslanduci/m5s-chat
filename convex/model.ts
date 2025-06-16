import { type Infer, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc } from './_generated/dataModel'
import { internalAction, internalQuery, query } from './_generated/server'
import { serverError, unauthorized } from './error'
import { category } from './schema'

export const getModels = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return ctx.db.query('model').collect()
  }
})

export const getBestModels = query({
  handler: async (ctx) => {
    const bestModels = await ctx.db.query('bestModel').collect()

    const modelsWithDetails = await Promise.all(
      bestModels.map(async (bestModel) => {
        const model = await ctx.db.get(bestModel.modelId)

        return {
          category: bestModel.category,
          model: model
        }
      })
    )

    return modelsWithDetails.filter((item) => item.model !== null)
  }
})

export const _resolveModel = internalAction({
  args: {
    userId: v.string(),
    prompt: v.string()
  },
  handler: async (ctx, args): Promise<Doc<'model'>> => {
    const userPreference: Doc<'userPreference'> | null = await ctx.runQuery(
      internal.userPreference._getUserPreference,
      {
        userId: args.userId
      }
    )

    if (
      userPreference?.defaultModelSelection === 'model' &&
      userPreference.defaultModelId
    ) {
      const model: Doc<'model'> | null = await ctx.runQuery(
        internal.model._getModelById,
        {
          modelId: userPreference.defaultModelId
        }
      )

      if (!model) throw serverError

      return model
    }

    let selectedCategory: Infer<typeof category> =
      userPreference?.defaultCategory || 'Trivia'

    if ((userPreference?.defaultModelSelection || 'auto') === 'auto') {
      selectedCategory = await ctx.runAction(internal.ai._getBestCategory, {
        prompt: args.prompt
      })
    }

    const bestModel: Doc<'model'> | null = await ctx.runQuery(
      internal.model._getModelByCategory,
      {
        category: selectedCategory
      }
    )

    if (!bestModel) throw serverError

    return bestModel
  }
})

export const _getModelById = internalQuery({
  args: { modelId: v.id('model') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.modelId)
  }
})

export const _getModelByCategory = internalQuery({
  args: { category },
  handler: async (ctx, args) => {
    const bestModel = await ctx.db
      .query('bestModel')
      .withIndex('byCategory', (q) => q.eq('category', args.category))
      .first()

    if (!bestModel) return null

    return ctx.db.get(bestModel.modelId)
  }
})
