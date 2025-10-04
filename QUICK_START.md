# Minihog Quick Start Guide

**Get Minihog running in 10 minutes!** ⚡

---

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ Cerebras API key (get from https://cloud.cerebras.ai)
- ✅ Ports 3000 and 3001 available

---

## Setup (5 minutes)

### 1. Clone & Navigate
```bash
cd /Users/himeshp/apps/hackthons/minihog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env
nano .env
```

**Add your Cerebras API key:**
```bash
CEREBRAS_API_KEY=csk-your-key-here
API_KEY=test_api_key_12345
```

Save and exit (Ctrl+X, Y, Enter)

### 4. Create Data Directory
```bash
mkdir -p data
```

### 5. Build Shared Package
```bash
cd packages/shared && npm run build && cd ../..
```

---

## Start Backend API (Terminal 1)

```bash
cd apps/api
npm run dev
```

**Wait for:** `Listening on http://[::]:3000` ✅

---

## Test Backend (Terminal 2)

### Health Check
```bash
curl http://localhost:3000/api/health/healthz
```
**Expected:** `{"status":"ok",...}`

### Ingest Test Event
```bash
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{
    "events": [{
      "event": "test_event",
      "distinct_id": "test_user",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }]
  }'
```
**Expected:** `{"success":true}`

### Test Analytics
```bash
curl http://localhost:3000/api/analytics/active-users \
  -H "X-API-Key: test_api_key_12345"
```
**Expected:** `{"dau":...,"wau":...,"mau":...}`

### Test AI Query (Cerebras)
```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{"question": "What are the top events?"}'
```
**Expected:** SQL query + results + insights

✅ **Backend working!**

---

## Start Frontend (Terminal 3)

```bash
cd apps/web
npm run dev
```

**Wait for:** `Local: http://localhost:3001` ✅

---

## Test Frontend

Open browser: **http://localhost:3001**

### ✅ Dashboard Page
- Should see metrics and charts

### ✅ AI Query Page
1. Click "AI Query" in sidebar
2. Type: "What are the most popular events?"
3. Click "Ask" or press Cmd+Enter
4. Should see SQL + results + chart

### ✅ Analytics Page
1. Click "Analytics"
2. Should see events table
3. Try filtering by event name

### ✅ Feature Flags Page
1. Click "Flags"
2. Click "Create Flag"
3. Create a test flag
4. Toggle it on/off
5. Try the rollout slider

### ✅ Settings Page
1. Click "Settings"
2. Should see Cerebras API key (masked)

---

## Quick Test Commands (All-in-One)

```bash
# Terminal 1: Start API
cd /Users/himeshp/apps/hackthons/minihog/apps/api && npm run dev

# Terminal 2: Start Web
cd /Users/himeshp/apps/hackthons/minihog/apps/web && npm run dev

# Terminal 3: Run tests
cd /Users/himeshp/apps/hackthons/minihog

# Health check
curl http://localhost:3000/api/health/healthz

# Ingest events
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/ingest/e \
    -H "Content-Type: application/json" \
    -H "X-API-Key: test_api_key_12345" \
    -d '{
      "events": [{
        "event": "test_'$i'",
        "distinct_id": "user_'$i'",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
      }]
    }' && echo " - Event $i sent"
done

# Check analytics
curl http://localhost:3000/api/analytics/top-events \
  -H "X-API-Key: test_api_key_12345" | jq

# Test AI
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key_12345" \
  -d '{"question": "Show me the event counts"}' | jq
```

---

## Docker Deployment (Optional)

### Build & Start
```bash
cd /Users/himeshp/apps/hackthons/minihog

# Build images (takes 5-10 min first time)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Test Dockerized App
- **API:** http://localhost:3000/api/health/healthz
- **Web:** http://localhost:3001

### Stop Services
```bash
docker-compose down
```

---

## MCP Server with Claude Desktop (Optional)

### 1. Build MCP Server
```bash
cd /Users/himeshp/apps/hackthons/minihog/apps/api
npm run build
```

### 2. Configure Claude Desktop

**macOS:**
```bash
# Copy config
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Edit paths
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Update:
- Replace `/path/to/minihog` with actual path
- Add your Cerebras API key

**Windows:**
```bash
copy claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json
```

### 3. Restart Claude Desktop

### 4. Test in Claude

Try these prompts:
- "Use get_active_users to show me active user stats"
- "Use get_top_events to show the most popular events"
- "Use ask_question to analyze: What events happened today?"

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000
# Kill it if needed
kill -9 <PID>
```

### Cerebras API Error
```bash
# Verify your key is set
echo $CEREBRAS_API_KEY

# Test the key
curl https://api.cerebras.ai/v1/chat/completions \
  -H "Authorization: Bearer $CEREBRAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1-70b","messages":[{"role":"user","content":"hi"}]}'
```

### Frontend Can't Connect to API
Check `.env` has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Clean Restart
```bash
# Kill all Node processes
pkill -f node

# Remove data (optional - starts fresh)
rm -rf data/

# Start over
mkdir -p data
```

---

## Success Checklist

- [ ] API health check responds
- [ ] Events can be ingested
- [ ] Analytics endpoints return data
- [ ] AI query with Cerebras works
- [ ] Frontend dashboard loads
- [ ] All 5 pages work (Dashboard, AI Query, Analytics, Flags, Settings)
- [ ] Can create and toggle feature flags
- [ ] Query history saves

**Optional:**
- [ ] Docker deployment works
- [ ] MCP server works with Claude Desktop

---

## What to Try

### 1. Event Tracking Flow
1. Open Web UI (http://localhost:3001)
2. Open Network tab in DevTools
3. Navigate around the dashboard
4. Watch events being sent to `/api/ingest/e`

### 2. AI Analysis
1. Go to AI Query page
2. Try: "Show me unique users from the last hour"
3. Watch Cerebras generate SQL and insights
4. Try the chart it suggests

### 3. Feature Flag Experimentation
1. Create flag: `dark_mode` at 50% rollout
2. Test with different user IDs
3. Watch consistent results (sticky bucketing)

### 4. Real-time Analytics
1. Keep Analytics page open
2. In terminal, send batch of events
3. Refresh page to see new data

---

## File Structure Reference

```
minihog/
├── apps/
│   ├── api/          # Backend (NestJS)
│   └── web/          # Frontend (Next.js)
├── packages/
│   ├── sdk/          # Browser SDK
│   └── shared/       # Shared types
├── data/             # Database files (created on first run)
├── .env              # Your environment variables
└── docker-compose.yml # Docker orchestration
```

---

## Next Steps

1. **For Demo:**
   - Record screen while using AI Query
   - Show MCP tools in Claude Desktop
   - Demonstrate feature flag rollout

2. **For Development:**
   - See `MANUAL_TESTING_GUIDE.md` for detailed tests
   - See `DOCKER_DEPLOYMENT.md` for production deployment
   - See `MCP_SETUP.md` for MCP integration details

3. **For Submission:**
   - Ensure all features work
   - Record demo video
   - Update README with screenshots

---

## Need Help?

- **Full Testing Guide:** `MANUAL_TESTING_GUIDE.md`
- **Docker Guide:** `DOCKER_DEPLOYMENT.md`
- **MCP Setup:** `MCP_SETUP.md`
- **Cerebras Setup:** `CEREBRAS_SETUP.md`

---

**Ready to go!** 🚀

Start with Terminal 1 (API), then Terminal 2 (tests), then Terminal 3 (Web UI)!
