import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SqliteService } from './sqlite.service';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

describe('SqliteService', () => {
  let service: SqliteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test', '.env'],
        }),
      ],
      providers: [SqliteService],
    }).compile();

    service = module.get<SqliteService>(SqliteService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform health check', () => {
    const result = service.healthCheck();
    expect(result).toBe(true);
  });

  it('should get Drizzle ORM instance', () => {
    const db = service.getDb();
    expect(db).toBeDefined();
  });

  it('should insert and query feature flags', async () => {
    const db = service.getDb();

    // Insert a test feature flag
    await db.insert(schema.featureFlags).values({
      key: 'test_flag',
      name: 'Test Flag',
      description: 'A test feature flag',
      active: true,
      rolloutPercentage: 50,
    });

    // Query the feature flag
    const flags = await db
      .select()
      .from(schema.featureFlags)
      .where(eq(schema.featureFlags.key, 'test_flag'));

    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].key).toBe('test_flag');
    expect(flags[0].rolloutPercentage).toBe(50);
  });

  it('should insert and query flag decisions', async () => {
    const db = service.getDb();

    // Insert a test flag decision
    await db.insert(schema.flagDecisions).values({
      distinctId: 'user_123',
      flagKey: 'test_flag',
      variant: 'enabled',
      hashValue: 0.75,
    });

    // Query the flag decision
    const decisions = await db
      .select()
      .from(schema.flagDecisions)
      .where(eq(schema.flagDecisions.distinctId, 'user_123'));

    expect(decisions.length).toBeGreaterThan(0);
    expect(decisions[0].flagKey).toBe('test_flag');
    expect(decisions[0].variant).toBe('enabled');
  });

  it('should insert and query API keys', async () => {
    const db = service.getDb();

    // Insert a test API key
    const testKey = 'test_key_' + Date.now();
    await db.insert(schema.apiKeys).values({
      key: testKey,
      name: 'Test API Key',
      description: 'For testing purposes',
      active: true,
    });

    // Query the API key
    const keys = await db
      .select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.key, testKey));

    expect(keys.length).toBeGreaterThan(0);
    expect(keys[0].name).toBe('Test API Key');
    expect(keys[0].active).toBe(true);
  });
});
