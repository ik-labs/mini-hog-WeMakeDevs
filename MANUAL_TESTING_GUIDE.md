# Minihog Manual Testing Guide

Complete step-by-step guide to manually test all features of Minihog.

**Estimated Time:** 30-45 minutes  
**Prerequisites:** Terminal, Browser, Cerebras API Key

---

## Table of Contents

1. [Prerequisites Check](#1-prerequisites-check)
2. [Environment Setup](#2-environment-setup)
3. [Backend API Testing](#3-backend-api-testing)
4. [Frontend Dashboard Testing](#4-frontend-dashboard-testing)
5. [MCP Server Testing (Optional)](#5-mcp-server-testing-optional)
6. [Docker Deployment Testing (Optional)](#6-docker-deployment-testing-optional)
7. [Complete Feature Checklist](#7-complete-feature-checklist)

---

## 1. Prerequisites Check

### Required Software

```bash
# Check Node.js (need 20+)
node --version
# Expected: v20.x.x or higher

# Check npm
npm --version
# Expected: 10.x.x or higher

# Check if ports are available
lsof -i :3000  # Should be empty (API port)
lsof -i :3001  # Should be empty (Web port)
```

### Get Cerebras API Key

1. Go to https://cloud.cerebras.ai
2. Sign up / Log in
3. Navigate to API Keys section
4. Create a new API key
5. **Copy the key** (starts with `csk-`)

**Promo Code (if needed):** Check `CEREBRAS_INSTRUCTIONS.txt` in the repo

---

## 2. Environment Setup

### Step 1: Navigate to Project

```bash
cd /Users/himeshp/apps/hackthons/minihog
```

### Step 2: Create Environment File

```bash
# Copy example
cp .env.example .env

# Edit the file
nano .env
```

### Step 3: Configure Environment Variables

Edit `.env` and add your keys:

```bash
# API Configuration
PORT=3000
NODE_ENV=development
API_KEY=test_api_key_12345

# Database Paths (these are fine as-is)
DUCKDB_PATH=./data/minihog.duckdb
SQLITE_PATH=./data/minihog.sqlite

# ⚠️ IMPORTANT: Add your Cerebras API key here
CEREBRAS_API_KEY=csk-your-actual-key-here

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_KEY=test_api_key_12345
```

**Save and exit** (Ctrl+X, then Y, then Enter)

### Step 4: Create Data Directory

```bash
mkdir -p data
```

### Step 5: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install dependencies for:
# - Root workspace
# - API (apps/api)
# - Web (apps/web)
# - SDK (packages/sdk)
# - Shared (packages/shared)
```

**Expected time:** 2-3 minutes

---

## 3. Backend API Testing

### Step 1: Build and Start API

```bash
# Open a new terminal window/tab
cd /Users/himeshp/apps/hackthons/minihog

# Build shared package first
cd packages/shared && npm run build && cd ../..

# Start API in development mode
cd apps/api
npm run dev
```

**Expected output:**
```
[Nest] INFO [NestApplication] Nest application successfully started +2ms
[Nest] INFO Listening on http://[::]:3000
```

**Keep this terminal open!**

### Step 2: Test Health Check

Open a **new terminal** and run:

```bash
curl http://localhost:3000/api/health/healthz
```

**Expected response:**
```json
{"status":"ok","timestamp":"2024-..."}
```

✅ **If you see this, the API is working!**

### Step 3: Test Event Ingestion

```bash
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev_minihog_api_key_12345678901234567890" \
  -d '{
    "events": [{
      "event": "manual_test",
      "distinct_id": "test_user_001",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {
        "test_type": "manual",
        "source": "testing_guide"
      }
    }]
  }'
```

**Expected response:**
```json
{"success":true}
```

✅ **Event ingested successfully!**

### Step 4: Ingest More Test Events

Let's create a variety of events:

```bash
# Signup event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "events": [{
      "event": "signup",
      "distinct_id": "user_alice",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {"plan": "pro"}
    }]
  }'

# Page view event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "events": [{
      "event": "pageview",
      "distinct_id": "user_bob",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {"page": "/dashboard"}
    }]
  }'

# Purchase event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "events": [{
      "event": "purchase",
      "distinct_id": "user_alice",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {"amount": 99.99, "product": "premium"}
    }]
  }'
```

✅ **3 more events ingested!**

### Step 5: Test Analytics Endpoints

#### Get Active Users
```bash
curl http://localhost:3000/api/analytics/active-users \
  -H "X-API-Key: test_api_key_12345"
```

**Expected:** JSON with `dau`, `wau`, `mau` counts

#### Get Top Events
```bash
curl http://localhost:3000/api/analytics/top-events \
  -H "X-API-Key: test_api_key_12345"
