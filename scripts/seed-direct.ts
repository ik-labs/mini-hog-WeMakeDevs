#!/usr/bin/env tsx

/**
 * Direct database seeding script for Docker builds
 * Creates analytics.duckdb and inserts events directly (no HTTP)
 */

import * as duckdb from 'duckdb';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DATABASE_PATH || './data/analytics.duckdb';
const NUM_EVENTS = 10000;
const NUM_USERS = 500;

// Event types
const EVENT_TYPES = [
  'pageview',
  'click',
  'submit',
  'signup',
  'login',
  'logout',
  'purchase',
  'add_to_cart',
  'remove_from_cart',
  'search',
  'share',
  'download',
  'upload',
  'delete',
  'product_viewed',
];

// Generate user IDs
const userIds = Array.from({ length: NUM_USERS }, () => `user_${randomUUID()}`);

console.log('🌱 Starting direct database seeding...');
console.log(`📊 Target: ${NUM_EVENTS} events`);
console.log(`👥 Users: ${NUM_USERS}`);
console.log(`📁 Database: ${DB_PATH}`);
console.log();

// Create database
const db = new duckdb.Database(DB_PATH);
const conn = db.connect();

// Create table
conn.run(`
  CREATE TABLE IF NOT EXISTS events (
    id VARCHAR PRIMARY KEY,
    distinct_id VARCHAR NOT NULL,
    event VARCHAR NOT NULL,
    properties JSON,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create indexes
conn.run(`CREATE INDEX IF NOT EXISTS idx_events_distinct_id ON events(distinct_id)`);
conn.run(`CREATE INDEX IF NOT EXISTS idx_events_event ON events(event)`);
conn.run(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)`);

// Generate events
const now = new Date();
const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

const events = [];
for (let i = 0; i < NUM_EVENTS; i++) {
  const userId = userIds[Math.floor(Math.random() * userIds.length)];
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  
  // Random timestamp within last 2 months
  const timestamp = new Date(
    twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime())
  );

  // Generate properties based on event type
  const properties: Record<string, any> = {
    $browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
    $os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)],
  };

  if (eventType === 'pageview') {
    properties.path = ['/', '/about', '/products', '/contact'][Math.floor(Math.random() * 4)];
  } else if (eventType === 'purchase') {
    properties.amount = Math.floor(Math.random() * 500) + 10;
    properties.currency = 'USD';
  } else if (eventType === 'product_viewed') {
    properties.product_id = `prod_${Math.floor(Math.random() * 100)}`;
  }

  events.push({
    id: randomUUID(),
    distinct_id: userId,
    event: eventType,
    properties: JSON.stringify(properties),
    timestamp: timestamp.toISOString(),
  });
}

// Sort by timestamp
events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

console.log('💾 Inserting events into database...');

// Insert in batches
const BATCH_SIZE = 1000;
for (let i = 0; i < events.length; i += BATCH_SIZE) {
  const batch = events.slice(i, i + BATCH_SIZE);
  const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = batch.flatMap(e => [e.id, e.distinct_id, e.event, e.properties, e.timestamp]);

  conn.run(
    `INSERT INTO events (id, distinct_id, event, properties, timestamp) VALUES ${placeholders}`,
    ...values
  );

  process.stdout.write(`\r✓ Inserted ${Math.min(i + BATCH_SIZE, events.length)}/${NUM_EVENTS} events`);
}

console.log('\n');

// Verify count
conn.all('SELECT COUNT(*) as count FROM events', (err, rows: any[]) => {
  if (err) {
    console.error('❌ Error verifying count:', err);
    process.exit(1);
  }

  const count = rows[0].count;
  console.log(`✅ Seeding complete!`);
  console.log(`📊 Total events: ${count}`);

  conn.close();
  db.close();
});
