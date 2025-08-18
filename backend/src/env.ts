import "dotenv/config"
import { z } from "zod"

const EnvSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().optional(),
})

export const env = EnvSchema.parse(process.env)

export function getCorsOrigins(): string[] {
  const raw = env.CORS_ORIGINS || ""
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}
