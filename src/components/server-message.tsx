import { env } from '@/lib/env'
import { useAuth } from '@clerk/clerk-react'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import { api } from '../../convex/_generated/api'

type ServerMessageProps = {
  onFinish: () => void
  onStopStreaming: () => void
  isDriven: boolean
  streamId?: StreamId
}

export function ServerMessage({
  onFinish,
  onStopStreaming,
  isDriven,
  streamId
}: ServerMessageProps) {
  const { getToken } = useAuth()
  const [authToken, setAuthToken] = useState<string | null>(null)

  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${env.VITE_CONVEX_SITE}/chat`),
    isDriven && authToken !== null,
    streamId,
    {
      authToken
    }
  )

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false

    return status === 'streaming' || status === 'pending'
  }, [isDriven, status])

  useEffect(() => {
    if (isCurrentlyStreaming || !isDriven) return

    onStopStreaming()
  }, [isCurrentlyStreaming, isDriven, onStopStreaming])

  useEffect(() => {
    if (!text) return

    onFinish()
  }, [text, onFinish])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken({
          template: 'convex'
        })
        setAuthToken(token)
      } catch (error) {
        console.error('Failed to get auth token:', error)
        setAuthToken(null)
      }
    }

    fetchToken()
  }, [getToken])

  return <Markdown>{text}</Markdown>
}
