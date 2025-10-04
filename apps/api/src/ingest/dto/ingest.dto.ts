import { z } from 'zod';
import {
  eventSchema,
  batchEventsSchema,
  identifySchema,
  type Event,
  type BatchEventsRequest,
  type Identify,
} from '@minihog/shared';

// Re-export schemas for use in controller
export { eventSchema, batchEventsSchema, identifySchema };

// Re-export types
export type { Event, BatchEventsRequest, Identify };

// Validation pipe helper
export class ZodValidationPipe {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
