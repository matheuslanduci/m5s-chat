import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const category = v.union(
  v.literal('Programming'),
  v.literal('Roleplay'),
  v.literal('Marketing'),
  v.literal('SEO'),
  v.literal('Technology'),
  v.literal('Science'),
  v.literal('Translation'),
  v.literal('Legal'),
  v.literal('Finance'),
  v.literal('Health'),
  v.literal('Trivia'),
  v.literal('Academia')
)

export default defineSchema({
  model: defineTable({
    key: v.string(),
    name: v.string(),
    provider: v.union(
      v.literal('openai'),
      v.literal('anthropic'),
      v.literal('google'),
      v.literal('deepseek')
    ),
    maxContextTokens: v.number(),
    supportPDF: v.boolean(),
    supportImage: v.boolean()
  }),
  userPreference: defineTable({
    userId: v.string(),
    theme: v.optional(
      v.union(v.literal('light'), v.literal('dark'), v.literal('system'))
    ),
    generalPrompt: v.optional(v.string()),
    defaultModelSelection: v.optional(
      v.union(v.literal('auto'), v.literal('category'), v.literal('model'))
    ),
    defaultModelId: v.optional(v.id('model')),
    defaultCategory: v.optional(category)
  }).index('byUserId', ['userId'])
})
