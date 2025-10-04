import { Controller, Get } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';

@Controller('health')
export class HealthController {
  constructor(private readonly duckdb: DuckDbService) {}

  @Get('healthz')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'minihog-api',
    };
  }

  @Get('readyz')
  async readinessCheck() {
    const duckdbStatus = await this.duckdb.healthCheck();

    return {
      status: duckdbStatus ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        duckdb: duckdbStatus ? 'ok' : 'failed',
        sqlite: 'pending', // TODO: Add SQLite check
      },
    };
  }
}
