#!/usr/bin/env node
import { Cerebras } from '@cerebras/cerebras_cloud_sdk';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '.env' });

const logger = new Logger('CerebrasTest');

async function testCerebras() {
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.log('Testing Cerebras API Connection...');
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const apiKey = process.env.CEREBRAS_API_KEY;

  if (!apiKey) {
    logger.error('❌ CEREBRAS_API_KEY not found in environment');
    logger.error('Please add it to your .env file:');
    logger.error('CEREBRAS_API_KEY=your_api_key_here');
    logger.error('');
    logger.error('Get your API key from: https://cloud.cerebras.ai/');
    process.exit(1);
  }

  logger.log(`✓ API Key found: ${apiKey.substring(0, 10)}...`);

  try {
    const client = new Cerebras({
      apiKey,
    });

    logger.log('');
    logger.log('Testing basic inference with llama3.1-8b...');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that responds concisely.',
        },
        {
          role: 'user',
          content: 'Say "Hello from Cerebras!" in exactly 5 words.',
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.log('');
    logger.log('✅ SUCCESS! Cerebras API is working');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log(`Model: ${response.model}`);
    logger.log(`Response: ${(response.choices as any)?.[0]?.message?.content || 'N/A'}`);
    logger.log(`Duration: ${duration}ms`);
    logger.log(`Tokens: ${(response.usage as any)?.total_tokens || 'N/A'}`);
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log('');

    // Test available models
    logger.log('Testing model availability...');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const modelsToTest = [
      'llama3.1-8b',
      'llama3.1-70b',
      'llama-3.3-70b',
    ];

    for (const model of modelsToTest) {
      try {
        await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        });
        logger.log(`✓ ${model} - Available`);
      } catch (error: any) {
        if (error.status === 404 || error.message?.includes('not found')) {
          logger.warn(`✗ ${model} - Not available`);
        } else {
          logger.log(`✓ ${model} - Available (API responded)`);
        }
      }
    }

    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log('');
    logger.log('🎉 Cerebras setup complete!');
    logger.log('You can now use Cerebras for AI-powered features');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error: any) {
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('❌ Error testing Cerebras API:');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error(`Status: ${error.status}`);
    logger.error(`Message: ${error.message}`);
    
    if (error.status === 401) {
      logger.error('');
      logger.error('Invalid API key. Please check:');
      logger.error('1. Your API key is correct');
      logger.error('2. Your account is active');
      logger.error('3. Get a new key from: https://cloud.cerebras.ai/');
    }
    
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

testCerebras();
