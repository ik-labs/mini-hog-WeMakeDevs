import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { InsightsModule } from '../insights/insights.module';
import { AiModule } from '../ai/ai.module';
import { FlagsModule } from '../flags/flags.module';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [InsightsModule, AiModule, FlagsModule, DatabaseModule],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
