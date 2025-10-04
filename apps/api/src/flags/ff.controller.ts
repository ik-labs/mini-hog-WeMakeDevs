import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { flagEvaluationSchema } from '@minihog/shared';
import { ZodError } from 'zod';

/**
 * Feature Flag Evaluation Controller
 * Short route for SDK/client usage: GET /api/ff
 */
@Controller('ff')
export class FfController {
  constructor(private readonly flagsService: FlagsService) {}

  /**
   * Evaluate a feature flag for a user
   * GET /api/ff?key=example_flag&distinct_id=user123
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async evaluate(@Query() query: any) {
    try {
      const validatedQuery = flagEvaluationSchema.parse(query);
      const evaluation = await this.flagsService.evaluate(
        validatedQuery.key,
        validatedQuery.distinct_id
      );
      return {
        success: true,
        data: evaluation,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }
}