```

**Expected:** List of events with counts (should see `manual_test`, `signup`, `pageview`, `purchase`)

#### Get Trends
```bash
curl 'http://localhost:3000/api/analytics/trends?period=24h&interval=hour' \
  -H "X-API-Key: test_api_key_12345"
```

**Expected:** Time-series data with event counts

✅ **Analytics endpoints working!**

### Step 6: Test Feature Flags

#### Create a Feature Flag
```bash
curl -X POST http://localhost:3000/api/flags \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "key": "test_flag",
    "name": "Test Feature Flag",
    "description": "Testing feature flags",
    "active": true,
    "rollout_percentage": 50
  }'
```

**Expected:** Flag details with ID

#### List Flags
```bash
curl http://localhost:3000/api/flags \
  -H "X-API-Key: test_api_key_12345"
```

**Expected:** Array with your `test_flag`

#### Evaluate Flag
```bash
curl 'http://localhost:3000/api/ff?key=test_flag&distinct_id=user_alice' \
  -H "X-API-Key: test_api_key_12345"
```

**Expected:** `{"enabled": true/false, "variant": "treatment"/"control", "reason": "..."}`

✅ **Feature flags working!**

### Step 7: Test AI Query (Cerebras)

⚠️ **This requires valid Cerebras API key!**

```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "question": "What are the top 3 events by count?"
  }'
```

**Expected:** JSON with:
- `sql`: Generated SQL query
- `results`: Query results
- `insights`: AI analysis
- `chartSuggestion`: Chart type

**If this works, Cerebras integration is successful!** ✅

---

## 4. Frontend Dashboard Testing

### Step 1: Start Frontend

Open a **new terminal**:

```bash
cd /Users/himeshp/apps/hackthons/minihog/apps/web
npm run dev
```

**Expected output:**
```
▲ Next.js 15.x.x
- Local:   http://localhost:3001
```

### Step 2: Open Browser

Navigate to: **http://localhost:3001**

### Step 3: Test Dashboard Page

You should see:
- ✅ **Minihog** branding
- ✅ Sidebar with navigation (Dashboard, AI Query, Analytics, Flags, Settings)
- ✅ Dashboard cards showing metrics

**Check for data:**
- Active Users card should show counts
- Top Events should list events
- Recent activity should show events

### Step 4: Test AI Query Page

1. Click **"AI Query"** in sidebar
2. Enter a question: "What are the most popular events?"
3. Click **"Ask"**
4. Wait for Cerebras to generate response

**Expected:**
- ✅ Loading animation with sparkles
- ✅ SQL query displayed with syntax highlighting
- ✅ Results table
- ✅ AI-generated insights
- ✅ Chart visualization (if suggested)

**Try keyboard shortcut:** Cmd/Ctrl + Enter to submit

### Step 5: Test Query History

1. Ask another question: "How many users signed up?"
2. Check **"Recent Queries"** section appears
3. Click on a previous query to re-run it

✅ **Query history working!**

### Step 6: Test Analytics Explorer

1. Click **"Analytics"** in sidebar
2. Should see:
   - ✅ Events list in table
   - ✅ Time period selector (24h, 7d, 30d, 90d)
   - ✅ Filters for event name and user ID
   - ✅ Pagination controls
3. Click on an event's properties to see JSON modal
4. Try filtering by event name: "signup"
5. Try filtering by user: "user_alice"

✅ **Events explorer working!**

### Step 7: Test Feature Flags UI

1. Click **"Flags"** in sidebar
2. Should see the `test_flag` you created
3. Test **"Create Flag"** button:
   - Click "Create Flag"
   - Enter key: `new_ui_flag`
   - Enter name: "New UI Feature"
   - Click "Create"
4. Test **Active Toggle**:
   - Toggle the flag on/off
   - Should see toast notification
5. Test **Rollout Slider**:
   - Drag slider to 75%
   - Should see update notification
6. Test **Test Evaluation**:
   - Enter flag key: `test_flag`
   - Enter user ID: `user_alice`
   - Click "Test Evaluation"
   - Should see enabled/disabled result

✅ **Flags management working!**

### Step 8: Test Settings Page

1. Click **"Settings"** in sidebar
2. Should see Cerebras API key section
3. Current key should be masked: `csk-****...`
4. Try updating:
   - Enter a new key (or same key)
   - Click "Save"
   - Should see success notification

✅ **Settings page working!**

---

## 5. MCP Server Testing (Optional)

### Prerequisites

- Claude Desktop installed
- MCP server configured

### Step 1: Install Claude Desktop

**Download from:** https://claude.ai/download

### Step 2: Configure MCP Server

Follow the detailed guide in `MCP_SETUP.md`:

```bash
# macOS
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Then edit paths and keys
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Step 3: Build MCP Server

