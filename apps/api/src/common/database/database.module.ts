import { Global, Module } from '@nestjs/common';
import { DuckDbService } from './duckdb.service';
import { SqliteService } from './sqlite.service';

@Global()
@Module({
  providers: [DuckDbService, SqliteService],
  exports: [DuckDbService, SqliteService],
})
export class DatabaseModule {}
