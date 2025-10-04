import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { SqliteService } from '../common/database/sqlite.service';
import { featureFlags, flagDecisions } from '../common/database/schema';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

interface CreateFlagDto {
  key: string;
  name: string;
  description?: string;
  active?: boolean;
  rollout_percentage?: number;
}

interface UpdateFlagDto {
  name?: string;
  description?: string;
  active?: boolean;
  rollout_percentage?: number;
}

export interface FlagEvaluationResult {
  key: string;
  enabled: boolean;
  variant: string;
  reason: string;
}

@Injectable()
export class FlagsService {
  private readonly logger = new Logger(FlagsService.name);

  constructor(private readonly sqlite: SqliteService) {}

  /**
   * Get all feature flags
   */
  async findAll() {
    const db = this.sqlite.getDb();
    const flags = await db.select().from(featureFlags);
    return flags;
  }

  /**
   * Get a single feature flag by key
   */
  async findOne(key: string) {
    const db = this.sqlite.getDb();
    const flag = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);

    if (flag.length === 0) {
      throw new NotFoundException(`Feature flag with key '${key}' not found`);
    }

    return flag[0];
  }

  /**
   * Create a new feature flag
   */
  async create(dto: CreateFlagDto) {
    const db = this.sqlite.getDb();

    try {
      await db.insert(featureFlags).values({
        key: dto.key,
        name: dto.name,
        description: dto.description,
        active: dto.active ?? true,
        rolloutPercentage: dto.rollout_percentage ?? 0,
      });

      this.logger.log(`Created feature flag: ${dto.key}`);
      
      // Fetch and return the created flag
      return this.findOne(dto.key);
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint failed')) {
        throw new ConflictException(`Feature flag with key '${dto.key}' already exists`);
      }
      throw error;
    }
  }

  /**
   * Update a feature flag
   */
  async update(key: string, dto: UpdateFlagDto) {
    const db = this.sqlite.getDb();

    // Check if flag exists
    await this.findOne(key);

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.active !== undefined) updateData.active = dto.active;
    if (dto.rollout_percentage !== undefined) {
      updateData.rolloutPercentage = dto.rollout_percentage;
    }

    await db
      .update(featureFlags)
      .set(updateData)
      .where(eq(featureFlags.key, key));

    this.logger.log(`Updated feature flag: ${key}`);

    return this.findOne(key);
  }

  /**
   * Delete a feature flag
   */
  async delete(key: string) {
    const db = this.sqlite.getDb();

    // Check if flag exists
    await this.findOne(key);

    await db.delete(featureFlags).where(eq(featureFlags.key, key));

    // Also delete associated flag decisions
    await db.delete(flagDecisions).where(eq(flagDecisions.flagKey, key));

    this.logger.log(`Deleted feature flag: ${key}`);

    return { message: 'Feature flag deleted successfully' };
  }

  /**
   * Evaluate a feature flag for a specific user
   */
  async evaluate(key: string, distinctId: string): Promise<FlagEvaluationResult> {
    const db = this.sqlite.getDb();

    // Get the feature flag
    let flag;
    try {
      flag = await this.findOne(key);
    } catch (error) {
      // Flag doesn't exist, return disabled
      return {
        key,
        enabled: false,
        variant: 'control',
        reason: 'Flag not found',
      };
    }

    // Check if flag is active
    if (!flag.active) {
      return {
        key,
        enabled: false,
        variant: 'control',
        reason: 'Flag is inactive',
      };
    }

    // Check if we have a previous decision for this user
    const existingDecision = await db
      .select()
      .from(flagDecisions)
      .where(
        and(
          eq(flagDecisions.distinctId, distinctId),
          eq(flagDecisions.flagKey, key)
        )
      )
      .limit(1);

    if (existingDecision.length > 0) {
      const decision = existingDecision[0];
      return {
        key,
        enabled: decision.variant === 'treatment',
        variant: decision.variant,
        reason: 'Sticky bucketing',
      };
    }

    // Calculate hash for deterministic bucketing
    const hashValue = this.calculateHash(distinctId, key);
    const bucketValue = hashValue * 100; // Convert to percentage

    // Determine variant based on rollout percentage
    const enabled = bucketValue < flag.rolloutPercentage;
    const variant = enabled ? 'treatment' : 'control';

    // Store the decision for sticky bucketing
    try {
      await db.insert(flagDecisions).values({
        distinctId,
        flagKey: key,
        variant,
        hashValue,
      });
    } catch (error) {
      // If insert fails (rare race condition), just log it
      this.logger.warn(`Failed to store flag decision: ${error}`);
    }

    return {
      key,
      enabled,
      variant,
      reason: `Bucketed at ${bucketValue.toFixed(2)}%`,
    };
  }

  /**
   * Calculate a deterministic hash value between 0 and 1
   * Uses distinct_id + flag_key to ensure consistency
   */
  private calculateHash(distinctId: string, flagKey: string): number {
    const input = `${distinctId}:${flagKey}`;
    const hash = crypto.createHash('md5').update(input).digest('hex');
    
    // Use first 8 characters of hash and convert to number
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const maxInt = parseInt('ffffffff', 16);
    
    return hashInt / maxInt;
  }

  /**
   * Get flag decision for a specific user (for testing/debugging)
   */
  async getDecision(key: string, distinctId: string) {
    const db = this.sqlite.getDb();
    
    const decision = await db
      .select()
      .from(flagDecisions)
      .where(
        and(
          eq(flagDecisions.distinctId, distinctId),
          eq(flagDecisions.flagKey, key)
        )
      )
      .limit(1);

    return decision.length > 0 ? decision[0] : null;
  }

  /**
   * Clear all decisions for a flag (useful for testing)
   */
  async clearDecisions(key: string) {
    const db = this.sqlite.getDb();
    await db.delete(flagDecisions).where(eq(flagDecisions.flagKey, key));
    this.logger.log(`Cleared all decisions for flag: ${key}`);
    return { message: 'Decisions cleared successfully' };
  }
}
