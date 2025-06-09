import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { unauthorized } from './error'
import { category } from './schema'

export const getUserPreferences = query({
  returns: v.union(
    v.object({
      _id: v.id('userPreference'),
      _creationTime: v.number(),
      userId: v.string(),
      theme: v.optional(v.string()),
      savedPrompt: v.optional(v.string()),
      generalPrompt: v.optional(v.string()),
      favoriteModel: v.optional(v.id('model')),
      favoriteCategory: v.optional(category),
      isAuto: v.optional(v.boolean()),
      uncategorized: v.optional(v.boolean()),
      autoSummarize: v.optional(v.boolean())
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    return await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()
  }
})

// Create or update user preferences
export const upsertUserPreferences = mutation({
  args: {
    theme: v.optional(v.string()),
    savedPrompt: v.optional(v.string()),
    generalPrompt: v.optional(v.string()),
    favoriteModel: v.optional(v.id('model')),
    favoriteCategory: v.optional(category),
    isAuto: v.optional(v.boolean()),
    uncategorized: v.optional(v.boolean()),
    autoSummarize: v.optional(v.boolean())
  },
  returns: v.id('userPreference'),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const existingPrefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (existingPrefs) {
      await ctx.db.patch(existingPrefs._id, {
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.savedPrompt !== undefined && {
          savedPrompt: args.savedPrompt
        }),
        ...(args.generalPrompt !== undefined && {
          generalPrompt: args.generalPrompt
        }),
        ...(args.favoriteModel !== undefined && {
          favoriteModel: args.favoriteModel
        }),
        ...(args.favoriteCategory !== undefined && {
          favoriteCategory: args.favoriteCategory
        }),
        ...(args.uncategorized !== undefined && {
          uncategorized: args.uncategorized
        }),
        ...(args.autoSummarize !== undefined && {
          autoSummarize: args.autoSummarize
        })
      })
      return existingPrefs._id
    }

    return await ctx.db.insert('userPreference', {
      userId: user.subject,
      ...(args.theme !== undefined && { theme: args.theme }),
      ...(args.savedPrompt !== undefined && {
        savedPrompt: args.savedPrompt
      }),
      ...(args.generalPrompt !== undefined && {
        generalPrompt: args.generalPrompt
      }),
      ...(args.favoriteModel !== undefined && {
        favoriteModel: args.favoriteModel
      }),
      ...(args.favoriteCategory !== undefined && {
        favoriteCategory: args.favoriteCategory
      }),
      ...(args.uncategorized !== undefined && {
        uncategorized: args.uncategorized
      }),
      ...(args.autoSummarize !== undefined && {
        autoSummarize: args.autoSummarize
      })
    })
  }
})

// Update theme
export const updateTheme = mutation({
  args: {
    theme: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { theme: args.theme })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        theme: args.theme
      })
    }
  }
})

// Get theme
export const getTheme = query({
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.theme ?? null
  }
})

// Update saved prompt
export const updateSavedPrompt = mutation({
  args: {
    savedPrompt: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { savedPrompt: args.savedPrompt })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        savedPrompt: args.savedPrompt
      })
    }
  }
})

// Get saved prompt
export const getSavedPrompt = query({
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.savedPrompt ?? null
  }
})

// Update general prompt
export const updateGeneralPrompt = mutation({
  args: {
    generalPrompt: v.string()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { generalPrompt: args.generalPrompt })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        generalPrompt: args.generalPrompt
      })
    }
  }
})

// Get general prompt
export const getGeneralPrompt = query({
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.generalPrompt ?? null
  }
})

// Update favorite model
export const updateFavoriteModel = mutation({
  args: {
    favoriteModel: v.id('model')
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { favoriteModel: args.favoriteModel })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        favoriteModel: args.favoriteModel
      })
    }
  }
})

// Get favorite model
export const getFavoriteModel = query({
  returns: v.union(v.id('model'), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.favoriteModel ?? null
  }
})

// Update favorite category
export const updateFavoriteCategory = mutation({
  args: {
    favoriteCategory: category
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { favoriteCategory: args.favoriteCategory })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        favoriteCategory: args.favoriteCategory
      })
    }
  }
})

// Get favorite category
export const getFavoriteCategory = query({
  returns: v.union(category, v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.favoriteCategory ?? null
  }
})

// Update uncategorized setting
export const updateUncategorized = mutation({
  args: {
    uncategorized: v.boolean()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { uncategorized: args.uncategorized })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        uncategorized: args.uncategorized
      })
    }
  }
})

// Get uncategorized setting
export const getUncategorized = query({
  returns: v.union(v.boolean(), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.uncategorized ?? null
  }
})

// Update auto summarize setting
export const updateAutoSummarize = mutation({
  args: {
    autoSummarize: v.boolean()
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.patch(prefs._id, { autoSummarize: args.autoSummarize })
    } else {
      await ctx.db.insert('userPreference', {
        userId: user.subject,
        autoSummarize: args.autoSummarize
      })
    }
  }
})

// Get auto summarize setting
export const getAutoSummarize = query({
  returns: v.union(v.boolean(), v.null()),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    return prefs?.autoSummarize ?? null
  }
})

// Delete user preferences
export const deleteUserPreferences = mutation({
  returns: v.null(),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const prefs = await ctx.db
      .query('userPreference')
      .withIndex('byUserId', (q) => q.eq('userId', user.subject))
      .unique()

    if (prefs) {
      await ctx.db.delete(prefs._id)
    }
  }
})
