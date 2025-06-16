import {
  PersistentTextStreaming,
  type StreamId,
  StreamIdValidator
} from '@convex-dev/persistent-text-streaming'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import z from 'zod'
import { components } from './_generated/api'
import { httpAction, query } from './_generated/server'
import { unauthorized } from './error'

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
)

export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity()

    if (!user) throw unauthorized

    const message = await ctx.db
      .query('message')
      .withIndex('byStreamId', (q) => q.eq('streamId', args.streamId))
      .first()

    if (!message) throw unauthorized

    const chat = await ctx.db.get(message.chatId)

    if (!chat?.collaborators?.includes(user.subject)) throw unauthorized

    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
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
      streamId: z.string()
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

  const { streamId } = parsed.data

  const response = await streamingComponent.stream(
    ctx,
    request,
    streamId as StreamId,
    async (ctx, req, streamId, append) => {
      const user = await ctx.auth.getUserIdentity()

      if (!user) throw unauthorized

      const message = await ctx.db
        .query('message')
        .withIndex('byStreamId', (q) => q.eq('streamId', streamId))
        .first()

      const openRouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      })

      const stream = await streamText({
        model:
      })
    }
  )

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Vary', 'Origin')

  return response
})
