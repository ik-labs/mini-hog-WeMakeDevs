# Minihog Docker Deployment Guide

Complete guide for deploying Minihog with Docker Compose.

## Quick Start

```bash
# 1. Clone and navigate to project
cd /path/to/minihog

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and add your Cerebras API key
nano .env

# 4. Build and start all services
docker-compose up --build -d

# 5. Access the application
# Web UI: http://localhost:3001
# API: http://localhost:3000/api
```

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Compose Stack           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │   Web    │  │   API    │  │  MCP  │ │
│  │ :3001    │→ │ :3000    │  │ stdio │ │
│  │ Next.js  │  │ NestJS   │  │       │ │
│  └──────────┘  └─────┬────┘  └───┬───┘ │
│                      │            │     │
│                  ┌───┴────────────┴──┐  │
│                  │   Data Volume     │  │
│                  │  ./data/          │  │
│                  │  - minihog.duckdb │  │
│                  │  - minihog.sqlite │  │
│                  └───────────────────┘  │
└─────────────────────────────────────────┘
```

## Services

### 1. API Service
- **Port**: 3000
- **Image**: minihog-api (multi-stage build)
- **Health Check**: `/api/health/healthz`
- **Depends On**: None
- **Purpose**: Backend API, event ingestion, analytics

### 2. Web Service
- **Port**: 3001
- **Image**: minihog-web (Next.js standalone)
- **Depends On**: API (health check)
- **Purpose**: Frontend dashboard, analytics UI

### 3. MCP Service
- **Port**: None (stdio transport)
- **Image**: minihog-mcp
- **Depends On**: None
- **Purpose**: Model Context Protocol server for Claude Desktop

## Environment Variables

### Required

```bash
# Cerebras AI API Key (REQUIRED for AI features)
CEREBRAS_API_KEY=csk-xxxxx

# API Authentication Key (optional, has default)
API_KEY=your-custom-api-key
```

### Optional (have defaults)

```bash
# Database paths
DUCKDB_PATH=./data/minihog.duckdb
SQLITE_PATH=./data/minihog.sqlite

# Node environment
NODE_ENV=production

# API Port
PORT=3000
```

## Build Process

### Multi-Stage Build Benefits
- **Smaller images**: Only production dependencies
- **Faster builds**: Cached layers
- **Security**: Non-root users

### Build Stages

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
# Install all dependencies

# Stage 2: Builder
FROM node:20-alpine AS builder
# Build TypeScript → JavaScript

# Stage 3: Runner
FROM node:20-alpine AS runner
# Copy built files, run as non-root
```

## Deployment Commands

### Development Mode

```bash
# Start with hot reload (not Dockerized)
npm run dev  # From root
```

### Production Mode

```bash
# Build images
docker-compose build

# Start detached
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f api

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Testing

### 1. Health Checks

```bash
# API health
curl http://localhost:3000/api/health/healthz

# Expected response:
# {"status":"ok","timestamp":"2024-..."}
```

### 2. Event Ingestion

```bash
# Send test event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "events": [{
      "event": "docker_test",
      "distinct_id": "docker_user",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {
        "source": "docker_deployment",
        "test": true
      }
    }]
  }'

# Expected: HTTP 200, {"success":true}
```

### 3. Analytics Queries

```bash
# Get active users
curl http://localhost:3000/api/analytics/active-users \
  -H "X-API-Key: your-api-key-here"

# Get top events
curl http://localhost:3000/api/analytics/top-events \
  -H "X-API-Key: your-api-key-here"

# Get trends
curl 'http://localhost:3000/api/analytics/trends?period=7d' \
  -H "X-API-Key: your-api-key-here"
```

### 4. Feature Flags

```bash
# List flags
curl http://localhost:3000/api/flags \
  -H "X-API-Key: your-api-key-here"

# Evaluate flag
curl 'http://localhost:3000/api/ff?key=example_flag&distinct_id=user123' \
  -H "X-API-Key: your-api-key-here"
```

### 5. AI Query (Cerebras)

```bash
# Natural language query
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "question": "What are the top 5 events by count?"
  }'
