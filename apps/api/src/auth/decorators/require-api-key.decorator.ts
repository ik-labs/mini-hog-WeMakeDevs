import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';

/**
 * Decorator to require API key authentication
 * Usage: @RequireApiKey() on controller or route
 */
export const RequireApiKey = () => UseGuards(ApiKeyGuard);
