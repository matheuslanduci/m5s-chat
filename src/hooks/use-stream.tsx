import { env } from '@/lib/env'
import { useAuth } from '@clerk/clerk-react'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
// WTF is this import? its for types though
import type { StreamStatus } from 'node_modules/@convex-dev/persistent-text-streaming/dist/esm/component/schema'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

type UseStreamProps = {
  isDriven: boolean
  messageId: Id<'message'> | undefined
}

export type StreamBody = {
  text: string
  status: StreamStatus
}

// Adapted from persistent-text-streaming's useStream hook

export function useStream({ isDriven, messageId }: UseStreamProps) {
  const { getToken } = useAuth()
  const [streamEnded, setStreamEnded] = useState<boolean | null>(null)

  const userPreference = useQuery(api.userPreference.getUserPreference)

  const streamStarted = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Needed.
  const usePersistence = useMemo(() => {
    if (streamEnded === false || !isDriven) {
      return true
    }

    return false
  }, [isDriven, streamEnded, messageId])

  const persistentBody = useQuery(
    api.streaming.getStreamBody,
    usePersistence && messageId ? { messageId } : 'skip'
  )

  const [streamBody, setStreamBody] = useState<string>('')

  useEffect(() => {
    if (isDriven && messageId && !streamStarted.current) {
      streamStarted.current = true

      void (async () => {
        const token = await getToken({
          template: 'convex'
        })

        if (!token) {
          console.error('Failed to get auth token')
          return
        }

        const success = await startStreaming(
          new URL(`${env.VITE_CONVEX_SITE}/chat`),
          messageId,
          (text: string) => {
            setStreamBody((prev) => prev + text)
          },
          {
            Authorization: `Bearer ${token}`
          }
        )

        setStreamEnded(success)
      })()
    }
  }, [isDriven, messageId, getToken])

  const body = useMemo<StreamBody>(() => {
    if (persistentBody) return persistentBody

    let status: StreamStatus

    if (streamEnded === null) {
      status = streamBody.length > 0 ? 'streaming' : 'pending'
    } else {
      status = streamEnded ? 'done' : 'error'

      if (streamBody.length === 0 && userPreference?.byokEnabled) {
        toast.error(
          'Your BYOK key is invalid or not set. Please check your settings.'
        )
      }
    }

    return {
      text: streamBody,
      status: status as StreamStatus
    }
  }, [persistentBody, streamBody, streamEnded, userPreference?.byokEnabled])

  return body
}

async function startStreaming(
  url: URL,
  messageId: Id<'message'>,
  onUpdate: (text: string) => void,
  headers: Record<string, string>
) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      messageId: messageId
    }),
    headers: { 'Content-Type': 'application/json', ...headers }
  })
  console.log('Streaming response', response)

  if (response.status === 205) {
    toast.error('Please refresh the page and try again.')
    console.error('Stream already finished', response)
    return false
  }
  if (!response.ok) {
    console.error('Failed to reach streaming endpoint', response)
    return false
  }
  if (!response.body) {
    console.error('No body in response', response)
    return false
  }
  const reader = response.body.getReader()
  while (true) {
    try {
      const { done, value } = await reader.read()
      if (done) {
        onUpdate(new TextDecoder().decode(value))
        return true
      }
      onUpdate(new TextDecoder().decode(value))
    } catch (e) {
      console.error('Error reading stream', e)
      return false
    }
  }
}
