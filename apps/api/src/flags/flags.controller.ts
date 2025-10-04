import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { featureFlagSchema } from '@minihog/shared';
import { ZodError } from 'zod';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  /**
   * List all feature flags
   * GET /api/flags
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const flags = await this.flagsService.findAll();
    return {
      success: true,
      data: flags,
    };
  }

  /**
   * Get a single feature flag
   * GET /api/flags/:key
   */
  @Get(':key')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('key') key: string) {
    const flag = await this.flagsService.findOne(key);
    return {
      success: true,
      data: flag,
    };
  }

  /**
   * Create a new feature flag
   * POST /api/flags
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    try {
      const validatedData = featureFlagSchema.parse(body);
      const flag = await this.flagsService.create(validatedData);
      return {
        success: true,
        data: flag,
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
   * Update a feature flag
   * PATCH /api/flags/:key
   */
  @Patch(':key')
  @HttpCode(HttpStatus.OK)
  async update(@Param('key') key: string, @Body() body: any) {
    try {
      // Partial validation for updates
      const validatedData = featureFlagSchema.partial().parse(body);
      const flag = await this.flagsService.update(key, validatedData);
      return {
        success: true,
        data: flag,
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
   * Delete a feature flag
   * DELETE /api/flags/:key
   */
  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('key') key: string) {
    const result = await this.flagsService.delete(key);
    return {
      success: true,
      ...result,
    };
  }

}
