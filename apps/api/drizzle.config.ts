import type { Config } from 'drizzle-kit';

export default {
  schema: './src/common/database/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: '../../data/metadata.db',
  },
} satisfies Config;