```bash
cd /Users/himeshp/apps/hackthons/minihog/apps/api
npm run build
```

### Step 4: Test MCP Server Locally

```bash
node dist/mcp-server.js
```

Should show: "MCP Server started with stdio transport"

### Step 5: Test in Claude Desktop

Restart Claude Desktop, then try:

**Test Prompts:**

1. "Use get_active_users to show me the active user counts"
2. "Use get_top_events to show me the 5 most popular events"
3. "Use evaluate_flag to check if test_flag is enabled for user_alice"
4. "Use ask_question to find out: What events did user_alice trigger?"

✅ **If Claude responds with tool results, MCP is working!**

---

## 6. Docker Deployment Testing (Optional)

### Prerequisites

- Docker Desktop installed and running

### Step 1: Stop Local Services

```bash
# Stop API (Ctrl+C in API terminal)
# Stop Web (Ctrl+C in Web terminal)
```

### Step 2: Build Docker Images

```bash
cd /Users/himeshp/apps/hackthons/minihog

# Build all services
docker-compose build
```

**This will take 5-10 minutes on first build**

### Step 3: Start Services

```bash
docker-compose up -d
```

### Step 4: Check Status

```bash
docker-compose ps
```

**Expected:**
```
NAME              STATUS
minihog-api       Up (healthy)
minihog-web       Up
minihog-mcp       Up
```

### Step 5: Test Dockerized API

```bash
# Health check
curl http://localhost:3000/api/health/healthz

# Ingest event
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "events": [{
      "event": "docker_test",
      "distinct_id": "docker_user",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }]
  }'
```

### Step 6: Test Dockerized Web

Open browser: **http://localhost:3001**

Should work exactly like local version!

### Step 7: View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs api
```

### Step 8: Stop Services

```bash
docker-compose down
```

✅ **Docker deployment working!**

---

## 7. Complete Feature Checklist

Use this checklist to verify all features:

### ✅ Backend API
- [ ] Health check responds
- [ ] Event ingestion works
- [ ] Analytics endpoints return data
- [ ] Feature flags CRUD works
- [ ] AI query with Cerebras works

### ✅ Frontend Dashboard
- [ ] Dashboard loads and shows metrics
- [ ] AI Query page works
- [ ] Query history saves and loads
- [ ] Keyboard shortcuts work (Cmd+Enter)
- [ ] Analytics Explorer shows events
- [ ] Event filters work
- [ ] Pagination works
- [ ] Feature Flags UI works
- [ ] Create/Update/Delete flags works
- [ ] Flag evaluation works
- [ ] Settings page loads

### ✅ SDK Integration
- [ ] Events tracked from web UI
- [ ] Flag evaluation from SDK

### ✅ MCP Server (Optional)
- [ ] MCP server starts
- [ ] Claude Desktop connects
- [ ] All 7 tools respond correctly

### ✅ Docker Deployment (Optional)
- [ ] Images build successfully
- [ ] All services start
- [ ] Health checks pass
- [ ] API works in containers
- [ ] Web UI works in containers
- [ ] Data persists in volumes

---

## Troubleshooting

### API Won't Start

```bash
# Check if port is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Cerebras API Errors

Check your API key:
```bash
echo $CEREBRAS_API_KEY
```

Test it:
```bash
curl https://api.cerebras.ai/v1/chat/completions \
  -H "Authorization: Bearer $CEREBRAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1-70b","messages":[{"role":"user","content":"test"}]}'
```

### Frontend Won't Connect to API

Check `NEXT_PUBLIC_API_URL` in `.env`:
```bash
cat .env | grep NEXT_PUBLIC_API_URL
```

Should be: `http://localhost:3000/api`

### Docker Issues

```bash
# Check Docker is running
docker info

# Rebuild without cache
docker-compose build --no-cache

# View detailed logs
docker-compose logs --tail=100 api
```

---

## Success Criteria

✅ **You've successfully tested Minihog if:**

1. API responds to health checks
2. Events can be ingested
3. Analytics endpoints return data
4. AI queries work with Cerebras
5. Feature flags can be created and evaluated
6. Frontend dashboard loads and displays data
7. All 5 pages work (Dashboard, AI Query, Analytics, Flags, Settings)

**Optional bonus:**
- MCP server works with Claude Desktop
- Docker deployment succeeds

---

## Next Steps After Testing

1. **Record Demo Video**
   - Screen record while using features
   - Show AI query in action
   - Demonstrate MCP tools in Claude Desktop

2. **Create Documentation**
   - Add screenshots to README
   - Document any issues found
   - Update installation guide

3. **Prepare for Submission**
   - Ensure all code is committed
   - Clean up temporary files
   - Test fresh clone works

---

**Testing Complete!** 🎉

If you've checked all the boxes above, Minihog is working perfectly!
