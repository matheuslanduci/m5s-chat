import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject, streamText as generateStreamText } from 'ai'
import { v } from 'convex/values'
import { z } from 'zod'
import { action } from './_generated/server'

const TITLE_MODEL = 'google/gemini-2.0-flash-001'
const CATEGORY_MODEL = 'google/gemini-2.0-flash-001'
const ENHANCE_MODEL = 'google/gemini-2.0-flash-001'

export async function generateTitle(prompt: string) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
  })

  const response = await generateObject({
    model: openRouter(TITLE_MODEL),
    prompt: `Generate a concise and descriptive title for the following content:\n\n${prompt}`,
    schema: z.object({
      title: z.string().describe('The generated title for the content')
    }),
    maxTokens: 20,
    temperature: 0.5
  })

  return response.object.title
}

export async function generateCategory(prompt: string) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
  })

  const response = await generateObject({
    model: openRouter(CATEGORY_MODEL),
    prompt: `Classify the following content into one of the categories: Programming, Roleplay, Marketing, SEO, Technology, Science, Translation, Legal, Finance, Health, Trivia, Academia.\n\nContent:\n${prompt}`,
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
          'Academia'
        ])
        .describe('The category of the content')
    }),
    maxTokens: 20,
    temperature: 0.5
  })

  return response.object.category
}

type OnFinishArgs = {
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  text: string
}

type StreamTextArgs = {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  model: string
  onTextPart: (textPart: string) => Promise<void>
  onFinish: (args: OnFinishArgs) => Promise<void>
}

export async function streamText({
  messages,
  model,
  onTextPart,
  onFinish
}: StreamTextArgs) {
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY
  })

  const response = generateStreamText({
    model: openRouter(model),
    messages,
    onFinish: async (result) => {
      await onFinish({
        text: result.text,
        usage: {
          inputTokens: result.usage.promptTokens,
          outputTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens
        }
      })
    }
  })

  for await (const textPart of response.textStream) {
    await onTextPart(textPart)
  }

  return response
}

export const enhancePrompt = action({
  args: {
    userPrompt: v.string(),
    generalPrompt: v.optional(v.string())
  },
  handler: async (_ctx, args) => {
    const openRouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY
    })

    const systemContext = args.generalPrompt
      ? `Context: The user has set this general prompt to guide their interactions: "${args.generalPrompt}"\n\n`
      : ''

    const enhanceInstructions = `${systemContext}Your task is to enhance and improve the following user prompt to make it more effective, clear, and specific while preserving the user's original intent. 

First, assess if this is a reliable, actionable prompt. A reliable prompt should:
- Represent a clear request, question, or instruction
- Have sufficient context to understand the user's intent
- Be coherent and meaningful
- Not be spam, gibberish, or meaningless text

If the prompt is reliable, enhance it according to these guidelines:
1. Maintain the core meaning and purpose of the original prompt
2. Add clarity and specificity where needed
3. Improve structure and flow
4. ${args.generalPrompt ? "Align with the user's general prompt context when relevant" : 'Be more engaging and effective'}
5. Keep the same tone and style preference as the original

If the prompt is not reliable, still provide an enhanced version but mark it as unreliable and explain why.

User's original prompt: "${args.userPrompt}"

Please provide an enhanced version and assess its reliability:`

    const response = await generateObject({
      model: openRouter(ENHANCE_MODEL),
      prompt: enhanceInstructions,
      schema: z.object({
        enhancedPrompt: z
          .string()
          .describe('The enhanced and improved version of the user prompt'),
        improvements: z
          .array(z.string())
          .describe('List of improvements made to the original prompt'),
        isReliable: z
          .boolean()
          .describe(
            'Whether the prompt represents a valid, actionable request or question that can be meaningfully enhanced'
          ),
        unreliableReason: z
          .string()
          .optional()
          .describe(
            'If isReliable is false, explain why the prompt is not reliable (e.g., too vague, nonsensical, not a request)'
          )
      }),
      maxTokens: 500,
      temperature: 0.7
    })

    return {
      enhancedPrompt: response.object.enhancedPrompt,
      improvements: response.object.improvements,
      originalPrompt: args.userPrompt,
      isReliable: response.object.isReliable,
      unreliableReason: response.object.unreliableReason
    }
  }
})