```

## Monitoring

### Container Status

```bash
# Check all containers
docker-compose ps

# Expected output:
# NAME              STATUS              PORTS
# minihog-api       Up (healthy)        0.0.0.0:3000->3000/tcp
# minihog-web       Up                  0.0.0.0:3001->3000/tcp
# minihog-mcp       Up                  -
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused images
docker system prune -a
```

### Logs

```bash
# All services
docker-compose logs --tail=100 -f

# Specific service
docker-compose logs --tail=50 api

# Since timestamp
docker-compose logs --since 10m api
```

## Data Persistence

### Volume Mounts

```yaml
volumes:
  - ./data:/data  # Host ./data → Container /data
```

### Backup Data

```bash
# Create backup
mkdir -p backups
cp -r data/ backups/data-$(date +%Y%m%d-%H%M%S)

# Restore backup
docker-compose down
rm -rf data/
cp -r backups/data-20240101-120000/ data/
docker-compose up -d
```

### Database Locations

- **DuckDB**: `./data/minihog.duckdb` (events)
- **SQLite**: `./data/minihog.sqlite` (flags, metadata)

## Networking

### Internal Communication

- Services communicate via `minihog-network` bridge
- Web → API: `http://api:3000/api`
- No external network access required (except Cerebras API)

### External Access

- **Web UI**: http://localhost:3001
- **API**: http://localhost:3000/api
- **MCP**: stdio (no network port)

### Port Conflicts

If ports 3000 or 3001 are in use:

```yaml
# Edit docker-compose.yml
services:
  api:
    ports:
      - "3002:3000"  # Change host port
  web:
    ports:
      - "3003:3000"  # Change host port
```

## Troubleshooting

### Services Won't Start

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check port availability:**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

3. **Check logs for errors:**
   ```bash
   docker-compose logs api
   ```

### API Health Check Fails

1. **Wait for startup:**
   ```bash
   # Health check starts after 40s
   docker-compose ps
   ```

2. **Check API logs:**
   ```bash
   docker-compose logs api | grep -i error
   ```

3. **Manually test health:**
   ```bash
   docker-compose exec api curl http://localhost:3000/api/health/healthz
   ```

### Build Fails

1. **Clear Docker cache:**
   ```bash
   docker-compose build --no-cache
   ```

2. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

3. **Rebuild shared package:**
   ```bash
   cd packages/shared
   npm run build
   ```

### MCP Server Issues

1. **Check environment variables:**
   ```bash
   docker-compose exec mcp env | grep -E 'CEREBRAS|API_KEY|DUCKDB|SQLITE'
   ```

2. **Test stdio mode:**
   ```bash
   docker-compose logs mcp | grep "MCP Server"
   ```

## Security Considerations

### API Key Security

- Never commit `.env` to git
- Use strong, random API keys in production
- Rotate keys regularly

### Container Security

- Runs as non-root user (`nestjs`, `nextjs`)
- No privileged mode
- Read-only filesystem (where possible)

### Network Security

- Internal bridge network isolates services
- Only necessary ports exposed
- No database ports exposed externally

## Performance Tuning

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 1G
```

### DuckDB Performance

```bash
# Increase DuckDB memory
docker-compose exec api sh
duckdb /data/minihog.duckdb
PRAGMA memory_limit='4GB';
```

## Production Checklist

- [ ] Set strong `API_KEY` in `.env`
- [ ] Add `CEREBRAS_API_KEY` in `.env`
- [ ] Configure reverse proxy (nginx/Caddy)
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Test disaster recovery
- [ ] Document runbook
- [ ] Load test API endpoints

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 3  # Run 3 API instances
```

### Load Balancing

Use nginx or Traefik in front of API instances.

## Conclusion

Your Minihog stack is now running in Docker with:
- ✅ Isolated, reproducible environment
- ✅ Data persistence
- ✅ Health monitoring
- ✅ Easy deployment and updates

For MCP integration with Claude Desktop, see `MCP_SETUP.md`.
