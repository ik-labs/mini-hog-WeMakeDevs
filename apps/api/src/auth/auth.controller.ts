import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Create a new API key
   * POST /api/auth/keys
   */
  @Post('keys')
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @Body() body: { name: string; description?: string },
  ) {
    const result = await this.authService.createApiKey(
      body.name,
      body.description,
    );

    return {
      success: true,
      data: result,
      message: 'API key created successfully. Store it securely - it will not be shown again.',
    };
  }

  /**
   * List all API keys
   * GET /api/auth/keys
   */
  @Get('keys')
  @HttpCode(HttpStatus.OK)
  async listApiKeys() {
    const keys = await this.authService.listApiKeys();

    return {
      success: true,
      data: keys,
    };
  }

  /**
   * Revoke an API key
   * POST /api/auth/keys/:id/revoke
   */
  @Post('keys/:id/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeApiKey(@Param('id') id: string) {
    await this.authService.revokeApiKey(parseInt(id, 10));

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  }

  /**
   * Delete an API key
   * DELETE /api/auth/keys/:id
   */
  @Delete('keys/:id')
  @HttpCode(HttpStatus.OK)
  async deleteApiKey(@Param('id') id: string) {
    await this.authService.deleteApiKey(parseInt(id, 10));

    return {
      success: true,
      message: 'API key deleted successfully',
    };
  }

  /**
   * Test endpoint to verify API key
   * GET /api/auth/verify
   */
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify() {
    return {
      success: true,
      message: 'API key is valid',
    };
  }
}
