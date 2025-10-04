import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as duckdb from '@duckdb/node-api';

@Injectable()
export class DuckDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DuckDbService.name);
  private instance: duckdb.DuckDBInstance | null = null;
  private connection: duckdb.DuckDBConnection | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const dbPath = this.configService.get<string>('DUCKDB_PATH');
      this.logger.log(`Initializing DuckDB at: ${dbPath}`);

      // Create DuckDB instance
      this.instance = await duckdb.DuckDBInstance.create(dbPath);
      
      // Create connection
      this.connection = await this.instance.connect();

      // Initialize schema
      await this.initializeSchema();

      this.logger.log('DuckDB initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize DuckDB', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Connection and instance cleanup will happen automatically
      // The node-api doesn't have explicit close methods
      this.connection = null;
      this.instance = null;
      this.logger.log('DuckDB connection cleaned up');
    } catch (error) {
      this.logger.error('Error cleaning up DuckDB connection', error);
    }
  }

  private async initializeSchema() {
    // Create events table if not exists
    await this.run(`
      CREATE TABLE IF NOT EXISTS events (
        timestamp TIMESTAMP NOT NULL,
        received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        event VARCHAR NOT NULL,
        distinct_id VARCHAR NOT NULL,
        anonymous_id VARCHAR,
        properties JSON,
        context JSON,
        project_id VARCHAR DEFAULT 'default',
        session_id VARCHAR
      );
    `);

    // Create indexes for performance
    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_timestamp 
      ON events(timestamp);
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_distinct_id 
      ON events(distinct_id);
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_event 
      ON events(event);
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_received_at 
      ON events(received_at);
    `);

    this.logger.log('DuckDB schema initialized');
  }

  /**
   * Execute a query and return results
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.connection) {
      throw new Error('DuckDB connection not initialized');
    }

    try {
      const preparedStatement = await this.connection.prepare(sql);
      
      // Bind parameters if provided
      if (params && params.length > 0) {
        await preparedStatement.bind(params);
      }

      const result = await preparedStatement.run();
      const rowsData = await result.getRows();
      
      // Convert rows to JSON objects
      const rows: T[] = [];
      for (const row of rowsData) {
        const obj: any = {};
        for (let i = 0; i < row.length; i++) {
          const colName = result.columnName(i);
          obj[colName] = row[i];
        }
        rows.push(obj as T);
      }

      return rows;
    } catch (error) {
      this.logger.error(`Query failed: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Execute a query without returning results (for INSERT, UPDATE, DELETE)
   */
  async run(sql: string, params?: any[]): Promise<void> {
    if (!this.connection) {
      throw new Error('DuckDB connection not initialized');
    }

    try {
      const preparedStatement = await this.connection.prepare(sql);
      
      if (params && params.length > 0) {
        await preparedStatement.bind(params);
      }

      await preparedStatement.run();
    } catch (error) {
      this.logger.error(`Execution failed: ${sql}`, error);
      throw error;
    }
  }

  /**
   * Insert a single event
   */
  async insertEvent(event: {
    timestamp: Date;
    event: string;
    distinct_id: string;
    anonymous_id?: string;
    properties?: Record<string, any>;
    context?: Record<string, any>;
    project_id?: string;
    session_id?: string;
  }): Promise<void> {
    const sql = `
      INSERT INTO events (
        timestamp, event, distinct_id, anonymous_id, 
        properties, context, project_id, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.run(sql, [
      event.timestamp.toISOString(),
      event.event,
      event.distinct_id,
      event.anonymous_id || null,
      JSON.stringify(event.properties || {}),
      JSON.stringify(event.context || {}),
      event.project_id || 'default',
      event.session_id || null,
    ]);
  }

  /**
   * Insert multiple events in a batch
   */
  async insertEventsBatch(events: Array<{
    timestamp: Date;
    event: string;
    distinct_id: string;
    anonymous_id?: string;
    properties?: Record<string, any>;
    context?: Record<string, any>;
    project_id?: string;
    session_id?: string;
  }>): Promise<void> {
    if (events.length === 0) return;

    // Use transaction for batch insert
    await this.run('BEGIN TRANSACTION');

    try {
      for (const event of events) {
        await this.insertEvent(event);
      }
      await this.run('COMMIT');
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get connection for advanced usage
   */
  getConnection(): duckdb.DuckDBConnection {
    if (!this.connection) {
      throw new Error('DuckDB connection not initialized');
    }
    return this.connection;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query<{ count: number }>('SELECT COUNT(*) as count FROM events');
      return result.length > 0;
    } catch (error) {
      this.logger.error('DuckDB health check failed', error);
      return false;
    }
  }
}
