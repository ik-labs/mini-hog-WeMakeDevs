import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { FunnelService } from './funnel.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, FunnelService],
  exports: [InsightsService, FunnelService],
})
export class InsightsModule {}
