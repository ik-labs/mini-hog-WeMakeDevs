# Development Guide

Complete guide for setting up, developing, and testing Minihog locally.

## Table of Contents

- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## Setup

### Prerequisites

- **Node.js** 20+ and npm 10+
- **Git**
- **Cerebras API Key** ([get one](https://cloud.cerebras.ai))

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/minihog.git
cd minihog

# Install dependencies
npm install

# Build shared packages
npm run build
```

### Environment Configuration

#### 1. API (.env)

```bash
cd apps/api
cp .env.example .env
nano .env
```

```bash
# Required
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/analytics.duckdb

# Optional (for AI features)
CEREBRAS_API_KEY=your_key_here
CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions

# Optional
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
```

#### 2. Web (.env.local)

```bash
cd apps/web
cp .env.example .env.local
nano .env.local
```

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_KEY=<your_api_key>
```

**Get API Key:**
```bash
# Start API first, then:
cd apps/api
sqlite3 data/metadata.db "SELECT key FROM api_keys WHERE active=1;"
```

### First Run

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web UI
cd apps/web
npm run dev
```

Visit:
- API: http://localhost:3000/api/health/healthz
- Web: http://localhost:3001

---

## Development

### Project Structure

```
minihog/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── ingest/   # Event ingestion
│   │   │   ├── insights/ # Analytics queries
│   │   │   ├── ai/       # AI-powered queries
│   │   │   ├── flags/    # Feature flags
│   │   │   └── common/   # Database, config
│   │   └── data/         # DuckDB + SQLite files
│   │
│   ├── web/              # Next.js frontend
│   │   └── app/          # App router pages
│   │
│   └── mcp-server/       # MCP integration
│
├── packages/
│   ├── shared/           # Shared types & schemas
│   └── sdk/              # Browser SDK
│
├── scripts/              # Utility scripts
│   └── seed-data.ts      # Database seeding
│
└── docs/                 # Documentation
```

### Common Commands

```bash
# Development
npm run dev              # Start all apps
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run format           # Format with Prettier
npm run clean            # Remove build artifacts

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode

# Database
npm run seed             # Seed test data (10K events)
```

### Working with Databases

#### DuckDB (Analytics)

```bash
# Query from command line
duckdb apps/api/data/analytics.duckdb

# Example queries
SELECT COUNT(*) FROM events;
SELECT event, COUNT(*) as count FROM events GROUP BY event ORDER BY count DESC LIMIT 10;
SELECT DATE_TRUNC('day', timestamp) as day, COUNT(*) FROM events GROUP BY day ORDER BY day;
```

#### SQLite (Metadata)

```bash
# Query from command line
sqlite3 apps/api/data/metadata.db

# Example queries
SELECT * FROM api_keys;
SELECT * FROM feature_flags;
```

### Adding New Features

#### 1. Backend Endpoint

```typescript
// apps/api/src/insights/insights.controller.ts
@Get('my-feature')
async getMyFeature(@Query() dto: MyFeatureDto) {
  return this.insightsService.getMyFeature(dto);
}
```

#### 2. Shared Types

```typescript
// packages/shared/src/schemas/my-feature.schema.ts
export const MyFeatureRequestSchema = z.object({
  // ...
});

export type MyFeatureRequest = z.infer<typeof MyFeatureRequestSchema>;
```

#### 3. Frontend Component

```typescript
// apps/web/app/my-feature/page.tsx
'use client';

export default function MyFeaturePage() {
  // Use API client
  const { data } = useQuery({
    queryKey: ['my-feature'],
    queryFn: () => apiClient.get('/insights/my-feature'),
  });

  return <div>{/* ... */}</div>;
}
```

---

## Testing

### Manual Testing

#### 1. Event Ingestion

```bash
# Single event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "distinct_id": "user123",
      "event": "pageview",
      "properties": {"page": "/home"}
    }]
  }'
```

#### 2. Analytics Queries

```bash
# Overview
curl http://localhost:3000/api/insights/overview \
  -H "X-API-Key: your_key"

# Top events
curl http://localhost:3000/api/insights/top-events \
  -H "X-API-Key: your_key"

# Active users
curl "http://localhost:3000/api/insights/active-users?period=7d" \
  -H "X-API-Key: your_key"
```

#### 3. AI Queries

```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me total events by day for the last 7 days"
  }'
```

#### 4. Feature Flags

```bash
# List flags
curl http://localhost:3000/api/flags \
  -H "X-API-Key: your_key"

# Create flag
curl -X POST http://localhost:3000/api/flags \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new_feature",
    "name": "New Feature",
    "active": true,
    "rolloutPercentage": 50
  }'
