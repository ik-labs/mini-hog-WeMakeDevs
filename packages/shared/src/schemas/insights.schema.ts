import { z } from 'zod';

/**
 * Time period enum
 */
export const timePeriodSchema = z.enum([
  '1h',
  '6h',
  '12h',
  '24h',
  '7d',
  '14d',
  '30d',
  '60d',
  '90d',
  'all',
]);

/**
 * Time interval enum
 */
export const timeIntervalSchema = z.enum([
  'minute',
  'hour',
  'day',
  'week',
  'month',
]);

/**
 * Trends query schema
 */
export const trendsQuerySchema = z.object({
  event_name: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  period: timePeriodSchema.optional(),
  interval: timeIntervalSchema.optional(),
  breakdown_by: z.string().optional(),
});

/**
 * Active users query schema
 */
export const activeUsersQuerySchema = z.object({
  period: timePeriodSchema.default('7d'),
});

/**
 * Top events query schema
 */
export const topEventsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

/**
 * Events list query schema
 */
export const eventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  event_name: z.string().optional(),
  distinct_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  period: timePeriodSchema.optional(),
});

// Export types
export type TimePeriod = z.infer<typeof timePeriodSchema>;
export type TimeInterval = z.infer<typeof timeIntervalSchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type ActiveUsersQuery = z.infer<typeof activeUsersQuerySchema>;
export type TopEventsQuery = z.infer<typeof topEventsQuerySchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
