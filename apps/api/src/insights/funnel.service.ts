import { Injectable, Logger } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import type { FunnelQuery, FunnelResponse, FunnelStepResult } from '@minihog/shared';

interface StepData {
  distinct_id: string;
  timestamp: string;
  step_index: number;
}

@Injectable()
export class FunnelService {
  private readonly logger = new Logger(FunnelService.name);

  constructor(private readonly duckdb: DuckDbService) {}

  /**
   * Calculate funnel conversion rates
   */
  async calculateFunnel(query: FunnelQuery): Promise<FunnelResponse> {
    const { steps, time_window = '7d', step_order = 'strict' } = query;

    if (steps.length < 2) {
      throw new Error('Funnel must have at least 2 steps');
    }

    this.logger.debug(`Calculating funnel with ${steps.length} steps`);

    // Calculate time range
    const { fromDate, toDate } = this.calculateTimeRange(query.from, query.to, time_window);

    // Get users who completed each step
    const stepResults = await this.calculateStepCompletions(
      steps,
      fromDate,
      toDate,
      step_order
    );

    // Calculate metrics
    const totalUsersEntered = stepResults[0]?.users_count || 0;
    const totalUsersConverted = stepResults[stepResults.length - 1]?.users_count || 0;
    const totalConversionRate = totalUsersEntered > 0 
      ? (totalUsersConverted / totalUsersEntered) * 100 
      : 0;

    // Calculate average completion time
    const avgCompletionTime = await this.calculateAverageCompletionTime(
      steps,
      fromDate,
      toDate,
      step_order
    );

    return {
      steps: stepResults,
      total_conversion_rate: Number(totalConversionRate.toFixed(2)),
      total_users_entered: totalUsersEntered,
      total_users_converted: totalUsersConverted,
      average_completion_time: avgCompletionTime,
      time_window,
    };
  }

