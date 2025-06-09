import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject, streamText as generateStreamText } from 'ai'
import { z } from 'zod'

const TITLE_MODEL = 'google/gemini-2.0-flash-001'
const CATEGORY_MODEL = 'google/gemini-2.0-flash-001'

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
