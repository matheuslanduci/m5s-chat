import { ConvexError } from 'convex/values'

export const unauthorized = new ConvexError({
  code: 'unauthorized',
  message: 'You must be logged in to perform this action.'
})

export const clientInputError = new ConvexError({
  code: 'client_input_error',
  message: 'The input provided by the client is invalid or malformed.'
})

export const serverError = new ConvexError({
  code: 'server_error',
  message: 'An unexpected error occurred on the server.'
})

export const notFoundError = new ConvexError({
  code: 'not_found',
  message: 'The requested resource was not found.'
})
