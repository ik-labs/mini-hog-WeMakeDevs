import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { InsightsService } from '../insights/insights.service';
import { AiService } from '../ai/ai.service';
import { FlagsService } from '../flags/flags.service';
import { DuckDbService } from '../common/database/duckdb.service';

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);
  private server: Server;

  constructor(
    private readonly insightsService: InsightsService,
    private readonly aiService: AiService,
    private readonly flagsService: FlagsService,
    private readonly duckdbService: DuckDbService,
  ) {
    this.server = new Server(
      {
        name: 'minihog-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
  }

  async onModuleInit() {
    this.setupTools();
    this.logger.log('MCP Server initialized with tools');
  }

  private setupTools() {
    // Register list_tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_trend',
          description: 'Get analytics trends for events over time. Returns time-series data.',
          inputSchema: {
            type: 'object',
            properties: {
              event: {
                type: 'string',
                description: 'Event name to get trends for (optional)',
              },
              from: {
                type: 'string',
                description: 'Start date in ISO format (optional)',
              },
              to: {
                type: 'string',
                description: 'End date in ISO format (optional)',
              },
              interval: {
                type: 'string',
                enum: ['hour', 'day', 'week', 'month'],
                description: 'Time interval for aggregation (default: day)',
              },
            },
          },
        },
        {
          name: 'get_active_users',
          description: 'Get active user counts: DAU (daily), WAU (weekly), MAU (monthly)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_top_events',
          description: 'Get the most frequent events with their counts',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of top events to return (default: 10)',
                default: 10,
              },
            },
          },
        },
        {
          name: 'evaluate_flag',
          description: 'Evaluate a feature flag for a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              flag_key: {
                type: 'string',
                description: 'Feature flag key to evaluate',
              },
              distinct_id: {
                type: 'string',
                description: 'User ID to evaluate the flag for',
              },
            },
            required: ['flag_key', 'distinct_id'],
          },
        },
        {
          name: 'get_user_timeline',
          description: 'Get chronological event timeline for a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              distinct_id: {
                type: 'string',
                description: 'User ID to get timeline for',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of events to return (default: 50)',
                default: 50,
              },
            },
            required: ['distinct_id'],
          },
        },
        {
          name: 'run_query',
          description: 'Execute a SQL query on the analytics database (DuckDB). Read-only queries supported.',
          inputSchema: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'SQL query to execute',
              },
            },
            required: ['sql'],
          },
        },
        {
          name: 'ask_question',
          description: 'Ask a natural language question about your analytics data. Powered by Cerebras AI.',
          inputSchema: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Natural language question about analytics data',
              },
            },
            required: ['question'],
          },
        },
      ],
    }));

    // Register call_tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_trend':
            return await this.handleGetTrend(args);
          case 'get_active_users':
            return await this.handleGetActiveUsers();
          case 'get_top_events':
            return await this.handleGetTopEvents(args);
          case 'evaluate_flag':
            return await this.handleEvaluateFlag(args);
          case 'get_user_timeline':
            return await this.handleGetUserTimeline(args);
          case 'run_query':
            return await this.handleRunQuery(args);
          case 'ask_question':
            return await this.handleAskQuestion(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        this.logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private async handleGetTrend(args: any) {
    const query = {
      event_name: args?.event,
      from: args?.from,
      to: args?.to,
      period: '7d' as const,
      interval: (args?.interval || 'day') as 'hour' | 'day' | 'week' | 'month',
    };
    const trends = await this.insightsService.getTrends(query);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(trends, null, 2),
        },
      ],
    };
  }

  private async handleGetActiveUsers() {
    const activeUsers = await this.insightsService.getActiveUsers({ period: '7d' });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(activeUsers, null, 2),
        },
      ],
    };
  }

  private async handleGetTopEvents(args: any) {
    const limit = args?.limit || 10;
    const topEvents = await this.insightsService.getTopEvents(limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(topEvents, null, 2),
        },
      ],
    };
  }

  private async handleEvaluateFlag(args: any) {
    const { flag_key, distinct_id } = args;
    if (!flag_key || !distinct_id) {
      throw new Error('flag_key and distinct_id are required');
    }
    const evaluation = await this.flagsService.evaluate(flag_key, distinct_id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(evaluation, null, 2),
        },
      ],
    };
  }

  private async handleGetUserTimeline(args: any) {
    const { distinct_id, limit = 50 } = args;
    if (!distinct_id) {
      throw new Error('distinct_id is required');
    }

    const sql = `
      SELECT 
        timestamp,
        event,
        properties,
        session_id
      FROM events
      WHERE distinct_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    const events = await this.duckdbService.query(sql, [distinct_id, limit]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(events, null, 2),
        },
      ],
    };
  }

  private async handleRunQuery(args: any) {
    const { sql } = args;
    if (!sql) {
      throw new Error('sql is required');
    }

    // Basic SQL safety check - only allow SELECT queries
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Additional safety: block certain dangerous keywords
    const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
    for (const keyword of dangerousKeywords) {
      if (trimmedSql.includes(keyword)) {
        throw new Error(`Dangerous keyword '${keyword}' not allowed`);
      }
    }

    const results = await this.duckdbService.query(sql);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            columns: results.length > 0 ? Object.keys(results[0]) : [],
            rows: results,
            count: results.length,
          }, null, 2),
        },
      ],
    };
  }

  private async handleAskQuestion(args: any) {
    const { question } = args;
    if (!question) {
      throw new Error('question is required');
    }

    const result = await this.aiService.executeNaturalLanguageQuery(question);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            question: result.question,
            sql: result.sql,
            results: result.results,
            insights: result.insights,
            chart_suggestion: result.chartSuggestion,
            execution_time: result.executionTime,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.log('MCP Server started with stdio transport');
  }

  /**
   * Get the server instance (for testing or advanced usage)
   */
  getServer(): Server {
    return this.server;
  }
}
