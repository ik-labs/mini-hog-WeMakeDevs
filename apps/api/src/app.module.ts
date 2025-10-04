import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { IngestModule } from './ingest/ingest.module';
import { InsightsModule } from './insights/insights.module';
import { FlagsModule } from './flags/flags.module';
import { AiModule } from './ai/ai.module';
import { McpModule } from './mcp/mcp.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ApiKeyGuard } from './auth/guards/api-key.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule,

    // Database
    DatabaseModule,

    // Logger
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  singleLine: true,
                },
              }
            : undefined,
        autoLogging: true,
        quietReqLogger: true,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        customProps: () => ({
          context: 'HTTP',
        }),
      },
    }),

    // Feature modules
    IngestModule,
    InsightsModule,
    FlagsModule,
    AiModule,
    McpModule,
    AdminModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
