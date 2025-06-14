import { corsRouter } from 'convex-helpers/server/cors'
import { httpRouter } from 'convex/server'
import { streamChat } from './chat'

const http = corsRouter(httpRouter(), {
  allowedHeaders: ['Content-Type', 'Authorization']
})

http.route({
  path: '/chat-stream',
  method: 'POST',
  handler: streamChat
})

export default http.http
