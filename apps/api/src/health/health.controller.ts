import { Controller, Get } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import { SqliteService } from '../common/database/sqlite.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly duckdb: DuckDbService,
    private readonly sqlite: SqliteService,
  ) {}

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
    const sqliteStatus = this.sqlite.healthCheck();

    const allHealthy = duckdbStatus && sqliteStatus;

    return {
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        duckdb: duckdbStatus ? 'ok' : 'failed',
        sqlite: sqliteStatus ? 'ok' : 'failed',
      },
    };
  }
}
