import { Injectable, Logger } from '@nestjs/common';
import { Cerebras } from '@cerebras/cerebras_cloud_sdk';
import { DuckDbService } from '../common/database/duckdb.service';

export interface QueryResult {
  question: string;
  sql: string;
  results: any[];
  insights: string;
  chartSuggestion: string;
  executionTime: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly cerebras: Cerebras;
  private readonly model = 'llama3.1-8b';

  constructor(private readonly duckdb: DuckDbService) {
    const apiKey = process.env.CEREBRAS_API_KEY;
    if (!apiKey) {
      this.logger.warn('CEREBRAS_API_KEY not set - AI features will be disabled');
    }
    this.cerebras = new Cerebras({ apiKey });
  }

  /**
   * Generate SQL from natural language question using Cerebras
   */
  async generateSql(question: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(question);

    this.logger.debug('Generating SQL with Cerebras...');
    const startTime = Date.now();

    try {
      const response = await this.cerebras.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const duration = Date.now() - startTime;
      this.logger.debug(`SQL generated in ${duration}ms`);

      const content = (response.choices as any)?.[0]?.message?.content || '';
      const sql = this.extractSqlFromResponse(content);

      this.logger.debug(`Generated SQL: ${sql}`);
      return sql;
    } catch (error) {
      this.logger.error('Failed to generate SQL', error);
      throw new Error('Failed to generate SQL from question');
    }
  }

  /**
   * Execute natural language query end-to-end
   */
  async executeNaturalLanguageQuery(question: string): Promise<QueryResult> {
    const startTime = Date.now();

    // Generate SQL
    const sql = await this.generateSql(question);

    // Validate SQL
    this.validateSql(sql);

    // Execute query
    const results = await this.duckdb.query(sql);

    // Generate insights
    const insights = await this.generateInsights(question, results);

    // Suggest chart type
    const chartSuggestion = this.suggestChartType(results);

    const executionTime = Date.now() - startTime;

    return {
      question,
      sql,
      results,
      insights,
      chartSuggestion,
      executionTime,
    };
  }

  /**
   * Build system prompt with schema information
   */
  private buildSystemPrompt(): string {
    return `You are an expert SQL query generator for DuckDB. Your task is to convert natural language questions into valid DuckDB SQL queries.

DATABASE SCHEMA:
Table: events
Columns:
  - event (VARCHAR) - The event name (e.g., 'pageview', 'button_clicked', 'signup')
  - distinct_id (VARCHAR) - User identifier
  - timestamp (TIMESTAMP) - When the event occurred
  - properties (JSON) - Event properties as JSON object
  - session_id (VARCHAR) - Session identifier
  - anonymous_id (VARCHAR) - Anonymous user identifier
  - received_at (TIMESTAMP) - When event was received by server

Indexes:
  - idx_timestamp ON events(timestamp)
  - idx_distinct_id ON events(distinct_id)
  - idx_event ON events(event)
  - idx_session ON events(session_id)

IMPORTANT RULES:
1. Only generate SELECT queries - NO INSERT, UPDATE, DELETE, DROP, CREATE
2. Always use proper DuckDB syntax
3. Use json_extract_string(properties, '$.key') to access JSON properties
4. Use DATE_TRUNC for time grouping (hour, day, week, month)
5. Always include reasonable LIMIT clauses (default 100)
6. Use COUNT(DISTINCT distinct_id) for unique users
7. Use CAST() for type conversions when needed
8. Keep queries efficient with proper WHERE clauses

COMMON QUERY PATTERNS:
- Events over time: SELECT DATE_TRUNC('day', timestamp) as date, COUNT(*) as count FROM events WHERE timestamp >= NOW() - INTERVAL '7 days' GROUP BY date ORDER BY date
- Top events: SELECT event, COUNT(*) as count FROM events GROUP BY event ORDER BY count DESC LIMIT 10
- Active users: SELECT COUNT(DISTINCT distinct_id) as user_count FROM events WHERE timestamp >= NOW() - INTERVAL '1 day'
- User timeline: SELECT * FROM events WHERE distinct_id = 'user_id' ORDER BY timestamp DESC LIMIT 100

CRITICAL: 
- Always use AS aliases for aggregate functions (COUNT(*) as count, SUM() as total, etc.)
- Always use CAST(DATE_TRUNC(...) AS VARCHAR) for date grouping to ensure proper string formatting
- Format dates as strings, not objects

OUTPUT FORMAT:
Return ONLY the SQL query, nothing else. No explanations, no markdown, just the SQL.`;
  }