```

### Seed Test Data

```bash
# Generate 10,000 events (500 users, 2 months)
npm run seed

# Or manually:
cd scripts
npx tsx seed-data.ts
```

**What it creates:**
- 10,000 events
- 500 unique users
- 15 event types (pageview, click, signup, etc.)
- 2 months of historical data
- Realistic properties (browser, OS, etc.)

### Automated Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Performance Testing

```bash
# Load test ingestion
ab -n 1000 -c 10 \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -p event.json \
  http://localhost:3000/api/ingest/e
```

### Browser Testing

Install the SDK:
```html
<script src="http://localhost:3000/sdk/minihog.js"></script>
<script>
  const minihog = new MiniHog({
    apiUrl: 'http://localhost:3000/api',
    apiKey: 'your_key'
  });

  minihog.track('page_viewed', { page: window.location.pathname });
</script>
```

---

## Architecture

### Data Flow

```
Browser SDK → API Ingestion → DuckDB → Insights API → Frontend
                    ↓
              SQLite (metadata)
```

### Key Technologies

**Backend:**
- NestJS + Fastify (performance)
- DuckDB (OLAP analytics)
- SQLite (OLTP metadata)
- Drizzle ORM
- Pino (logging)

**Frontend:**
- Next.js 15 (App Router)
- React Query (data fetching)
- shadcn/ui + Tailwind (UI)
- Recharts (visualization)

**AI:**
- Cerebras API (inference)
- Llama 3.1/3.3 (models)
- Zod (schema validation)

### Database Schema

**DuckDB (events):**
```sql
CREATE TABLE events (
  id VARCHAR PRIMARY KEY,
  distinct_id VARCHAR NOT NULL,
  event VARCHAR NOT NULL,
  properties JSON,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_distinct_id ON events(distinct_id);
CREATE INDEX idx_events_event ON events(event);
CREATE INDEX idx_events_timestamp ON events(timestamp);
```

**SQLite (api_keys):**
```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);
```

### API Endpoints

**Ingestion:**
- `POST /api/ingest/e` - Batch events
- `POST /api/ingest/id` - Identify user
- `POST /api/ingest/stats` - Track stats

**Insights:**
- `GET /api/insights/overview` - Dashboard overview
- `GET /api/insights/top-events` - Top events
- `GET /api/insights/active-users` - DAU/WAU/MAU
- `GET /api/insights/trends` - Event trends
- `GET /api/insights/events` - Event list
- `POST /api/insights/funnel` - Funnel analysis
- `POST /api/insights/retention` - Retention cohorts

**AI:**
- `POST /api/ai/query` - Natural language query
- `POST /api/ai/generate-sql` - Generate SQL from text

**Feature Flags:**
- `GET /api/flags` - List flags
- `POST /api/flags` - Create flag
- `PATCH /api/flags/:key` - Update flag
- `DELETE /api/flags/:key` - Delete flag
- `GET /api/ff` - Evaluate flags for user

**Auth:**
- `POST /api/auth/keys` - Create API key
- `GET /api/auth/keys` - List API keys
- `DELETE /api/auth/keys/:id` - Revoke API key

---

## Contributing

### Code Style

```bash
# Format before committing
npm run format

# Lint
npm run lint
```

### Commit Messages

Follow conventional commits:
```
feat: add retention analysis
fix: correct date parsing in trends
docs: update deployment guide
chore: update dependencies
```

### Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Tips

1. **Use TypeScript strict mode** - Catch errors early
2. **Add tests** - Especially for analytics logic
3. **Document complex queries** - SQL can be hard to read
4. **Profile performance** - DuckDB is fast but can be optimized
5. **Check bundle size** - Frontend should stay lean

---

## Troubleshooting

### "Cannot find module"

```bash
# Rebuild shared packages
npm run build

# Or clean and reinstall
npm run clean
rm -rf node_modules
npm install
```

### DuckDB connection errors

```bash
# Check file permissions
ls -la apps/api/data/

# Recreate database
rm apps/api/data/analytics.duckdb
# Restart API (will recreate)
```

### Frontend not connecting to API

1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify API is running: `curl http://localhost:3000/api/health/healthz`
3. Check browser console for CORS errors
4. Verify API key is correct

### Hot reload not working

```bash
# Kill all node processes
killall node

# Restart
npm run dev
```

---

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [DuckDB Docs](https://duckdb.org/docs/)
- [Cerebras API Docs](https://inference-docs.cerebras.ai/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## Questions?

Open an issue on GitHub or check existing documentation.
