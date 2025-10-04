/**
 * Seed Data Generator for Minihog Analytics
 * 
 * Generates 10k realistic synthetic events over the past 2 months
 * 
 * Usage:
 *   npm install -g ts-node
 *   API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252 ts-node scripts/seed-data.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'mh_live_bf947c81aa941e864d35a23fd3fe9252';
const TOTAL_EVENTS = 10000;
const BATCH_SIZE = 100;

// Event types with realistic distribution
const EVENT_TYPES = [
  { name: 'pageview', weight: 40 },
  { name: 'click', weight: 20 },
  { name: 'signup', weight: 5 },
  { name: 'login', weight: 10 },
  { name: 'logout', weight: 8 },
  { name: 'product_viewed', weight: 12 },
  { name: 'add_to_cart', weight: 8 },
  { name: 'checkout_started', weight: 4 },
  { name: 'purchase', weight: 2 },
  { name: 'share', weight: 3 },
  { name: 'search', weight: 10 },
  { name: 'video_play', weight: 5 },
  { name: 'video_complete', weight: 2 },
  { name: 'comment_posted', weight: 3 },
  { name: 'file_download', weight: 4 },
];

// Pages for pageview events
const PAGES = [
  '/',
  '/pricing',
  '/features',
  '/docs',
  '/blog',
  '/about',
  '/contact',
  '/dashboard',
  '/settings',
  '/profile',
  '/products',
  '/products/analytics',
  '/products/flags',
  '/products/ai',
  '/blog/getting-started',
  '/blog/best-practices',
  '/docs/quickstart',
  '/docs/api-reference',
];

// Product names for e-commerce events
const PRODUCTS = [
  'Premium Plan',
  'Starter Plan',
  'Enterprise Plan',
  'Analytics Add-on',
  'AI Query Pack',
  'Custom Reports',
  'Data Export',
  'Team Seats',
];

// Devices and browsers
const DEVICES = ['desktop', 'mobile', 'tablet'];
const BROWSERS = ['chrome', 'safari', 'firefox', 'edge'];
const OS = ['macos', 'windows', 'linux', 'ios', 'android'];

// Cities for location data
const CITIES = [
  'New York', 'San Francisco', 'London', 'Tokyo', 'Berlin',
  'Paris', 'Toronto', 'Sydney', 'Singapore', 'Mumbai',
  'Austin', 'Seattle', 'Boston', 'Amsterdam', 'Barcelona',
];

// Generate user IDs (500 unique users)
const TOTAL_USERS = 500;
const userIds = Array.from({ length: TOTAL_USERS }, (_, i) => `user_${1000 + i}`);

// Helper: Random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Weighted random selection
function weightedRandom<T extends { name: string; weight: number }>(items: T[]): string {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.name;
    }
  }
  
  return items[0].name;
}

// Helper: Random timestamp in the past 2 months
function randomTimestamp(): string {
  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const randomTime = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Helper: Generate properties based on event type
function generateProperties(eventType: string): Record<string, any> {
  const baseProps = {
    device: randomElement(DEVICES),
    browser: randomElement(BROWSERS),
    os: randomElement(OS),
    city: randomElement(CITIES),
    referrer: Math.random() > 0.7 ? randomElement([
      'google',
      'facebook',
      'twitter',
      'linkedin',
      'direct',
      'email',
    ]) : 'direct',
  };

  switch (eventType) {
    case 'pageview':
      return {
        ...baseProps,
        page: randomElement(PAGES),
        title: `Page Title - ${randomElement(PAGES)}`,
        duration_ms: Math.floor(Math.random() * 120000), // 0-2 minutes
      };

    case 'click':
      return {
        ...baseProps,
        element: randomElement(['button', 'link', 'image', 'card']),
        text: randomElement(['Learn More', 'Sign Up', 'Get Started', 'View Details', 'Download']),
        page: randomElement(PAGES),
      };

    case 'signup':
    case 'login':
      return {
        ...baseProps,
        method: randomElement(['email', 'google', 'github']),
      };

    case 'product_viewed':
    case 'add_to_cart':
      return {
        ...baseProps,
        product: randomElement(PRODUCTS),
        price: Math.floor(Math.random() * 500) + 10,
        currency: 'USD',
      };

    case 'purchase':
      return {
        ...baseProps,
        product: randomElement(PRODUCTS),
        price: Math.floor(Math.random() * 500) + 10,
        currency: 'USD',
        payment_method: randomElement(['credit_card', 'paypal', 'stripe']),
      };

    case 'search':
      return {
        ...baseProps,
        query: randomElement([
          'analytics',
          'pricing',
          'api documentation',
          'features',
          'how to get started',
          'integrations',
        ]),
        results_count: Math.floor(Math.random() * 50),
      };

    case 'video_play':
    case 'video_complete':
      return {
        ...baseProps,
        video_id: `video_${Math.floor(Math.random() * 100)}`,
        video_title: randomElement([
          'Product Demo',
          'Getting Started Tutorial',
          'Advanced Features',
          'Customer Success Story',
        ]),
        duration_seconds: Math.floor(Math.random() * 600),
      };

    case 'share':
      return {
        ...baseProps,
        platform: randomElement(['twitter', 'facebook', 'linkedin', 'email']),
        content_type: randomElement(['blog_post', 'product', 'feature']),
      };

    default:
      return baseProps;
  }
}

// Generate a single event
function generateEvent(): any {
  const eventType = weightedRandom(EVENT_TYPES);
  const userId = randomElement(userIds);
  
  return {
    event: eventType,
    distinct_id: userId,
    timestamp: randomTimestamp(),
    properties: generateProperties(eventType),
    session_id: `session_${Math.floor(Math.random() * 10000)}`,
  };
}

// Send events in batches
async function sendBatch(events: any[]): Promise<void> {
  const response = await fetch(`${API_URL}/ingest/e`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send batch: ${response.status} ${error}`);
  }

  await response.json();
}

// Main seeding function
async function seedData() {
  console.log('🌱 Starting data seeding...');
  console.log(`📊 Target: ${TOTAL_EVENTS} events`);
  console.log(`👥 Users: ${TOTAL_USERS}`);
  console.log(`📅 Time range: Past 2 months`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  console.log('');

  const startTime = Date.now();
  let totalSent = 0;
  let batchCount = 0;

  try {
    while (totalSent < TOTAL_EVENTS) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_EVENTS - totalSent);
      const events = Array.from({ length: batchSize }, () => generateEvent());

      await sendBatch(events);
      
      totalSent += batchSize;
      batchCount++;

      const progress = ((totalSent / TOTAL_EVENTS) * 100).toFixed(1);
      process.stdout.write(`\r✅ Progress: ${totalSent}/${TOTAL_EVENTS} (${progress}%) - ${batchCount} batches`);

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n');
    console.log('🎉 Seeding completed successfully!');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📈 Events/second: ${(TOTAL_EVENTS / parseFloat(duration)).toFixed(0)}`);
    console.log('');
    console.log('🔍 Check your dashboard at: http://localhost:3001');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeder
seedData().catch(console.error);
