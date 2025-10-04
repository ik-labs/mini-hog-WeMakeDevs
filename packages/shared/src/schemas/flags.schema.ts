import { z } from 'zod';

/**
 * Feature flag schema
 */
export const featureFlagSchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  active: z.boolean().default(true),
  rollout_percentage: z.number().int().min(0).max(100).default(0),
});

/**
 * Flag evaluation request schema
 */
export const flagEvaluationSchema = z.object({
  key: z.string().min(1),
  distinct_id: z.string().min(1),
});

/**
 * Flag evaluation response schema
 */
export const flagEvaluationResponseSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  variant: z.string().optional(),
  reason: z.string().optional(),
});

// Export types
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
export type FlagEvaluation = z.infer<typeof flagEvaluationSchema>;
export type FlagEvaluationResponse = z.infer<
  typeof flagEvaluationResponseSchema
>;
