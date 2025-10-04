#!/usr/bin/env node
/**
 * Standalone MCP Server Entry Point
 * Run with: node dist/mcp-server.js
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { McpService } from './mcp/mcp.service';

async function bootstrap() {
  // Create NestJS application in standalone mode (no HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Get MCP service and start the server
  const mcpService = app.get(McpService);
  await mcpService.start();

  // Keep the process running
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
