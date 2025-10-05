import { z } from 'zod';

/**
 * Funnel step definition
 */
export const funnelStepSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  name: z.string().optional(), // Display name for the step
  properties: z.record(z.any()).optional(), // Optional property filters
});

/**
 * Funnel query request schema
 */
export const funnelQuerySchema = z.object({
  steps: z.array(funnelStepSchema).min(2, 'At least 2 steps required'),
  time_window: z.string().default('7d'), // Time window to consider
  step_order: z.enum(['strict', 'any_order']).default('strict'),
  breakdown_by: z.string().optional(), // Property to segment by
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

/**
 * Funnel step result
 */
export const funnelStepResultSchema = z.object({
  step: z.number(),
  name: z.string(),
  event: z.string(),
  users_count: z.number(),
  completion_rate: z.number(),
  drop_off_rate: z.number(),
  avg_time_to_next: z.string().nullable(),
});

/**
 * Funnel response schema
 */
export const funnelResponseSchema = z.object({
  steps: z.array(funnelStepResultSchema),
  total_conversion_rate: z.number(),
  total_users_entered: z.number(),
  total_users_converted: z.number(),
  average_completion_time: z.string().nullable(),
  time_window: z.string(),
});

// Export types
export type FunnelStep = z.infer<typeof funnelStepSchema>;
export type FunnelQuery = z.infer<typeof funnelQuerySchema>;
export type FunnelStepResult = z.infer<typeof funnelStepResultSchema>;
export type FunnelResponse = z.infer<typeof funnelResponseSchema>;
