import { Injectable, Logger } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import type {
  TrendsQuery,
  ActiveUsersQuery,
  TopEventsQuery,
  EventsQuery,
  TrendsResponse,
  ActiveUsersResponse,
  TopEventsResponse,
  EventsListResponse,
  TimeSeriesDataPoint,
  TopEvent,
  EventRecord,
} from '@minihog/shared';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(private readonly duckdb: DuckDbService) {}

  /**
   * Get trends data - event counts over time
   */
  async getTrends(query: TrendsQuery): Promise<TrendsResponse> {
    const {
      event_name,
      from,
      to,
      period = '7d',
      interval = 'day',
    } = query;

    // Calculate time range
    const { fromDate, toDate } = this.calculateTimeRange(from, to, period);

    // Build DuckDB query with time grouping
    const timeGrouping = this.getTimeGrouping(interval);
    
    let sql = `
      SELECT 
        ${timeGrouping} as timestamp,
        COUNT(*) as count
      FROM events
      WHERE timestamp >= ? AND timestamp <= ?
    `;

    const params: any[] = [fromDate, toDate];

    if (event_name) {
      sql += ` AND event = ?`;
      params.push(event_name);
    }

    sql += `
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `;

    this.logger.debug(`Trends query: ${sql}`, params);

    const results = await this.duckdb.query<{
      timestamp: string;
      count: number;
    }>(sql, params);

    const series: TimeSeriesDataPoint[] = results.map((row) => ({
      timestamp: row.timestamp,
      count: row.count,
    }));

    const total = series.reduce((sum, point) => sum + point.count, 0);

    return {
      event_name,
      period,
      interval,
      series,
      total,
    };
  }

  /**
   * Get active users (DAU/WAU/MAU)
   */
  async getActiveUsers(query: ActiveUsersQuery): Promise<ActiveUsersResponse> {
    const { period = '7d' } = query;

    const now = new Date().toISOString();

    // DAU - Last 24 hours
    const dauQuery = `
      SELECT COUNT(DISTINCT distinct_id) as count
      FROM events
      WHERE timestamp >= datetime('now', '-24 hours')
    `;

    // WAU - Last 7 days
    const wauQuery = `
      SELECT COUNT(DISTINCT distinct_id) as count
      FROM events
      WHERE timestamp >= datetime('now', '-7 days')
    `;

    // MAU - Last 30 days
    const mauQuery = `
      SELECT COUNT(DISTINCT distinct_id) as count
      FROM events
      WHERE timestamp >= datetime('now', '-30 days')
    `;

    const [dauResult, wauResult, mauResult] = await Promise.all([
      this.duckdb.query<{ count: number }>(dauQuery),
      this.duckdb.query<{ count: number }>(wauQuery),
      this.duckdb.query<{ count: number }>(mauQuery),
    ]);

    return {
      dau: dauResult[0]?.count || 0,
      wau: wauResult[0]?.count || 0,
      mau: mauResult[0]?.count || 0,
      period,
      calculated_at: now,
    };
  }

  /**
   * Get top events by count
   */
  async getTopEvents(query: TopEventsQuery): Promise<TopEventsResponse> {
    const { limit = 10, from, to } = query;

    let sql = `
      SELECT 
        event,
        COUNT(*) as count
      FROM events
    `;

    const params: any[] = [];

    if (from || to) {
      const { fromDate, toDate } = this.calculateTimeRange(from, to, '30d');
      sql += ` WHERE timestamp >= ? AND timestamp <= ?`;
      params.push(fromDate, toDate);
    }

    sql += `
      GROUP BY event
      ORDER BY count DESC
      LIMIT ?
    `;
    params.push(limit);

    this.logger.debug(`Top events query: ${sql}`, params);

    const results = await this.duckdb.query<{
      event: string;
      count: number;
    }>(sql, params);

    // Calculate total for percentages
    const totalEvents = results.reduce((sum, row) => sum + row.count, 0);

    const events: TopEvent[] = results.map((row) => ({
      event: row.event,
      count: row.count,
      percentage: totalEvents > 0 ? (row.count / totalEvents) * 100 : 0,
    }));

    return {
      events,
      total_events: totalEvents,
      period: from && to ? undefined : '30d',
    };
  }

  /**
   * Get events list with pagination and filters
   */
  async getEvents(query: EventsQuery): Promise<EventsListResponse> {
    const {
      page = 1,
      limit = 20,
      event_name,
      distinct_id,
      from,
      to,
      period,
    } = query;

    // Calculate time range
    const { fromDate, toDate } = this.calculateTimeRange(from, to, period);

    // Build count query
    let countSql = `
      SELECT COUNT(*) as count
      FROM events
      WHERE timestamp >= ? AND timestamp <= ?
    `;
    const countParams: any[] = [fromDate, toDate];

    if (event_name) {
      countSql += ` AND event = ?`;
      countParams.push(event_name);
    }

    if (distinct_id) {
      countSql += ` AND distinct_id = ?`;
      countParams.push(distinct_id);
    }

    // Build events query
    let sql = `
      SELECT 
        timestamp,
        event,
        distinct_id,
        anonymous_id,
        properties,
        context,
        session_id
      FROM events
      WHERE timestamp >= ? AND timestamp <= ?
    `;
    const params: any[] = [fromDate, toDate];

    if (event_name) {
      sql += ` AND event = ?`;
      params.push(event_name);
    }

    if (distinct_id) {
      sql += ` AND distinct_id = ?`;
      params.push(distinct_id);
    }

    sql += `
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    this.logger.debug(`Events query: ${sql}`, params);

    // Execute both queries
    const [countResult, eventsResult] = await Promise.all([
      this.duckdb.query<{ count: number }>(countSql, countParams),
      this.duckdb.query<{
        timestamp: string;
        event: string;
        distinct_id: string;
        anonymous_id?: string;
        properties?: string;
        context?: string;
        session_id?: string;
      }>(sql, params),
    ]);

    const total = countResult[0]?.count || 0;
    const total_pages = Math.ceil(total / limit);

    // Parse JSON fields
    const events: EventRecord[] = eventsResult.map((row) => ({
      timestamp: row.timestamp,
      event: row.event,
      distinct_id: row.distinct_id,
      anonymous_id: row.anonymous_id,
      properties: row.properties ? JSON.parse(row.properties) : undefined,
      context: row.context ? JSON.parse(row.context) : undefined,
      session_id: row.session_id,
    }));

    return {
      events,
      total,
      page,
      limit,
      total_pages,
    };
  }

  /**
   * Get time grouping SQL for different intervals
   */
  private getTimeGrouping(interval: string): string {
    switch (interval) {
      case 'minute':
        return "strftime(timestamp, '%Y-%m-%d %H:%M:00')";
      case 'hour':
        return "strftime(timestamp, '%Y-%m-%d %H:00:00')";
      case 'day':
        return "strftime(timestamp, '%Y-%m-%d')";
      case 'week':
        return "strftime(timestamp, '%Y-W%W')";
      case 'month':
        return "strftime(timestamp, '%Y-%m')";
      default:
        return "strftime(timestamp, '%Y-%m-%d')";
    }
  }

  /**
   * Calculate time range from parameters
   */
  private calculateTimeRange(
    from?: string,
    to?: string,
    period?: string,
  ): { fromDate: string; toDate: string } {
    const toDate = to || new Date().toISOString();

    if (from) {
      return { fromDate: from, toDate };
    }

    // Calculate from based on period
    const periodMs = this.getPeriodMs(period || '7d');
    const fromDate = new Date(new Date(toDate).getTime() - periodMs).toISOString();

    return { fromDate, toDate };
  }

  /**
   * Get period in milliseconds
   */
  private getPeriodMs(period: string): number {
    const periodMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '14d': 14 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '60d': 60 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };

    return periodMap[period] || periodMap['7d'];
  }
}
