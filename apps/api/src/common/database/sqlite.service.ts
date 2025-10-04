import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqliteService.name);
  private sqlite: Database.Database | null = null;
  private db: BetterSQLite3Database<typeof schema> | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const dbPath = this.configService.get<string>('SQLITE_PATH');
      this.logger.log(`Initializing SQLite at: ${dbPath}`);

      // Create SQLite connection
      this.sqlite = new Database(dbPath);
      
      // Enable WAL mode for better concurrency
      this.sqlite.pragma('journal_mode = WAL');

      // Initialize Drizzle ORM
      this.db = drizzle(this.sqlite, { schema });

      // Run migrations
      await this.runMigrations();

      this.logger.log('SQLite initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SQLite', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.sqlite) {
        this.sqlite.close();
        this.sqlite = null;
        this.db = null;
      }
      this.logger.log('SQLite connection closed');
    } catch (error) {
      this.logger.error('Error closing SQLite connection', error);
    }
  }

  private async runMigrations() {
    if (!this.sqlite) {
      throw new Error('SQLite not initialized');
    }

    // Create feature_flags table
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        rollout_percentage INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Create flag_decisions table
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS flag_decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distinct_id TEXT NOT NULL,
        flag_key TEXT NOT NULL,
        variant TEXT NOT NULL,
        hash_value REAL NOT NULL,
        decided_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(distinct_id, flag_key)
      );
    `);

    // Create indexes on flag_decisions
    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_flag_decisions_distinct_id 
      ON flag_decisions(distinct_id);
    `);

    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_flag_decisions_flag_key 
      ON flag_decisions(flag_key);
    `);

    // Create api_keys table
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_used_at TEXT
      );
    `);

    // Create index on api_keys
    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_key 
      ON api_keys(key);
    `);

    this.logger.log('SQLite migrations completed');
  }

  /**
   * Get Drizzle ORM instance
   */
  getDb(): BetterSQLite3Database<typeof schema> {
    if (!this.db) {
      throw new Error('SQLite database not initialized');
    }
    return this.db;
  }

  /**
   * Get raw SQLite instance
   */
  getSqlite(): Database.Database {
    if (!this.sqlite) {
      throw new Error('SQLite not initialized');
    }
    return this.sqlite;
  }

  /**
   * Health check
   */
  healthCheck(): boolean {
    try {
      if (!this.sqlite) return false;
      const result = this.sqlite.prepare('SELECT 1 as health').get();
      return result !== undefined;
    } catch (error) {
      this.logger.error('SQLite health check failed', error);
      return false;
    }
  }

  /**
   * Seed initial data (development only)
   */
  async seedInitialData() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Check if we already have an API key
      const existingKeys = await this.db.select().from(schema.apiKeys);
      
      if (existingKeys.length === 0) {
        // Create a default API key for development
        const defaultKey = this.configService.get<string>('API_KEY') || 
          'dev_minihog_api_key_12345678901234567890';
        
        await this.db.insert(schema.apiKeys).values({
          key: defaultKey,
          name: 'Default Development Key',
          description: 'Auto-generated development API key',
          active: true,
        });

        this.logger.log('Seeded initial API key');
      }

      // Check if we already have feature flags
      const existingFlags = await this.db.select().from(schema.featureFlags);
      
      if (existingFlags.length === 0) {
        // Create some example feature flags
        await this.db.insert(schema.featureFlags).values([
          {
            key: 'example_flag',
            name: 'Example Feature Flag',
            description: 'An example feature flag for testing',
            active: true,
            rolloutPercentage: 50,
          },
        ]);

        this.logger.log('Seeded initial feature flags');
      }
    } catch (error) {
      this.logger.error('Error seeding initial data', error);
    }
  }
}