  /**
   * Calculate completion for each step
   */
  private async calculateStepCompletions(
    steps: FunnelQuery['steps'],
    fromDate: string,
    toDate: string,
    stepOrder: 'strict' | 'any_order'
  ): Promise<FunnelStepResult[]> {
    const results: FunnelStepResult[] = [];

    if (stepOrder === 'strict') {
      // Strict order: each step must happen after the previous
      let previousStepUsers: Set<string> | null = null;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepName = step.name || step.event;

        // Build SQL for this step
        let sql = `
          SELECT DISTINCT 
            e.distinct_id,
            e.timestamp
          FROM events e
          WHERE e.event = ?
            AND e.timestamp >= ?
            AND e.timestamp <= ?
        `;
        const params: any[] = [step.event, fromDate, toDate];

        // If not the first step, ensure it happens after previous step
        if (i > 0 && previousStepUsers && previousStepUsers.size > 0) {
          const prevStep = steps[i - 1];
          sql = `
            WITH prev_step AS (
              SELECT DISTINCT 
                distinct_id,
                timestamp as prev_timestamp
              FROM events
              WHERE event = ?
                AND timestamp >= ?
                AND timestamp <= ?
            )
            SELECT DISTINCT 
              e.distinct_id,
              e.timestamp
            FROM events e
            INNER JOIN prev_step p ON e.distinct_id = p.distinct_id
            WHERE e.event = ?
              AND e.timestamp > p.prev_timestamp
              AND e.timestamp <= ?
          `;
          params.splice(0, 3, prevStep.event, fromDate, toDate, step.event, toDate);
        }

        this.logger.debug(`Step ${i + 1} SQL: ${sql}`);
        this.logger.debug(`Step ${i + 1} Params:`, params);

        const stepData = await this.duckdb.query<StepData>(sql, params);
        const usersCount = new Set(stepData.map(d => d.distinct_id)).size;

        // Calculate metrics
        const completionRate = results.length > 0 && results[0].users_count > 0
          ? (usersCount / results[0].users_count) * 100
          : 100;

        const dropOffRate = i > 0 && results[i - 1].users_count > 0
          ? ((results[i - 1].users_count - usersCount) / results[i - 1].users_count) * 100
          : 0;

        // Calculate average time to next step
        let avgTimeToNext: string | null = null;
        if (i < steps.length - 1) {
          avgTimeToNext = await this.calculateAvgTimeBetweenSteps(
            steps[i],
            steps[i + 1],
            fromDate,
            toDate
          );
        }

        results.push({
          step: i + 1,
          name: stepName,
          event: step.event,
          users_count: usersCount,
          completion_rate: Number(completionRate.toFixed(2)),
          drop_off_rate: Number(dropOffRate.toFixed(2)),
          avg_time_to_next: avgTimeToNext,
        });

        // Update previous step users for next iteration
        previousStepUsers = new Set(stepData.map(d => d.distinct_id));
      }
    } else {
      // Any order: steps can happen in any sequence
      // This is simpler - just count users who did each event
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepName = step.name || step.event;

        const sql = `
          SELECT COUNT(DISTINCT distinct_id) as count
          FROM events
          WHERE event = ?
            AND timestamp >= ?
            AND timestamp <= ?
        `;

        const result = await this.duckdb.query<{ count: number }>(
          sql,
          [step.event, fromDate, toDate]
        );

        const usersCount = Number(result[0]?.count || 0);
        const completionRate = results.length > 0 && results[0].users_count > 0
          ? (usersCount / results[0].users_count) * 100
          : 100;

        const dropOffRate = i > 0 && results[i - 1].users_count > 0
          ? ((results[i - 1].users_count - usersCount) / results[i - 1].users_count) * 100
          : 0;

        results.push({
          step: i + 1,
          name: stepName,
          event: step.event,
          users_count: usersCount,
          completion_rate: Number(completionRate.toFixed(2)),
          drop_off_rate: Number(dropOffRate.toFixed(2)),
          avg_time_to_next: null,
        });
      }
    }

    return results;
  }

  /**
   * Calculate average time between two steps
   */
  private async calculateAvgTimeBetweenSteps(
    step1: FunnelQuery['steps'][0],
    step2: FunnelQuery['steps'][0],
    fromDate: string,
    toDate: string
  ): Promise<string | null> {
    const sql = `
      WITH step1_events AS (
        SELECT distinct_id, MIN(timestamp) as step1_time
        FROM events
        WHERE event = ?
          AND timestamp >= ?
          AND timestamp <= ?
        GROUP BY distinct_id
      ),
      step2_events AS (
        SELECT distinct_id, MIN(timestamp) as step2_time
        FROM events
        WHERE event = ?
          AND timestamp >= ?
          AND timestamp <= ?
        GROUP BY distinct_id
      )
      SELECT AVG(EXTRACT(EPOCH FROM (s2.step2_time::TIMESTAMP - s1.step1_time::TIMESTAMP))) as avg_seconds
      FROM step1_events s1
      INNER JOIN step2_events s2 ON s1.distinct_id = s2.distinct_id
      WHERE s2.step2_time > s1.step1_time
    `;

    const result = await this.duckdb.query<{ avg_seconds: number }>(
      sql,
      [step1.event, fromDate, toDate, step2.event, fromDate, toDate]
    );

    const avgSeconds = result[0]?.avg_seconds;
    if (!avgSeconds) return null;

    return this.formatDuration(avgSeconds);
  }

  /**
   * Calculate average completion time for entire funnel
   */
  private async calculateAverageCompletionTime(
    steps: FunnelQuery['steps'],
    fromDate: string,
    toDate: string,
    stepOrder: 'strict' | 'any_order'
  ): Promise<string | null> {
    if (stepOrder !== 'strict') return null;

    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    return this.calculateAvgTimeBetweenSteps(firstStep, lastStep, fromDate, toDate);
  }

  /**
   * Calculate time range from parameters
   */
  private calculateTimeRange(
    from?: string,
    to?: string,
    period: string = '7d'
  ): { fromDate: string; toDate: string } {
    const now = new Date();
    let toDate = to ? new Date(to) : now;
    let fromDate: Date;

    if (from) {
      fromDate = new Date(from);
    } else {
      // Parse period string (e.g., '7d', '30d', '24h')
      const match = period.match(/^(\d+)([hdwmy])$/);
      if (!match) {
        throw new Error(`Invalid period format: ${period}`);
      }

      const value = parseInt(match[1]);
      const unit = match[2];

      fromDate = new Date(toDate);
      switch (unit) {
        case 'h':
          fromDate.setHours(fromDate.getHours() - value);
          break;
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
   * Format duration in seconds to human-readable string
   */
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.round((seconds % 86400) / 3600);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  }
}
