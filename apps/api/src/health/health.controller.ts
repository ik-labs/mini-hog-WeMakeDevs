import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('healthz')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'minihog-api',
    };
  }

  @Get('readyz')
  readinessCheck() {
    // TODO: Check DuckDB and SQLite connectivity
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        duckdb: 'ok',
        sqlite: 'ok',
      },
    };
  }
}
