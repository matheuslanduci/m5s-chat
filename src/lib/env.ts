import { z } from 'zod'

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_CONVEX_URL: z.string(),
  VITE_CONVEX_SITE: z.string()
})

export const env = envSchema.parse(import.meta.env)
