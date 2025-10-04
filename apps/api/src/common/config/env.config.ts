import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_PORT: z.string().transform(Number).default('3000'),
  API_KEY: z.string().min(32).optional(),

  // Database
  DUCKDB_PATH: z.string().default('./data/analytics.duckdb'),
  SQLITE_PATH: z.string().default('./data/metadata.db'),

  // Cerebras AI
  CEREBRAS_API_KEY: z.string().optional(),
  CEREBRAS_MODEL: z.string().default('llama3.1-8b'),
  CEREBRAS_API_URL: z
    .string()
    .url()
    .default('https://api.cerebras.ai/v1/chat/completions'),

  // MCP Server
  MCP_PORT: z.string().transform(Number).default('3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
