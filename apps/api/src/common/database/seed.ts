#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AuthService } from '../../auth/auth.service';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('Seed');
  
  logger.log('Starting database seed...');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const authService = app.get(AuthService);

  try {
    // Check if any API keys exist
    const existingKeys = await authService.listApiKeys();
    
    if (existingKeys.length > 0) {
      logger.log('API keys already exist. Skipping seed.');
      logger.log(`Existing keys: ${existingKeys.map(k => k.name).join(', ')}`);
    } else {
      // Create initial API key
      const result = await authService.createApiKey(
        'Default API Key',
        'Initial API key for development',
      );

      logger.log('✅ Database seeded successfully!');
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.log('🔑 API Key Created:');
      logger.log(`   Name: ${result.name}`);
      logger.log(`   Key: ${result.key}`);
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.warn('⚠️  IMPORTANT: Save this API key securely!');
      logger.warn('   It will not be shown again.');
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

seed();
