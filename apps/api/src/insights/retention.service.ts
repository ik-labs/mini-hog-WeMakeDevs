import { Injectable, Logger } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import type { 
  RetentionQuery, 
  RetentionResponse, 
  CohortRetention,
  RetentionPeriod,
  RetentionSummary,
  RetentionMetadata 
} from '@minihog/shared';

interface CohortData {
  cohort_date: string;
  distinct_id: string;
}

interface PeriodData {
  cohort_date: string;
  period_number: number;
  user_count: number;
}

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private readonly duckdb: DuckDbService) {}

  /**
   * Calculate cohort retention analysis
   */
  async calculateRetention(query: RetentionQuery): Promise<RetentionResponse> {
    const {
      cohort_type = 'first_event',
      cohort_event = 'pageview',
      return_event = 'any',
      period_type = 'weekly',
      periods = 12,
      date_range = '90d',
    } = query;

    this.logger.debug(`Calculating retention: cohort_type=${cohort_type}, period_type=${period_type}`);

    // Calculate time range
    const { fromDate, toDate } = this.calculateTimeRange(query.from, query.to, date_range);

    // Step 1: Identify cohorts (users grouped by when they first did the cohort event)
    const cohorts = await this.identifyCohorts(cohort_event, period_type, fromDate, toDate);

    if (cohorts.size === 0) {
      return this.emptyResponse(cohort_type, period_type, periods, fromDate, toDate);
    }

    this.logger.debug(`Found ${cohorts.size} cohorts`);

    // Step 2: Calculate retention for each cohort
    const cohortRetentions = await this.calculateCohortRetentions(
      cohorts,
      return_event,
      period_type,
      periods,
      toDate
    );

    // Step 3: Calculate summary metrics
    const summary = this.calculateSummary(cohortRetentions);

    // Step 4: Build metadata
    const metadata: RetentionMetadata = {
      cohort_type,
      period_type,
      periods_analyzed: periods,
      date_from: fromDate,
      date_to: toDate,
    };

    return {
      cohorts: cohortRetentions,
      summary,
      metadata,
    };
  }

  /**
   * Identify cohorts based on first occurrence of cohort event
   */
  private async identifyCohorts(
    cohortEvent: string,
    periodType: 'daily' | 'weekly' | 'monthly',
    fromDate: string,
    toDate: string
  ): Promise<Map<string, Set<string>>> {
    const truncFunc = this.getTruncFunction(periodType);

    const sql = `
      SELECT 
        CAST(${truncFunc} AS VARCHAR) as cohort_date,
        distinct_id
      FROM (
        SELECT 
          distinct_id,
          MIN(timestamp) as timestamp
        FROM events
        WHERE event = ?
          AND timestamp >= ?::TIMESTAMP
          AND timestamp <= ?::TIMESTAMP
        GROUP BY distinct_id
      ) subq
    `;

    this.logger.debug(`Cohort SQL: ${sql}`);
    const results = await this.duckdb.query<CohortData>(sql, [cohortEvent, fromDate, toDate]);

    // Group users by cohort date
    const cohortMap = new Map<string, Set<string>>();
    for (const row of results) {
      const cohortDate = row.cohort_date;
      if (!cohortMap.has(cohortDate)) {
        cohortMap.set(cohortDate, new Set());
      }
      cohortMap.get(cohortDate)!.add(row.distinct_id);
    }

    return cohortMap;
  }

  /**
   * Calculate retention percentages for each cohort
   */
  private async calculateCohortRetentions(
    cohorts: Map<string, Set<string>>,
    returnEvent: string,
    periodType: 'daily' | 'weekly' | 'monthly',
    maxPeriods: number,
    toDate: string
  ): Promise<CohortRetention[]> {
    const cohortRetentions: CohortRetention[] = [];

    for (const [cohortDate, userIds] of cohorts.entries()) {
      const cohortSize = userIds.size;
      
      // Calculate retention for each period
      const periods = await this.calculatePeriodsForCohort(
        cohortDate,
        Array.from(userIds),
        returnEvent,
        periodType,
        maxPeriods,
        toDate
      );

      cohortRetentions.push({
        cohort_name: this.formatCohortName(cohortDate, periodType),
        cohort_start: cohortDate,
        cohort_size: cohortSize,
        periods,
      });
    }

    // Sort by cohort date (oldest first)
    return cohortRetentions.sort((a, b) => 
      a.cohort_start.localeCompare(b.cohort_start)
    );
  }

  /**
   * Calculate retention for each period within a cohort
   */
  private async calculatePeriodsForCohort(
    cohortDate: string,
    userIds: string[],
    returnEvent: string,
    periodType: 'daily' | 'weekly' | 'monthly',
    maxPeriods: number,
    toDate: string
  ): Promise<RetentionPeriod[]> {
    if (userIds.length === 0) return [];

    const intervalFunc = this.getIntervalFunction(periodType);
    const cohortSize = userIds.length;

    // Build SQL to count active users per period
    const eventFilter = returnEvent === 'any' ? '' : `AND event = ?`;
    const params: any[] = [cohortDate, toDate];
    if (returnEvent !== 'any') {
      params.push(returnEvent);
    }

    const sql = `
      WITH period_bounds AS (
        SELECT 
          generate_series AS period_number
        FROM generate_series(0, ?, 1)
      ),
      user_activity AS (
        SELECT DISTINCT
          e.distinct_id,
          FLOOR(EXTRACT(EPOCH FROM (e.timestamp::TIMESTAMP - ?::TIMESTAMP)) / ${intervalFunc}) as period_number
        FROM events e
        WHERE e.distinct_id IN (${userIds.map(() => '?').join(', ')})
          AND e.timestamp::TIMESTAMP >= ?::TIMESTAMP
          AND e.timestamp::TIMESTAMP <= ?::TIMESTAMP
          ${eventFilter}
      )
      SELECT 
        CAST(pb.period_number AS INTEGER) as period_number,
        CAST(COALESCE(COUNT(DISTINCT ua.distinct_id), 0) AS INTEGER) as user_count
      FROM period_bounds pb
      LEFT JOIN user_activity ua ON pb.period_number = ua.period_number
      GROUP BY pb.period_number
      ORDER BY pb.period_number
    `;

    const queryParams = [
      maxPeriods - 1,
      cohortDate,
      ...userIds,
      cohortDate,
      toDate,
      ...(returnEvent !== 'any' ? [returnEvent] : []),
    ];

    this.logger.debug(`Period SQL for cohort ${cohortDate}`);
    const results = await this.duckdb.query<PeriodData>(sql, queryParams);

    // Convert to RetentionPeriod format
    return results.map(row => ({
      period: Number(row.period_number),
      users: Number(row.user_count),
      percentage: cohortSize > 0 ? Number(((Number(row.user_count) / cohortSize) * 100).toFixed(2)) : 0,
    }));
  }

  /**
   * Calculate summary metrics across all cohorts
   */
  private calculateSummary(cohorts: CohortRetention[]): RetentionSummary {
    if (cohorts.length === 0) {
      return {
        total_cohorts: 0,
        avg_period1_retention: null,
        avg_period7_retention: null,
        avg_period30_retention: null,
        best_cohort: null,
        worst_cohort: null,
        total_users: 0,
      };
    }

    const totalUsers = cohorts.reduce((sum, c) => sum + c.cohort_size, 0);

    // Calculate average retention for specific periods
    const getAvgRetention = (periodIndex: number) => {
      const values = cohorts
        .map(c => c.periods.find(p => p.period === periodIndex)?.percentage)
        .filter((p): p is number => p !== undefined);
      
      if (values.length === 0) return null;
      return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2));
    };

    // Find best and worst cohorts (by period 7 or last available period)
    const cohortScores = cohorts.map(c => ({
      name: c.cohort_name,
      score: c.periods.find(p => p.period === 7)?.percentage || 
             c.periods[c.periods.length - 1]?.percentage || 0,
    }));

    cohortScores.sort((a, b) => b.score - a.score);

    return {
      total_cohorts: cohorts.length,
      avg_period1_retention: getAvgRetention(1),
      avg_period7_retention: getAvgRetention(7),
      avg_period30_retention: getAvgRetention(30),
      best_cohort: cohortScores[0]?.name || null,
      worst_cohort: cohortScores[cohortScores.length - 1]?.name || null,
      total_users: totalUsers,
    };
  }

  /**
   * Get SQL date truncation function based on period type
   */
  private getTruncFunction(periodType: 'daily' | 'weekly' | 'monthly'): string {
    switch (periodType) {
      case 'daily':
        return "DATE_TRUNC('day', timestamp::TIMESTAMP)";
      case 'weekly':
        return "DATE_TRUNC('week', timestamp::TIMESTAMP)";
      case 'monthly':
        return "DATE_TRUNC('month', timestamp::TIMESTAMP)";
    }
  }

  /**
   * Get interval in seconds for period type
   */
  private getIntervalFunction(periodType: 'daily' | 'weekly' | 'monthly'): number {
    switch (periodType) {
      case 'daily':
        return 86400; // 24 * 60 * 60
      case 'weekly':
        return 604800; // 7 * 24 * 60 * 60
      case 'monthly':
        return 2592000; // 30 * 24 * 60 * 60 (approximate)
    }
  }

  /**
   * Format cohort name for display
   */
  private formatCohortName(cohortDate: string, periodType: 'daily' | 'weekly' | 'monthly'): string {
    const date = new Date(cohortDate);
    
    switch (periodType) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  /**
   * Calculate time range from parameters
   */
  private calculateTimeRange(
    from?: string,
    to?: string,
    dateRange: string = '90d'
  ): { fromDate: string; toDate: string } {
    const now = new Date();
    const toDate = to ? new Date(to) : now;
    let fromDate: Date;

    if (from) {
      fromDate = new Date(from);
    } else {
      // Parse date_range string (e.g., '30d', '90d')
      const match = dateRange.match(/^(\d+)([dwmy])$/);
      if (!match) {
        throw new Error(`Invalid date_range format: ${dateRange}`);
      }

      const value = parseInt(match[1]);
      const unit = match[2];

      fromDate = new Date(toDate);
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
        case 'y':
          fromDate.setFullYear(fromDate.getFullYear() - value);
          break;
      }
    }

    return {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };
  }

  /**
   * Return empty response when no data
   */
  private emptyResponse(
    cohortType: string,
    periodType: string,
    periods: number,
    fromDate: string,
    toDate: string
  ): RetentionResponse {
    return {
      cohorts: [],
      summary: {
        total_cohorts: 0,
        avg_period1_retention: null,
        avg_period7_retention: null,
        avg_period30_retention: null,
        best_cohort: null,
        worst_cohort: null,
        total_users: 0,
      },
      metadata: {
        cohort_type: cohortType,
        period_type: periodType,
        periods_analyzed: periods,
        date_from: fromDate,
        date_to: toDate,
      },
    };
  }
}
