#!/usr/bin/env node
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const logger = new Logger('AITest');

async function testAiEndpoint() {
  const apiKey = process.env.MINIHOG_API_KEY || 'mh_test_12345678901234567890123456789012';
  const endpoint = 'http://localhost:3000/api';

  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.log('Testing AI Query Endpoint...');
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testQuestions = [
    'How many events happened today?',
    'What are the top 5 events by count?',
    'How many unique users do we have?',
    'Show me events over the last 7 days grouped by day',
  ];

  for (const question of testQuestions) {
    logger.log('');
    logger.log(`Question: "${question}"`);
    logger.log('─'.repeat(60));

    try {
      const response = await fetch(`${endpoint}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        logger.error(`✗ Failed: ${error.error || response.statusText}`);
        continue;
      }

      const data = await response.json() as { data: any };
      const result = data.data;

      logger.log(`✓ SQL: ${result.sql}`);
      logger.log(`✓ Results: ${result.results.length} rows`);
      logger.log(`✓ Execution time: ${result.executionTime}ms`);
      logger.log(`✓ Chart: ${result.chartSuggestion}`);
      logger.log(`✓ Insights: ${result.insights}`);
      
      if (result.results.length > 0 && result.results.length <= 5) {
        logger.log(`✓ Sample data:`);
        console.log(JSON.stringify(result.results, null, 2));
      }
    } catch (error: any) {
      logger.error(`✗ Request failed: ${error.message}`);
    }
  }

  logger.log('');
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.log('AI Query Testing Complete!');
  logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testAiEndpoint().catch((error) => {
  logger.error('Test failed:', error);
  process.exit(1);
});
