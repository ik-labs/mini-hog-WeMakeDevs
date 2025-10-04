# Minihog MCP Server Setup Guide

This guide explains how to configure and test the Minihog MCP (Model Context Protocol) server with Claude Desktop and Docker MCP Gateway.

## Prerequisites

- **Docker Desktop** with MCP Gateway support
- **Claude Desktop** (latest version)
- **Node.js 20+** (for local development)
- **Cerebras API Key** (get from https://cerebras.ai)

---

## What We Can Do Now (Automated)

### ✅ 1. MCP Configuration Files Created
- `claude_desktop_config.json` - Claude Desktop configuration
- `docker-compose.yml` - Includes MCP service
- `.env.example` - Environment variables template

### ✅ 2. MCP Server Implementation Complete
**7 Tools Available:**
1. **get_trend** - Get analytics trends over time
2. **get_active_users** - Get DAU/WAU/MAU metrics
3. **get_top_events** - Get most frequent events
4. **evaluate_flag** - Evaluate feature flags for users
5. **get_user_timeline** - Get user's event history
6. **run_query** - Execute safe SQL queries
7. **ask_question** - Ask natural language questions (Cerebras AI)

### ✅ 3. Docker Configuration Ready
- Multi-stage Dockerfiles for API, Web, and MCP
- Docker Compose with all services
- Volume mounts for data persistence
- Health checks configured

---

## What Requires Manual Steps (User Must Do)

### 🔴 7.10: Docker MCP Gateway Integration

**Option A: Using Docker Desktop MCP Gateway**
```bash
# Install Docker MCP Gateway plugin (if not installed)
docker plugin install docker/mcp-gateway

# Start services
docker-compose up -d

# Gateway will automatically discover the MCP service
```

**Option B: Direct stdio Connection**
```bash
# Build and start just the API
docker-compose up -d api

# Run MCP server locally for testing
cd apps/api
npm run build
node dist/mcp-server.js
```

### 🔴 7.11: Testing with Claude Desktop

#### Step 1: Install Claude Desktop
- **macOS**: Download from https://claude.ai/download
- **Windows**: Download from https://claude.ai/download

#### Step 2: Configure Claude Desktop

**macOS Configuration:**
```bash
# Open Claude Desktop config
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or use our prepared config
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows Configuration:**
```powershell
# Open Claude Desktop config
notepad %APPDATA%\Claude\claude_desktop_config.json

# Copy our prepared config to this location
```

**Update paths in the config:**
- Replace `/path/to/minihog` with your actual project path
- Add your `CEREBRAS_API_KEY`
- Optionally set a custom `API_KEY`

#### Step 3: Restart Claude Desktop
Close and reopen Claude Desktop to load the new configuration.

#### Step 4: Test MCP Tools

**Test Checklist** (Try these in Claude conversations):

```
1. Get Analytics Trends:
   "Use get_trend to show me event trends for the last 7 days"

2. Get Active Users:
   "Use get_active_users to show me DAU, WAU, and MAU"

3. Get Top Events:
   "Use get_top_events to show me the 10 most frequent events"

4. Evaluate Feature Flag:
   "Use evaluate_flag to check if flag 'example_flag' is enabled for user 'user123'"

5. Get User Timeline:
   "Use get_user_timeline to show me the last 20 events for user 'test_user'"

6. Run SQL Query:
   "Use run_query to execute: SELECT event, COUNT(*) as count FROM events GROUP BY event LIMIT 5"

7. Ask Natural Language Question (Cerebras):
   "Use ask_question to find out: What are the top 5 events by count?"
```

### 🔴 7.12: Docker Build & Run

#### Step 1: Create .env File
```bash
# Copy example and fill in your keys
cp .env.example .env

# Edit .env and add:
# - Your CEREBRAS_API_KEY
# - Optionally customize API_KEY
nano .env
```

#### Step 2: Build Docker Images
```bash
# Build all services
docker-compose build

# Or build individually
docker-compose build api
docker-compose build web
docker-compose build mcp
```

#### Step 3: Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### Step 4: Verify Services

**API Health Check:**
```bash
curl http://localhost:3000/api/health/healthz
# Expected: {"status":"ok","timestamp":"..."}
```

**Web Application:**
```bash
# Open in browser
open http://localhost:3001
```

**MCP Server (via logs):**
```bash
docker-compose logs mcp
# Should show: "MCP Server started with stdio transport"
```

#### Step 5: Test API Endpoints
```bash
# Test event ingestion
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "events": [{
      "event": "test_event",
      "distinct_id": "test_user",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
      "properties": {"test": true}
    }]
  }'

# Test analytics
curl http://localhost:3000/api/analytics/active-users \
  -H "X-API-Key: your-api-key-here"
```

---

## Troubleshooting

### MCP Server Not Showing in Claude Desktop

1. **Check Configuration Path:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   type %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Verify Paths:**
   - Ensure all paths in config are absolute, not relative
   - Check that `node` is in your PATH: `which node`
   - Verify the MCP server builds: `npm run build` in `apps/api`

3. **Check Logs:**
   - Claude Desktop logs (Help > Developer > Show Logs)
   - Look for MCP-related errors

### Docker Services Won't Start

1. **Check Port Conflicts:**
   ```bash
   # See what's using port 3000
   lsof -i :3000
   
   # See what's using port 3001
   lsof -i :3001
   ```

2. **Check Docker Resources:**
   - Ensure Docker has enough memory (4GB+ recommended)
   - Check disk space for volumes

3. **View Container Logs:**
   ```bash
   docker-compose logs api
   docker-compose logs web
   docker-compose logs mcp
   ```

### Cerebras API Errors

1. **Verify API Key:**
   ```bash
   # Test the key
   curl https://api.cerebras.ai/v1/chat/completions \
     -H "Authorization: Bearer $CEREBRAS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama3.1-70b","messages":[{"role":"user","content":"test"}]}'
   ```

2. **Check Quota:**
   - Visit https://cloud.cerebras.ai/platform
   - Check your usage and limits

---

## Task Status Summary

### ✅ Can Do Now (Automated):
- [x] Create MCP configuration files
- [x] Create documentation and instructions
- [x] Docker configuration complete
- [x] MCP server code complete

### 🔴 Requires Manual Steps:
- [ ] Install Claude Desktop
- [ ] Configure Claude Desktop with MCP server
- [ ] Build Docker images
- [ ] Run docker-compose up
- [ ] Test MCP tools in Claude conversations
- [ ] Test API endpoints
- [ ] Verify Cerebras integration
- [ ] Record demo video

---

## Next Steps

1. **For Docker Deployment:**
   - Follow steps in section 7.12
   - Start with local testing, then containerized

2. **For Claude Desktop:**
   - Install Claude Desktop first
   - Configure MCP server (section 7.11)
   - Test each tool with the checklist

3. **For Demo:**
   - Record screen while using Claude with MCP tools
   - Show the 7 tools in action
   - Highlight Cerebras integration in ask_question

---

## Additional Resources

- **Model Context Protocol Docs**: https://modelcontextprotocol.io
- **Claude Desktop MCP Guide**: https://docs.claude.com/en/docs/claude-code/mcp
- **Docker MCP Gateway**: https://github.com/docker/mcp-gateway
- **Cerebras AI Platform**: https://cloud.cerebras.ai

---

**Created**: $(date)  
**Minihog Version**: 1.0.0  
**MCP Tools**: 7 (all implemented)
