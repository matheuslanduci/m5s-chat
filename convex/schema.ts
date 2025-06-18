import { StreamIdValidator } from '@convex-dev/persistent-text-streaming'
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
    supportImage: v.boolean(),
    supportReasoning: v.optional(v.boolean())
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
    defaultCategory: v.optional(category),
    byokEnabled: v.optional(v.boolean()),
    byokKey: v.optional(v.string())
  }).index('byUserId', ['userId']),
  chat: defineTable({
    ownerId: v.string(),
    clientId: v.string(),
    title: v.optional(v.string()),
    pinned: v.boolean(),
    contextTokens: v.optional(v.number()),
    initialPrompt: v.string(),
    collaborators: v.optional(v.array(v.string())),
    lastMessageAt: v.optional(v.number()),
    isBranch: v.optional(v.boolean()),
    branchOf: v.optional(v.id('chat'))
  })
    .index('byOwnerId', ['ownerId'])
    .index('byClientId', ['clientId']),
  message: defineTable({
    chatId: v.id('chat'),
    userId: v.string(),
    status: v.optional(v.union(v.literal('pending'), v.literal('completed'))),
    streamId: v.optional(StreamIdValidator),
    content: v.string(),
    contentHistory: v.optional(
      v.array(
        v.object({
          content: v.string(),
          createdAt: v.number()
        })
      )
    ),
    modelId: v.optional(v.id('model')),
    selectedResponseIndex: v.optional(v.number()),
    responses: v.optional(
      v.array(
        v.object({
          content: v.string(),
          modelId: v.optional(v.id('model')),
          modelName: v.optional(v.string()),
          reasoning: v.optional(v.string()),
          finished: v.optional(v.boolean()),
          provider: v.union(
            v.literal('openai'),
            v.literal('anthropic'),
            v.literal('google'),
            v.literal('deepseek')
          ),
          tokens: v.number(),
          createdAt: v.number()
        })
      )
    ),
    attachments: v.optional(v.array(v.id('attachment')))
  })
    .index('byChatId', ['chatId'])
    .index('byStreamId', ['streamId']),
  attachment: defineTable({
    userId: v.string(),
    storageId: v.string(),
    name: v.string(),
    format: v.union(v.literal('image'), v.literal('pdf')),
    url: v.string()
  }).index('byUserId', ['userId']),
  bestModel: defineTable({
    category,
    modelId: v.id('model')
  }).index('byCategory', ['category'])
})
