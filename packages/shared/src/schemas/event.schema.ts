import { z } from 'zod';

/**
 * Event schema for tracking user events
 */
export const eventSchema = z.object({
  event: z.string().min(1).max(200),
  distinct_id: z.string().min(1).max(200),
  anonymous_id: z.string().max(200).optional(),
  timestamp: z.string().datetime().optional(),
  properties: z.record(z.unknown()).optional(),
  context: z
    .object({
      url: z.string().optional(),
      referrer: z.string().optional(),
      title: z.string().optional(),
      user_agent: z.string().optional(),
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
      sdk_version: z.string().optional(),
      sdk_name: z.string().optional(),
    })
    .optional(),
  project_id: z.string().optional(),
  session_id: z.string().optional(),
});

/**
 * Batch events request schema
 */
export const batchEventsSchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
  api_key: z.string().optional(),
});

/**
 * Identify schema for user identification
 */
export const identifySchema = z.object({
  distinct_id: z.string().min(1).max(200),
  anonymous_id: z.string().max(200).optional(),
  traits: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

// Export types
export type Event = z.infer<typeof eventSchema>;
export type BatchEventsRequest = z.infer<typeof batchEventsSchema>;
export type Identify = z.infer<typeof identifySchema>;
