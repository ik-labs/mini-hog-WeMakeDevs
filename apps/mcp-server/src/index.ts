#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import duckdb from 'duckdb';

// Database path from environment or default
const DATABASE_PATH = process.env.DATABASE_PATH || '../../data/analytics.duckdb';

// DuckDB connection wrapper
class DuckDBClient {
  private db: duckdb.Database;
  private connection: any = null;

  constructor(dbPath: string) {
    this.db = new duckdb.Database(dbPath);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection = this.db.connect();
      resolve();
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      this.connection.all(sql, ...params, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  close(): void {
    if (this.connection) {
      this.connection.close();
    }
    this.db.close();
  }
}

// Initialize database
const dbClient = new DuckDBClient(DATABASE_PATH);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'get_active_users',
    description: 'Get active user counts for a specified time period (daily, weekly, monthly)',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time period: 1d, 7d, 30d, 90d',
          default: '7d',
        },
      },
    },
  },
  {
    name: 'get_top_events',
    description: 'Get the most frequently occurring events',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top events to return',
          default: 10,
        },
        from: {
          type: 'string',
          description: 'Start date (ISO 8601)',
        },
        to: {
          type: 'string',
          description: 'End date (ISO 8601)',
        },
      },
    },
  },
  {
    name: 'query_events',
    description: 'Query events with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        event: {
          type: 'string',
          description: 'Event name to filter by',
        },
        distinct_id: {
          type: 'string',
          description: 'User ID to filter by',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return',
          default: 100,
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination',
          default: 0,
        },
      },
    },
  },
  {
    name: 'get_retention_summary',
    description: 'Get cohort retention summary metrics',
    inputSchema: {
      type: 'object',
      properties: {
        period_type: {
          type: 'string',
          description: 'Period type: daily, weekly, monthly',
          default: 'weekly',
        },
        periods: {
          type: 'number',
          description: 'Number of periods to analyze',
          default: 8,
        },
      },
    },
  },
];

// Tool handlers
async function handleGetActiveUsers(args: any) {
  const period = args.period || '7d';
  
  // Calculate date range
  const now = new Date();
  const match = period.match(/^(\d+)([dhwmy])$/);
  if (!match) {
    throw new Error('Invalid period format');
  }

  const value = parseInt(match[1]);
  const unit = match[2];
  const fromDate = new Date(now);

  switch (unit) {
    case 'd':
      fromDate.setDate(fromDate.getDate() - value);
      break;
    case 'w':
      fromDate.setDate(fromDate.getDate() - value * 7);
      break;
    case 'm':
      fromDate.setMonth(fromDate.getMonth() - value);
      break;
  }

  const sql = `
    SELECT COUNT(DISTINCT distinct_id) as count
    FROM events
    WHERE timestamp >= ?::TIMESTAMP
      AND timestamp <= ?::TIMESTAMP
  `;

  const results = await dbClient.query<{ count: number }>(sql, [
    fromDate.toISOString(),
    now.toISOString(),
  ]);

  return {
    period,
    active_users: results[0]?.count || 0,
    from: fromDate.toISOString(),
    to: now.toISOString(),
  };
}

async function handleGetTopEvents(args: any) {
  const limit = args.limit || 10;
  const from = args.from;
  const to = args.to || new Date().toISOString();

  let sql = `
    SELECT 
      event,
      COUNT(*) as count
    FROM events
    WHERE 1=1
  `;
  const params: any[] = [];

  if (from) {
    sql += ` AND timestamp >= ?::TIMESTAMP`;
    params.push(from);
  }

  sql += ` AND timestamp <= ?::TIMESTAMP`;
  params.push(to);

  sql += `
    GROUP BY event
    ORDER BY count DESC
    LIMIT ?
  `;
  params.push(limit);

  const results = await dbClient.query<{ event: string; count: number }>(sql, params);

  return {
    events: results,
    total: results.length,
  };
}

async function handleQueryEvents(args: any) {
  const limit = args.limit || 100;
  const offset = args.offset || 0;

  let sql = `SELECT * FROM events WHERE 1=1`;
  const params: any[] = [];

  if (args.event) {
    sql += ` AND event = ?`;
    params.push(args.event);
  }

  if (args.distinct_id) {
    sql += ` AND distinct_id = ?`;
    params.push(args.distinct_id);
  }

  sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const results = await dbClient.query(sql, params);

  return {
    events: results,
    count: results.length,
    limit,
    offset,
  };
}

async function handleGetRetentionSummary(args: any) {
  const periodType = args.period_type || 'weekly';
  const periods = args.periods || 8;

  // This is a simplified version - in production would call the full retention service
  const sql = `
    WITH user_cohorts AS (
      SELECT 
        distinct_id,
        DATE_TRUNC('${periodType}', MIN(timestamp)::TIMESTAMP) as cohort_date
      FROM events
      GROUP BY distinct_id
    )
    SELECT 
      COUNT(DISTINCT distinct_id) as total_users,
      COUNT(DISTINCT cohort_date) as total_cohorts
    FROM user_cohorts
  `;

  const results = await dbClient.query<{ total_users: number; total_cohorts: number }>(sql);

  return {
    period_type: periodType,
    periods_analyzed: periods,
    total_users: results[0]?.total_users || 0,
    total_cohorts: results[0]?.total_cohorts || 0,
    message: 'Use the retention API endpoint for detailed cohort analysis',
  };
}

// Main server setup
async function main() {
  // Connect to database
  await dbClient.connect();
  console.error('✅ Connected to DuckDB');

  // Create MCP server
  const server = new Server(
    {
      name: 'minihog-analytics',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case 'get_active_users':
          result = await handleGetActiveUsers(args || {});
          break;

        case 'get_top_events':
          result = await handleGetTopEvents(args || {});
          break;

        case 'query_events':
          result = await handleQueryEvents(args || {});
          break;

        case 'get_retention_summary':
          result = await handleGetRetentionSummary(args || {});
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 MiniHog MCP Server running on stdio');
  console.error('📊 Available tools:', TOOLS.map(t => t.name).join(', '));

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.error('\n👋 Shutting down...');
    dbClient.close();
    process.exit(0);
  });
}

// Run server
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  dbClient.close();
  process.exit(1);
});
