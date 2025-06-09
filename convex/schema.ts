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
  bestModel: defineTable({
    category,
    model: v.id('model')
  }).index('byCategory', ['category']),
  model: defineTable({
    name: v.string(),
    provider: v.union(
      v.literal('openai'),
      v.literal('anthropic'),
      v.literal('google'),
      v.literal('deepseek')
    ),
    maxContextLength: v.number(),
    supportAttachments: v.boolean(),
    key: v.string(),
    description: v.optional(v.string())
  }).index('byKey', ['key']),
  userPreference: defineTable({
    userId: v.string(),
    theme: v.optional(v.string()),
    savedPrompt: v.optional(v.string()),
    generalPrompt: v.optional(v.string()),
    favoriteModel: v.optional(v.id('model')),
    favoriteCategory: v.optional(category),
    isAuto: v.optional(v.boolean()),
    uncategorized: v.optional(v.boolean()),
    autoSummarize: v.optional(v.boolean())
  }).index('byUserId', ['userId']),
  chat: defineTable({
    userId: v.string(),
    selectedModel: v.id('model'),
    title: v.optional(v.string()),
    pinned: v.boolean(),
    streamId: v.optional(v.string()),
    contextLength: v.optional(v.number()),
    initialPrompt: v.optional(v.string())
  })
    .index('byUserId', ['userId'])
    .index('byStreamIdAndUserId', ['streamId', 'userId']),
  message: defineTable({
    verticalIndex: v.number(), // For ordering messages in a chat
    horizontalIndex: v.number(), // For ordering retried messages
    chatId: v.id('chat'),
    userId: v.optional(v.string()),
    role: v.union(v.literal('user'), v.literal('assistant')),
    tokens: v.number(),
    content: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('retrying'),
      v.literal('queued')
    ),
    attachments: v.array(v.id('attachment'))
  }).index('byChatId', ['chatId']),
  summary: defineTable({
    chatId: v.id('chat'),
    userId: v.string(),
    automatic: v.boolean(),
    content: v.string(),
    tokens: v.number(),
    from: v.id('message'),
    to: v.id('message')
  }).index('byChatId', ['chatId']),
  attachment: defineTable({
    userId: v.string(),
    storageId: v.string(),
    format: v.union(v.literal('image'), v.literal('pdf')),
    url: v.string()
  }).index('byUserId', ['userId']),
  chatSharing: defineTable({
    chatId: v.id('chat'),
    userId: v.string(),
    title: v.string(),
    slug: v.string(),
    expirationTimestamp: v.optional(v.number()),
    password: v.optional(v.string()),
    firstMessage: v.optional(v.id('message')),
    lastMessage: v.optional(v.id('message'))
  }).index('byChatId', ['chatId']),
  chatCollaboration: defineTable({
    chatId: v.id('chat'),
    members: v.array(v.string())
  }),
  modelPrompt: defineTable({
    modelId: v.id('model'),
    userId: v.string(),
    content: v.string()
  }).index('byModelIdAndUserId', ['modelId', 'userId'])
})
