import { type Infer, v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { generateCategory } from './ai'
import { clientInputError, serverError } from './error'
import { category } from './schema'

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