  /**
   * Build user prompt for the question
   */
  private buildUserPrompt(question: string): string {
    return `Generate a DuckDB SQL query to answer this question: "${question}"

Remember: Output ONLY the SQL query, no explanations.`;
  }

  /**
   * Extract SQL from AI response
   */
  private extractSqlFromResponse(content: string): string {
    // Remove markdown code blocks if present
    let sql = content.trim();
    
    // Remove ```sql and ``` markers
    sql = sql.replace(/```sql\n?/gi, '');
    sql = sql.replace(/```\n?/g, '');
    
    // Remove any trailing semicolon and whitespace
    sql = sql.trim().replace(/;+$/, '');
    
    return sql;
  }

  /**
   * Validate SQL for security
   */
  private validateSql(sql: string): void {
    const upperSql = sql.toUpperCase();

    // Check for forbidden keywords
    const forbiddenKeywords = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'TRUNCATE',
      'EXECUTE',
      'EXEC',
    ];

    for (const keyword of forbiddenKeywords) {
      if (upperSql.includes(keyword)) {
        throw new Error(`Forbidden SQL keyword detected: ${keyword}`);
      }
    }

    // Must start with SELECT
    if (!upperSql.trim().startsWith('SELECT')) {
      throw new Error('Query must be a SELECT statement');
    }

    // Basic sanity check
    if (sql.length > 5000) {
      throw new Error('Query too long');
    }
  }

  /**
   * Generate insights from query results using Cerebras
   */
  private async generateInsights(
    question: string,
    results: any[],
  ): Promise<string> {
    if (results.length === 0) {
      return 'No data found for the given query.';
    }

    // For performance, only send summary of results to AI
    const resultSummary = {
      rowCount: results.length,
      columns: Object.keys(results[0] || {}),
      sampleRows: results.slice(0, 3),
    };

    try {
      const response = await this.cerebras.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a data analyst. Provide a brief, insightful summary of query results in 2-3 sentences.',
          },
          {
            role: 'user',
            content: `Question: "${question}"\n\nResults: ${JSON.stringify(resultSummary)}\n\nProvide insights:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      return (
        (response.choices as any)?.[0]?.message?.content ||
        'Analysis complete.'
      );
    } catch (error) {
      this.logger.warn('Failed to generate insights', error);
      return `Query returned ${results.length} results.`;
    }
  }

  /**
   * Suggest appropriate chart type based on results
   */
  private suggestChartType(results: any[]): string {
    if (results.length === 0) return 'none';

    const firstRow = results[0];
    const columns = Object.keys(firstRow);

    // Time series detection
    const hasTimeColumn = columns.some(
      (col) =>
        col.toLowerCase().includes('date') ||
        col.toLowerCase().includes('time') ||
        col.toLowerCase().includes('day') ||
        col.toLowerCase().includes('month'),
    );

    if (hasTimeColumn && results.length > 1) {
      return 'line';
    }

    // Single value - use number display
    if (columns.length === 1 && results.length === 1) {
      return 'number';
    }

    // Category + count - use bar chart
    if (columns.length === 2 && results.length <= 20) {
      const valueColumn = columns.find(
        (col) =>
          col.toLowerCase().includes('count') ||
          col.toLowerCase().includes('total') ||
          col.toLowerCase().includes('sum'),
      );
      if (valueColumn) {
        return 'bar';
      }
    }

    // Many categories - use pie chart
    if (columns.length === 2 && results.length <= 10) {
      return 'pie';
    }

    // Default to table
    return 'table';
  }
}
