import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import {
  trendsQuerySchema,
  activeUsersQuerySchema,
  topEventsQuerySchema,
} from '@minihog/shared';
import { ZodError } from 'zod';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * Get trends - event counts over time
   * GET /api/insights/trends
   */
  @Get('trends')
  @HttpCode(HttpStatus.OK)
  async getTrends(@Query() query: any) {
    try {
      const validatedQuery = trendsQuerySchema.parse(query);
      const data = await this.insightsService.getTrends(validatedQuery);

      return {
        success: true,
        data,
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

  /**
   * Get active users (DAU/WAU/MAU)
   * GET /api/insights/active-users
   */
  @Get('active-users')
  @HttpCode(HttpStatus.OK)
  async getActiveUsers(@Query() query: any) {
    try {
      const validatedQuery = activeUsersQuerySchema.parse(query);
      const data = await this.insightsService.getActiveUsers(validatedQuery);

      return {
        success: true,
        data,
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

  /**
   * Get top events by count
   * GET /api/insights/top-events
   */
  @Get('top-events')
  @HttpCode(HttpStatus.OK)
  async getTopEvents(@Query() query: any) {
    try {
      const validatedQuery = topEventsQuerySchema.parse(query);
      const data = await this.insightsService.getTopEvents(validatedQuery);

      return {
        success: true,
        data,
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

  /**
   * Get overview stats
   * GET /api/insights/overview
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getOverview() {
    const [activeUsers, topEvents] = await Promise.all([
      this.insightsService.getActiveUsers({ period: '7d' }),
      this.insightsService.getTopEvents({ limit: 5 }),
    ]);

    return {
      success: true,
      data: {
        active_users: activeUsers,
        top_events: topEvents.events,
      },
    };
  }
}
