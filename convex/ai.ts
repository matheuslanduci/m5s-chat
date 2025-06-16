import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { v } from 'convex/values'
import { z } from 'zod'
import { action, internalAction } from './_generated/server'
import { unauthorized } from './error'

export const enhancePrompt = action({
  args: {
    prompt: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY
    })

    const enhanceInstructions = `Your task is to enhance and improve the following user prompt to make it more effective, clear, and specific while preserving the user's original intent.

First, assess if this is a reliable, actionable prompt. A reliable prompt should:
- Represent a clear request, question, or instruction
- Have sufficient context to understand the user's intent
- Be coherent and meaningful
- Not be spam, gibberish, or meaningless text

If the prompt is reliable, enhance it according to these guidelines:
1. Maintain the core meaning and purpose of the original prompt
2. Add clarity and specificity where needed
3. Improve structure and flow
4. Keep the same tone and style preference as the original
5. Do NOT add your own perspective, opinions, or judgments to the prompt
6. Remain completely neutral and objective in your enhancement

User's original prompt: "${args.prompt}"

Please provide an enhanced version and assess its reliability:`

    const response = await generateObject({
      model: openRouter('google/gemini-2.0-flash-lite-001'),
      prompt: enhanceInstructions,
      schema: z.object({
        enhancedPrompt: z
          .string()
          .describe('The enhanced and improved version of the user prompt'),
        isReliable: z
          .boolean()
          .describe(
            'Whether the prompt represents a valid, actionable request or question that can be meaningfully enhanced'
          )
          .default(false)
      }),
      maxTokens: 500,
      temperature: 0.7
    })

    return {
      enhancedPrompt: response.object.enhancedPrompt,
      isReliable: response.object.isReliable
    }
  }
})

export const _generateTitle = internalAction({
  args: {
    prompt: v.string()
  },
  handler: async (_, args) => {
    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY
    })

    const response = await generateObject({
      model: openRouter('google/gemini-2.0-flash-lite-001'),
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that generates concise and descriptive titles 
for content given directly by the user. Your task is to create a title that 
accurately reflects the content provided by the user. The title should be clear,
informative, and engaging, while avoiding unnecessary complexity or jargon. 
If the content is not clear, use a generic description for the content, 
such as "Code Snippet in JavaScript" or "Code Snippet in Python" depending 
on the language used.`
        },
        {
          role: 'user',
          content: args.prompt
        }
      ],
      schema: z.object({
        title: z.string().describe('The generated title for the content')
      }),
      output: 'object',
      maxTokens: 50,
      temperature: 0.5
    })

    return response.object.title
  }
})

export const _getBestCategory = internalAction({
  args: {
    prompt: v.string()
  },
  handler: async (_, args) => {
    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY
    })

    const response = await generateObject({
      model: openRouter('google/gemini-2.0-flash-lite-001'),
      prompt: `Classify the following content into one of the categories: Programming, Roleplay, Marketing, SEO, Technology, Science, Translation, Legal, Finance, Health, Trivia, Academia or Other.\n\nContent:\n${args.prompt}`,
      schema: z.object({
        category: z
          .enum([
            'Programming',
            'Roleplay',
            'Marketing',
            'SEO',
            'Technology',
            'Science',
            'Translation',
            'Legal',
            'Finance',
            'Health',
            'Trivia',
            'Academia',
            'Other'
          ])
          .default('Other')
          .describe('The category of the content')
      }),
      maxTokens: 20,
      temperature: 0.5
    })

    return response.object.category === 'Other'
      ? 'Trivia'
      : response.object.category
  }
})
