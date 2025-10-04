import { Global, Module } from '@nestjs/common';
import { DuckDbService } from './duckdb.service';

@Global()
@Module({
  providers: [DuckDbService],
  exports: [DuckDbService],
})
export class DatabaseModule {}
