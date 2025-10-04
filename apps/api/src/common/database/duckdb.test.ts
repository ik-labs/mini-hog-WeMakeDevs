import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DuckDbService } from './duckdb.service';

describe('DuckDbService', () => {
  let service: DuckDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test', '.env'],
        }),
      ],
      providers: [DuckDbService],
    }).compile();

    service = module.get<DuckDbService>(DuckDbService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should perform health check', async () => {
    const result = await service.healthCheck();
    expect(result).toBe(true);
  });

  it('should insert and query events', async () => {
    // Insert a test event
    await service.insertEvent({
      timestamp: new Date(),
      event: 'test_event',
      distinct_id: 'user_123',
      anonymous_id: 'anon_456',
      properties: { test: 'value' },
      context: { url: 'https://test.com' },
    });

    // Query events
    const events = await service.query('SELECT * FROM events WHERE event = ?', [
      'test_event',
    ]);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].event).toBe('test_event');
    expect(events[0].distinct_id).toBe('user_123');
  });

  it('should insert multiple events in batch', async () => {
    const testEvents = [
      {
        timestamp: new Date(),
        event: 'pageview',
        distinct_id: 'user_1',
        properties: { page: '/home' },
      },
      {
        timestamp: new Date(),
        event: 'pageview',
        distinct_id: 'user_2',
        properties: { page: '/about' },
      },
    ];

    await service.insertEventsBatch(testEvents);

    const events = await service.query('SELECT * FROM events WHERE event = ?', [
      'pageview',
    ]);

    expect(events.length).toBeGreaterThanOrEqual(2);
  });
});
