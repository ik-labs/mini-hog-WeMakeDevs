import {
  Controller,
  Post,
  Body,
  Headers,
  Ip,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IngestService } from './ingest.service';
import { batchEventsSchema, identifySchema } from './dto/ingest.dto';
import { ZodError } from 'zod';

@Controller('ingest')
export class IngestController {
  private readonly logger = new Logger(IngestController.name);

  constructor(private readonly ingestService: IngestService) {}

  /**
   * Batch events endpoint
   * POST /api/ingest/e
   */
  @Post('e')
  @HttpCode(HttpStatus.OK)
  async batchEvents(
    @Body() body: unknown,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    try {
      // Validate request body
      const validatedRequest = batchEventsSchema.parse(body);

      // Process events
      const result = await this.ingestService.ingestEvents(
        validatedRequest,
        userAgent,
        ipAddress,
      );

      return {
        success: true,
        received: result.received,
        processed: result.processed,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.warn('Validation error:', error.errors);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      this.logger.error('Error processing batch events:', error);
      throw error;
    }
  }

  /**
   * Identify endpoint
   * POST /api/ingest/id
   */
  @Post('id')
  @HttpCode(HttpStatus.OK)
  async identify(
    @Body() body: unknown,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    try {
      // Validate request body
      const validatedRequest = identifySchema.parse(body);

      // Process identify
      await this.ingestService.identify(
        validatedRequest,
        userAgent,
        ipAddress,
      );

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.warn('Validation error:', error.errors);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      this.logger.error('Error processing identify:', error);
      throw error;
    }
  }

  /**
   * Get ingestion stats
   * GET /api/ingest/stats
   */
  @Post('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    const stats = await this.ingestService.getStats();
    return {
      success: true,
      data: stats,
    };
  }
}
