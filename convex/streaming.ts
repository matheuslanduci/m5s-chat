import {
  PersistentTextStreaming,
  type StreamId
} from '@convex-dev/persistent-text-streaming'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { v } from 'convex/values'
import z from 'zod'
import { components, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { httpAction, query } from './_generated/server'
import { serverError, unauthorized } from './error'

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
)

export const getStreamBody = query({
  args: {
    messageId: v.id('message')
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const message = await ctx.db.get(args.messageId)

    if (!message) throw unauthorized

    const chat = await ctx.db.get(message.chatId)

    if (!chat?.collaborators?.includes(user.subject)) throw unauthorized

    return await streamingComponent.getStreamBody(
      ctx,
      message.streamId as StreamId
    )
  }
})

export const streamChat = httpAction(async (ctx, request) => {
  const user = await ctx.auth.getUserIdentity()

  if (!user) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const body = await request.json()

  const parsed = z
    .object({
      messageId: z.string(),
      apiKey: z.string().optional()
    })
    .safeParse(body)

  if (!parsed.success) {
    return new Response('Invalid request body', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const { messageId } = parsed.data

  const message = await ctx.runQuery(internal.message._getMessageById, {
    messageId: messageId as Id<'message'>
  })

  if (!message) {
    return new Response('Message not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  const response = await streamingComponent.stream(
    ctx,
    request,
    message.streamId as StreamId,
    async (ctx, _req, _streamId, append) => {
      const model = await ctx.runQuery(internal.model._getModelById, {
        modelId: message?.modelId ?? ('unknown' as Id<'model'>)
      })

      if (!model) throw serverError

      const messages = await ctx.runQuery(
        internal.message._getMessagesByChatId,
        {
          chatId: message.chatId
        }
      )

      const messageHistory: Array<
        | {
            role: 'system' | 'assistant'
            content: string
          }
        | {
            role: 'user'
            content:
              | string
              | Array<
                  | {
                      type: 'text'
                      text: string
                    }
                  | {
                      type: 'image'
                      image: URL
                    }
                  | {
                      type: 'file'
                      data: URL
                      mimeType: string
                    }
                >
          }
      > = []

      const userPreference = await ctx.runQuery(
        internal.userPreference._getUserPreferenceByUserId,
        {
          userId: user.subject
        }
      )

      messageHistory.push({
        role: 'system',
        content: `You are a helpful assistant. You are the model ${model.name}
provided by ${model.provider}. Please answer's the user's questions in a markdown
format.`
      })

      if (userPreference?.generalPrompt) {
        messageHistory.push({
          role: 'system',
          content: userPreference.generalPrompt
        })
      }

      const filteredMessages = messages.filter(
        (msg) => msg._creationTime <= message._creationTime
      )

      for (const msg of filteredMessages) {
        if (msg.attachments?.length) {
          if (!model.supportImage && !model.supportPDF) {
            continue
          }

          const attachments = await ctx.runQuery(
            internal.attachment._getAttachmentsByIds,
            {
              attachmentIds: msg.attachments
            }
          )

          if (
            attachments.some((attachment) => {
              if (attachment.format === 'image' && !model.supportImage)
                return true
              if (attachment.format === 'pdf' && !model.supportPDF) return true
              return false
            })
          ) {
            continue
          }

          messageHistory.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: msg.content || 'Attached'
              },
              ...attachments.map((attachment) => {
                if (attachment.format === 'image') {
                  return {
                    type: 'image' as const,
                    image: new URL(attachment.url)
                  }
                }

                return {
                  type: 'file' as const,
                  data: new URL(attachment.url),
                  mimeType: attachment.format === 'pdf' ? 'application/pdf' : ''
                }
              })
            ]
          })

          continue
        }

        messageHistory.push({
          role: 'user',
          content: msg.content
        })

        if (
          msg.responses &&
          msg.responses.length > 0 &&
          msg._id !== message._id
        ) {
          const response =
            msg.responses[msg.selectedResponseIndex || msg.responses.length - 1]

          messageHistory.push({
            role: 'assistant',
            content: response?.content || ''
          })
        }
      }

      const openRouter = createOpenRouter({
        apiKey: parsed.data.apiKey || process.env.OPENROUTER_API_KEY
      })

      const stream = streamText({
        messages: messageHistory,
        model: openRouter(model.key),
        temperature: 0.7,
        onFinish: async (response) => {
          await ctx.runMutation(internal.message._addResponseToMessage, {
            messageId: message._id,
            response: {
              content: response.text,
              modelId: message.modelId,
              modelName: model.name,
              provider: model.provider,
              tokens: response.usage.completionTokens,
              createdAt: Date.now()
            }
          })
        }
      })

      for await (const textPart of stream.textStream) {
        await append(textPart)
      }
    }
  )

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Vary', 'Origin')

  return response
})
