import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { FunnelService } from './funnel.service';
import { RetentionService } from './retention.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, FunnelService, RetentionService],
  exports: [InsightsService, FunnelService, RetentionService],
})
export class InsightsModule {}
