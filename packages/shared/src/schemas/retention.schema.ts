import { z } from 'zod';

/**
 * Retention query request schema
 */
export const retentionQuerySchema = z.object({
  cohort_type: z.enum(['first_event', 'signup', 'custom_event']).default('first_event'),
  cohort_event: z.string().default('pageview'), // Event that defines cohort
  return_event: z.string().default('any'), // "any" or specific event
  period_type: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  periods: z.number().int().min(1).max(52).default(12), // Number of periods to analyze
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  date_range: z.string().optional(), // e.g., "30d", "90d"
});

/**
 * Retention period data point
 */
export const retentionPeriodSchema = z.object({
  period: z.number(), // Period number (0 = cohort start)
  users: z.number(), // Number of returning users
  percentage: z.number(), // Retention percentage
});

/**
 * Single cohort retention data
 */
export const cohortRetentionSchema = z.object({
  cohort_name: z.string(),
  cohort_start: z.string(),
  cohort_size: z.number(),
  periods: z.array(retentionPeriodSchema),
});

/**
 * Retention summary metrics
 */
export const retentionSummarySchema = z.object({
  total_cohorts: z.number(),
  avg_period1_retention: z.number().nullable(),
  avg_period7_retention: z.number().nullable(),
  avg_period30_retention: z.number().nullable(),
  best_cohort: z.string().nullable(),
  worst_cohort: z.string().nullable(),
  total_users: z.number(),
});

/**
 * Retention metadata
 */
export const retentionMetadataSchema = z.object({
  cohort_type: z.string(),
  period_type: z.string(),
  periods_analyzed: z.number(),
  date_from: z.string(),
  date_to: z.string(),
});

/**
 * Retention response schema
 */
export const retentionResponseSchema = z.object({
  cohorts: z.array(cohortRetentionSchema),
  summary: retentionSummarySchema,
  metadata: retentionMetadataSchema,
});

// Export types
export type RetentionQuery = z.infer<typeof retentionQuerySchema>;
export type RetentionPeriod = z.infer<typeof retentionPeriodSchema>;
export type CohortRetention = z.infer<typeof cohortRetentionSchema>;
export type RetentionSummary = z.infer<typeof retentionSummarySchema>;
export type RetentionMetadata = z.infer<typeof retentionMetadataSchema>;
export type RetentionResponse = z.infer<typeof retentionResponseSchema>;
