# Deployment Guide

Complete guide for deploying Minihog to production.

## Table of Contents

- [Quick Deployment (5 min)](#quick-deployment)
- [Digital Ocean App Platform](#digital-ocean-app-platform)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Verification](#verification)

---

## Quick Deployment

**Fastest way to deploy:** Digital Ocean App Platform with Docker

### Prerequisites

- Digital Ocean account
- GitHub repository
- Cerebras API key ([get one here](https://cloud.cerebras.ai))

### Steps

1. **Fork/Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create App on Digital Ocean**
   - Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App" → Choose "GitHub"
   - Select your repository
   - Choose branch: `main`

3. **Configure Build**
   - **Resource Type:** Web Service
   - **Build Strategy:** Dockerfile
   - **Dockerfile Path:** `Dockerfile`
   - **HTTP Port:** 8080

4. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=8080
   DATABASE_PATH=./data/analytics.duckdb
   API_KEY=mh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CORS_ORIGIN=*
   LOG_LEVEL=info
   CEREBRAS_API_KEY=<your_cerebras_key>
   CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions
   ```

5. **Deploy!**
   - Click "Create Resources"
   - Wait 3-5 minutes for build
   - Get your URL: `https://your-app.ondigitalocean.app`

6. **Seed Database**
   ```bash
   # From your local machine:
   cd /path/to/minihog
   API_URL=https://your-app.ondigitalocean.app npx tsx scripts/seed-data.ts
   ```

7. **Verify**
   ```bash
   curl https://your-app.ondigitalocean.app/api/health/healthz
   ```

**Done!** Your API is live with seeded data.

---

## Digital Ocean App Platform

### Why App Platform?

- ✅ Auto-SSL certificates
- ✅ Auto-deploy on git push
- ✅ Managed infrastructure
- ✅ Built-in monitoring
- ✅ Easy rollbacks

### Manual Setup

#### 1. Create App

```bash
# Using doctl CLI (optional)
doctl apps create --spec .do/app.yaml
```

Or via web console:
1. Go to Apps → Create App
2. Connect GitHub repository
3. Select `main` branch

#### 2. Configure Service

**General:**
- Name: `minihog-api`
- Region: Choose closest to users
- Instance Size: Basic (1 GB RAM)

**Build:**
- Build Command: (leave empty, Docker handles it)
- Run Command: (leave empty, Dockerfile CMD used)

**Environment:**
See [Environment Variables](#environment-variables) section

#### 3. Deploy

- Click "Create Resources"
- Monitor build logs
- First deploy takes ~5 minutes

### Troubleshooting

**Build fails with "Cannot find module"**
- Make sure `Dockerfile` is in repository root
- Verify all `COPY` commands in Dockerfile point to correct paths

**API key authentication fails**
- If using persistent storage, API key might be cached
- SSH into container and manually insert key:
  ```bash
  sqlite3 /app/data/metadata.db "INSERT INTO api_keys (key, name, active) VALUES ('your_key', 'Production', 1);"
  ```

**Health checks failing**
- Verify PORT environment variable is set to 8080
- Check app logs for startup errors
- Ensure database path is writable

---

## Docker Deployment

### Using Docker Compose (Local/Self-Hosted)

#### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DATABASE_PATH=./data/analytics.duckdb
      - API_KEY=mh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      - CEREBRAS_API_KEY=your_cerebras_key
      - CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions
      - CORS_ORIGIN=*
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

#### 2. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t minihog-api .

# Run container
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_PATH=./data/analytics.duckdb \
  -e API_KEY=mh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  -e CEREBRAS_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  --name minihog-api \
  minihog-api
```

### Dockerfile Overview

The included Dockerfile:
- ✅ Multi-stage build (smaller final image)
- ✅ Uses node:20-slim (glibc for DuckDB)
- ✅ Installs only production dependencies
- ✅ Creates writable data directory
- ✅ Runs as non-root user (production)

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | HTTP port | `8080` |
| `DATABASE_PATH` | DuckDB location | `./data/analytics.duckdb` |
| `API_KEY` | Authentication key (32+ chars) | `mh_live_xxxxx...` |

### Optional (AI Features)

| Variable | Description | Default |
|----------|-------------|---------|
| `CEREBRAS_API_KEY` | Cerebras API key | `undefined` |
| `CEREBRAS_API_URL` | Cerebras endpoint | `https://api.cerebras.ai/v1/chat/completions` |

### Optional (General)

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |

### Generating API Key

```bash
# Generate secure random 32-character API key
openssl rand -hex 16 | awk '{print "mh_live_" $1}'

# Or using Node.js
node -e "console.log('mh_live_' + require('crypto').randomBytes(16).toString('hex'))"
```

---

## Verification

### 1. Health Check

```bash
curl https://your-api-url/api/health/healthz
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "service": "minihog-api"
}
```

### 2. Test Authentication

```bash
curl -X POST https://your-api-url/api/ingest/e \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "distinct_id": "test_user",
      "event": "test_event",
      "properties": {"source": "verification"}
    }]
  }'
```

### 3. Check Analytics

```bash
curl https://your-api-url/api/insights/top-events \
  -H "X-API-Key: your_api_key"
```

### 4. Monitor Logs

**Digital Ocean:**
- Go to your app → Runtime Logs tab

**Docker:**
```bash
docker logs -f minihog-api
```

---

## Production Checklist

Before going live:

- [ ] Set strong API key (32+ random characters)
- [ ] Configure proper CORS_ORIGIN (not `*`)
- [ ] Enable HTTPS (automatic on App Platform)
- [ ] Set up monitoring/alerts
- [ ] Configure database backups
- [ ] Test all endpoints
- [ ] Seed initial data
- [ ] Document API URL for team
- [ ] Set LOG_LEVEL to `warn` or `error`

---

## Updating Deployment

### Digital Ocean

**Auto-deploy (recommended):**
- Push to GitHub main branch
- App Platform rebuilds automatically

**Manual deploy:**
- Go to your app → Settings → Force Rebuild

### Docker

```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```

---

## Backup & Recovery

### Backup Database

```bash
# Copy from container
docker cp minihog-api:/app/data/analytics.duckdb ./backup/

# Or via SSH (Digital Ocean)
# Download data directory from container
```

### Restore Database

```bash
# Copy to container
docker cp ./backup/analytics.duckdb minihog-api:/app/data/

# Restart container
docker-compose restart api
```

---

## Cost Estimates

### Digital Ocean App Platform

- **Basic (512 MB RAM):** $5/month
- **Professional (1 GB RAM):** $12/month
- **Bandwidth:** 150-500 GB included

### Self-Hosted (Docker)

- **VPS:** $5-20/month (Hetzner, Linode, etc.)
- **Domain:** $10-15/year
- **SSL:** Free (Let's Encrypt)

---

## Support

Issues? Check:
- [GitHub Issues](https://github.com/your-repo/issues)
- Deployment logs
- [Digital Ocean Community](https://www.digitalocean.com/community)
