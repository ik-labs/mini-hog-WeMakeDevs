import { Module } from '@nestjs/common';
import { FlagsController } from './flags.controller';
import { FfController } from './ff.controller';
import { FlagsService } from './flags.service';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FlagsController, FfController],
  providers: [FlagsService],
  exports: [FlagsService],
})
export class FlagsModule {}
