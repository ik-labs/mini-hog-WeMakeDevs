import { Controller, Get } from '@nestjs/common';
import { DuckDbService } from '../common/database/duckdb.service';
import { SqliteService } from '../common/database/sqlite.service';
import { Public } from '../auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly duckdb: DuckDbService,
    private readonly sqlite: SqliteService,
  ) {}

  /**
   * Check disk space availability
   */
  private async checkDiskSpace(): Promise<{
    available: boolean;
    percentUsed?: number;
  }> {
    try {
      // Check if data directory exists and is writable
      const dataDir = path.join(process.cwd(), '../../data');
      
      // Check if directory is writable
      try {
        fs.accessSync(dataDir, fs.constants.W_OK);
        return { available: true };
      } catch {
        return { available: false };
      }
    } catch {
      return { available: false };
    }
  }

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
    const [duckdbStatus, sqliteStatus, diskSpace] = await Promise.all([
      this.duckdb.healthCheck(),
      this.sqlite.healthCheck(),
      this.checkDiskSpace(),
    ]);

    const allHealthy = duckdbStatus && sqliteStatus && diskSpace.available;

    return {
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        duckdb: duckdbStatus ? 'ok' : 'failed',
        sqlite: sqliteStatus ? 'ok' : 'failed',
        disk_space: diskSpace.available ? 'ok' : 'failed',
      },
    };
  }
}
