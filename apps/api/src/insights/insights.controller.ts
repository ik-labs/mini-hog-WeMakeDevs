import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import { FunnelService } from './funnel.service';
import {
  trendsQuerySchema,
  activeUsersQuerySchema,
  topEventsQuerySchema,
  eventsQuerySchema,
  funnelQuerySchema,
} from '@minihog/shared';
import { ZodError } from 'zod';
import { FunnelQueryDto } from './dto/funnel.dto';

@Controller('insights')
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly funnelService: FunnelService,
  ) {}

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

  /**
   * Get events list with pagination and filters
   * GET /api/insights/events
   */
  @Get('events')
  @HttpCode(HttpStatus.OK)
  async getEvents(@Query() query: any) {
    try {
      const validatedQuery = eventsQuerySchema.parse(query);
      const data = await this.insightsService.getEvents(validatedQuery);

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
   * Calculate funnel conversion rates
   * POST /api/insights/funnel
   */
  @Post('funnel')
  @HttpCode(HttpStatus.OK)
  async calculateFunnel(@Body() body: FunnelQueryDto) {
    try {
      const validatedQuery = funnelQuerySchema.parse(body);
      const data = await this.funnelService.calculateFunnel(validatedQuery);

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
}
