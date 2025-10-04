#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DuckDbService } from './duckdb.service';
import { Logger } from '@nestjs/common';

async function seedEvents() {
  const logger = new Logger('SeedEvents');
  
  logger.log('Starting event seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const duckdb = app.get(DuckDbService);

  try {
    const events = [
      // PageViews
      { event: '$pageview', distinct_id: 'user_1', properties: { url: '/home', title: 'Home' } },
      { event: '$pageview', distinct_id: 'user_2', properties: { url: '/products', title: 'Products' } },
      { event: '$pageview', distinct_id: 'user_3', properties: { url: '/home', title: 'Home' } },
      { event: '$pageview', distinct_id: 'user_1', properties: { url: '/pricing', title: 'Pricing' } },
      { event: '$pageview', distinct_id: 'user_4', properties: { url: '/home', title: 'Home' } },
      
      // Clicks
      { event: '$click', distinct_id: 'user_1', properties: { button: 'signup', page: '/home' } },
      { event: '$click', distinct_id: 'user_2', properties: { button: 'cta', page: '/products' } },
      { event: '$click', distinct_id: 'user_3', properties: { button: 'learn-more', page: '/home' } },
      
      // Custom events
      { event: 'signup_completed', distinct_id: 'user_1', properties: { plan: 'pro' } },
      { event: 'signup_completed', distinct_id: 'user_4', properties: { plan: 'free' } },
      { event: 'product_viewed', distinct_id: 'user_2', properties: { product_id: 'prod_123' } },
      { event: 'product_viewed', distinct_id: 'user_3', properties: { product_id: 'prod_456' } },
      { event: 'checkout_started', distinct_id: 'user_1', properties: { cart_value: 99.99 } },
      { event: 'checkout_completed', distinct_id: 'user_1', properties: { order_id: 'ord_789', total: 99.99 } },
    ];

    const now = new Date();
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      // Spread events over the last 7 days
      const daysAgo = Math.floor(i / 2);
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      await duckdb.insertEvent({
        timestamp,
        event: event.event,
        distinct_id: event.distinct_id,
        properties: event.properties,
        project_id: 'default',
      });
    }

    logger.log(`✅ Successfully seeded ${events.length} events!`);
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log('Sample events:');
    logger.log(`  - ${events.filter(e => e.event === '$pageview').length} pageviews`);
    logger.log(`  - ${events.filter(e => e.event === '$click').length} clicks`);
    logger.log(`  - ${events.filter(e => e.event === 'signup_completed').length} signups`);
    logger.log(`  - ${events.filter(e => e.event.startsWith('product_')).length} product events`);
    logger.log(`  - ${events.filter(e => e.event.startsWith('checkout_')).length} checkout events`);
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    logger.error('Error seeding events:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

seedEvents();
