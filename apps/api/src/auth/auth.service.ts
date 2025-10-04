import { Injectable, Logger } from '@nestjs/common';
import { SqliteService } from '../common/database/sqlite.service';
import * as schema from '../common/database/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly sqlite: SqliteService) {}

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      return false;
    }

    try {
      const db = this.sqlite.getDb();
      const keys = await db
        .select()
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.key, apiKey));

      if (keys.length === 0) {
        this.logger.warn(`Invalid API key attempted: ${apiKey.substring(0, 8)}...`);
        return false;
      }

      const key = keys[0];

      // Check if key is active
      if (!key.active) {
        this.logger.warn(`Inactive API key used: ${key.name}`);
        return false;
      }

      // Update last used timestamp
      await db
        .update(schema.apiKeys)
        .set({ lastUsedAt: new Date().toISOString() })
        .where(eq(schema.apiKeys.id, key.id));

      this.logger.debug(`Valid API key used: ${key.name}`);
      return true;
    } catch (error) {
      this.logger.error('Error validating API key:', error);
      return false;
    }
  }

  /**
   * Generate a new API key
   */
  generateApiKey(): string {
    // Format: mh_live_[32 random hex characters]
    const randomPart = randomBytes(16).toString('hex');
    return `mh_live_${randomPart}`;
  }

  /**
   * Create a new API key
   */
  async createApiKey(
    name: string,
    description?: string,
  ): Promise<{ id: number; key: string; name: string }> {
    const apiKey = this.generateApiKey();
    const db = this.sqlite.getDb();

    const result = await db
      .insert(schema.apiKeys)
      .values({
        key: apiKey,
        name,
        description,
        active: true,
      })
      .returning();

    this.logger.log(`Created new API key: ${name}`);
    return {
      id: result[0].id,
      key: apiKey,
      name: result[0].name,
    };
  }

  /**
   * List all API keys (without exposing the full key)
   */
  async listApiKeys(): Promise<
    Array<{
      id: number;
      name: string;
      description: string | null;
      active: boolean;
      keyPreview: string;
      createdAt: string;
      lastUsedAt: string | null;
    }>
  > {
    const db = this.sqlite.getDb();
    const keys = await db.select().from(schema.apiKeys);

    return keys.map((key) => ({
      id: key.id,
      name: key.name,
      description: key.description,
      active: key.active,
      keyPreview: `${key.key.substring(0, 12)}...${key.key.slice(-4)}`,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
    }));
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: number): Promise<void> {
    const db = this.sqlite.getDb();
    await db
      .update(schema.apiKeys)
      .set({ active: false })
      .where(eq(schema.apiKeys.id, id));

    this.logger.log(`Revoked API key ID: ${id}`);
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(id: number): Promise<void> {
    const db = this.sqlite.getDb();
    await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));

    this.logger.log(`Deleted API key ID: ${id}`);
  }
}
