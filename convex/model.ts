import { query } from './_generated/server'
import { unauthorized } from './error'

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
