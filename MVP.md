# Minihog - Hackathon MVP Specification

**FutureStack GenAI Hackathon** (Sept 29 - Oct 5, 2024)  
**Target Tracks:** ALL THREE - Cerebras + Meta + Docker (targeting $15,000 total)  
**Timeline:** 7 days

---

## Project Overview

**Minihog** is a self-hosted, lightweight product analytics platform with AI-powered natural language querying.

**Core Value Proposition:**
- Self-hosted analytics (no third-party services)
- **Natural language to SQL** using Cerebras API + Llama models
- **AI-powered insights** via Docker MCP Gateway
- Feature flags with sticky bucketing
- Real-time event ingestion and trends

**Sponsor Technology Integration:**
- **Cerebras API:** Ultra-fast inference for natural language query understanding
- **Llama 3.x:** Open-source LLM for SQL generation and data insights
- **Docker MCP Gateway:** Expose analytics as AI-callable tools

---

## Tech Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **HTTP Server:** Fastify adapter (better performance)
- **Runtime:** Node 20 LTS
- **Analytics Database:** DuckDB (single `.duckdb` file)
- **Metadata Database:** SQLite (for feature flags, API keys, users)
- **ORM:** Drizzle (lightweight, TypeScript-first)
- **AI/LLM:** Cerebras Inference API (llama3.1-8b or llama-3.3-70b)
- **Validation:** Zod (shared with SDK)
- **User-Agent Parsing:** ua-parser-js
- **Security:** helmet, API key guards, request size limits
- **Testing:** Jest + Supertest
- **Logging:** pino

### Frontend
- **Framework:** Next.js 15 (App Router, TypeScript)
- **UI Components:** shadcn/ui + Tailwind CSS
- **Data Fetching:** TanStack Query (React Query)
- **Charts:** Recharts
- **Tables:** TanStack Table
- **Icons:** lucide-react
- **Auth:** Simple cookie session (admin only)

### Browser SDK
- **Language:** TypeScript
- **Build:** tsup/rollup
- **Outputs:** ESM + IIFE (`minihog.js`)
- **Transport:** Batching (10 events / 10s), `navigator.sendBeacon` on unload

### MCP Server (Docker Track)
- **Implementation:** NestJS module or standalone service
- **Protocol:** Model Context Protocol (MCP)
- **Container:** Docker + Docker MCP Gateway
- **Tools Exposed:** 4-6 analytics tools callable by AI

### DevOps
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (optional, for TLS/gzip)
- **Deployment:** Self-hosted (single VM or local)

---

## IN SCOPE (Must Have for Hackathon)

### 1. Event Ingestion (HIGH PRIORITY)
- ✅ Browser SDK with `init()`, `track()`, `page()`, `identify()`
- ✅ Batching and `sendBeacon` for reliability
- ✅ API endpoints: `POST /e` (batch events), `POST /id` (identify/alias)
- ✅ Event validation with Zod
- ✅ Auto-enrichment: UTM params, user-agent parsing, timestamps
- ✅ Write events directly to DuckDB table

### 2. Basic Analytics (HIGH PRIORITY)
- ✅ Trends endpoint: `GET /insights/trends` (event counts over time)
- ✅ DuckDB queries with time-based grouping (hour/day/week)
- ✅ Active users calculation (DAU/WAU)
- ✅ Top events endpoint

### 3. Feature Flags (HIGH PRIORITY)
- ✅ CRUD endpoints for flags (`GET/POST /flags`)
- ✅ Boolean flags with rollout percentage
- ✅ Deterministic bucketing by `distinct_id`
- ✅ Sticky assignment (store in SQLite)
- ✅ Evaluation endpoint: `GET /ff?key=...&distinct_id=...`

### 4. AI-Powered Natural Language Queries (CEREBRAS + META TRACKS - CRITICAL)
- ✅ Natural language query interface in UI
- ✅ Cerebras API integration for ultra-fast inference
- ✅ Llama 3.1/3.3 for text-to-SQL generation
- ✅ Prompt engineering for DuckDB schema understanding
- ✅ Query validation and safety checks
- ✅ Example queries: "Show me signups in the last week", "Who are my top 10 active users?", "What's the conversion rate from pageview to signup?"
- ✅ Display generated SQL + results with charts
- ✅ Error handling with helpful suggestions

### 5. MCP Server - Docker Track (CRITICAL)
- ✅ **Tool 1:** `get_trend(event_name, time_period)` → returns event counts/chart data
- ✅ **Tool 2:** `get_active_users(period)` → returns DAU/WAU/MAU
- ✅ **Tool 3:** `get_top_events(limit)` → returns most frequent events
- ✅ **Tool 4:** `evaluate_flag(distinct_id, flag_key)` → returns feature flag variant
- ✅ **Tool 5:** `get_user_timeline(distinct_id)` → returns user's event history
- ✅ **Tool 6:** `run_query(sql)` → safe read-only SQL on DuckDB (with guardrails)
- ✅ **Tool 7 (NEW):** `ask_question(natural_language)` → uses Cerebras + Llama to convert to SQL, executes, returns insights
- ✅ Dockerized MCP server with Docker MCP Gateway integration
- ✅ Test with Claude Desktop or MCP inspector
- ✅ **KEY INTEGRATION:** MCP tools internally use Cerebras + Llama for intelligent query understanding

### 6. Minimal Frontend (MEDIUM PRIORITY)
- ✅ **Dashboard:** Event counts, DAU, simple line chart, recent events
- ✅ **Events Explorer:** Table with basic filters (time, event name, distinct_id)
- ✅ **Natural Language Query Page:** Input box for questions, shows generated SQL + chart results
- ✅ **Settings:** SDK snippet generator, API key display, Cerebras API key config
- ✅ Use shadcn/ui for quick, polished UI

### 7. Demo & Documentation (HIGH PRIORITY)
- ✅ Demo app that generates sample events
- ✅ 2-minute demo video showing:
  - SDK installation and event tracking
  - Dashboard showing real-time data
  - **Natural language query:** "Show me signups this week" → Cerebras+Llama generates SQL → displays chart
  - **MCP integration:** AI agent (Claude) calling MCP tools that use Cerebras internally
  - Feature flag evaluation
- ✅ README with:
  - Architecture diagram showing Cerebras + Llama + Docker integration
  - Setup/run instructions (including Cerebras API key setup)
  - How we use all 3 sponsor technologies
  - MCP integration guide
  - Demo walkthrough
- ✅ GitHub repo with visible commit history

### 8. Security & Privacy
- ✅ API key authentication for ingest endpoints
- ✅ Request body size limits
- ✅ IP hashing (SHA-256 + salt, optional)
- ✅ helmet middleware for security headers

---

## OUT OF SCOPE (Cut for Hackathon)

### Analytics Features (Too Complex)
- ❌ **Funnels** (multi-step conversion analysis)
- ❌ **Retention** (cohort analysis with heatmaps)
- ❌ **Paths** (user journey visualization)
- ❌ **Session Replay**
- ❌ **Breakdowns** (segmentation by properties)

### Advanced Feature Flag Features
- ❌ **Experiments** (A/B testing with statistical analysis)
- ❌ **Multivariate flags** (stick to boolean)
- ❌ **Targeting rules** (property-based flag assignment)

### Reports & Scheduling
- ❌ Saved reports
- ❌ Scheduled reports
- ❌ CSV/PNG exports
- ❌ Email notifications

### UI Complexity
- ❌ **Query Builder** (visual or SQL editor)
- ❌ Complex filtering UI
- ❌ Saved views/bookmarks
- ❌ User management UI
- ❌ Permissions/roles

### Data Pipeline Complexity
- ❌ **Parquet files** (use DuckDB native format only)
- ❌ NDJSON buffering and rotation
- ❌ Hourly cron jobs for data conversion
- ❌ Manifests table for file indexing
- ❌ Data compaction

### Infrastructure
- ❌ Redis (use in-memory cache only)
- ❌ Multi-tenancy
- ❌ Horizontal scaling
- ❌ Cloud deployment (focus on self-hosted)

---

## Data Model (Simplified)

### DuckDB (Analytics - `analytics.duckdb`)

**events** table:
```sql
CREATE TABLE events (
  timestamp TIMESTAMP,
  received_at TIMESTAMP,
  event VARCHAR,
  distinct_id VARCHAR,
  anonymous_id VARCHAR,
  properties JSON,
  context JSON, -- url, referrer, utm_*, user_agent, sdk version
  project_id VARCHAR,
  session_id VARCHAR
);
```

### SQLite (Metadata - `metadata.db`)

**feature_flags** table:
```sql
CREATE TABLE feature_flags (
  id INTEGER PRIMARY KEY,
  key VARCHAR UNIQUE,
  name VARCHAR,
  active BOOLEAN,
  rollout_percentage INTEGER,
  created_at TIMESTAMP
);
```

**flag_decisions** table:
```sql
CREATE TABLE flag_decisions (
  distinct_id VARCHAR,
  flag_key VARCHAR,
  variant VARCHAR,
  hash_value REAL,
  decided_at TIMESTAMP,
  PRIMARY KEY (distinct_id, flag_key)
);
```

**api_keys** table:
```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY,
  key VARCHAR UNIQUE,
  name VARCHAR,
  created_at TIMESTAMP
);
```

---

## NestJS Module Structure

```
/apps/api/src/
├── ingest/             # IngestModule: POST /e, POST /id
├── insights/           # InsightsModule: GET /insights/trends, etc.
├── ai/                 # AiModule: Cerebras + Llama integration for NL queries
├── flags/              # FlagsModule: CRUD + evaluation
├── mcp/                # McpModule: MCP server and tools (uses AiModule)
├── admin/              # AdminModule: settings, API keys
├── auth/               # AuthModule: API key guard
└── health/             # HealthModule: /healthz, /readyz
```

---

## MCP Tools Specification

Each tool returns structured JSON that AI agents can interpret:

### 1. `get_trend`
```json
{
  "name": "get_trend",
  "description": "Get event counts over time",
  "parameters": {
    "event_name": "string (required)",
    "time_period": "string (7d, 24h, 30d)"
  },
  "returns": {
    "series": [{"timestamp": "ISO", "count": number}],
    "total": number
  }
}
```

### 2. `get_active_users`
```json
{
  "name": "get_active_users",
  "description": "Get active user counts",
  "parameters": {
    "period": "string (today, 7d, 30d)"
  },
  "returns": {
    "dau": number,
    "wau": number,
    "mau": number
  }
}
```

### 3. `get_top_events`
```json
{
  "name": "get_top_events",
  "description": "Get most frequent events",
  "parameters": {
    "limit": "number (default: 10)"
  },
  "returns": {
    "events": [{"name": string, "count": number}]
  }
}
```

### 4. `evaluate_flag`
```json
{
  "name": "evaluate_flag",
  "description": "Evaluate feature flag for a user",
  "parameters": {
    "distinct_id": "string (required)",
    "flag_key": "string (required)"
  },
  "returns": {
    "enabled": boolean,
    "reason": string
  }
}
```

### 5. `get_user_timeline`
```json
{
  "name": "get_user_timeline",
  "description": "Get event history for a user",
  "parameters": {
    "distinct_id": "string (required)",
    "limit": "number (default: 50)"
  },
  "returns": {
    "events": [{"timestamp": "ISO", "event": string, "properties": object}]
  }
}
```

### 6. `run_query`
```json
{
  "name": "run_query",
  "description": "Run safe read-only SQL on DuckDB",
  "parameters": {
    "sql": "string (required, validated for safety)"
  },
  "returns": {
    "columns": [string],
    "rows": [array]
  }
}
```

### 7. `ask_question` (NEW - Cerebras + Llama powered)
```json
{
  "name": "ask_question",
  "description": "Ask a natural language question about your analytics data. Uses Cerebras API + Llama to generate and execute SQL.",
  "parameters": {
    "question": "string (required) - Natural language question like 'Show me signups in the last week'"
  },
  "returns": {
    "question": "string (original question)",
    "sql": "string (generated DuckDB SQL)",
    "results": {"columns": [string], "rows": [array]},
    "insights": "string (AI-generated summary of results)",
    "chart_suggestion": "string (line|bar|pie)"
  }
}
```

---

## Demo Video Script (2 minutes)

**0:00-0:20** - Introduction
- "Hi, I'm presenting Minihog - a self-hosted analytics platform with AI-powered querying"
- "Uses Cerebras API, Llama 3, and Docker MCP Gateway for natural language data exploration"
- Show architecture diagram highlighting all 3 sponsor integrations

**0:20-0:50** - Event Ingestion
- Show SDK snippet in demo app
- Trigger events (page view, button click, add to cart)
- Dashboard updates in real-time

**0:50-1:20** - AI-Powered Queries (THE KEY DEMO)
- **In UI:** Type "Show me signup trends for the last week"
  - Shows Cerebras + Llama generating SQL in real-time
  - Executes on DuckDB, displays chart
- **Via MCP:** Open Claude Desktop with MCP connected
  - Ask "Who are my most active users?"
  - Claude calls `ask_question` MCP tool
  - Tool uses Cerebras API internally → returns insights
  - Show the generated SQL and results

**1:20-1:45** - Feature Flags
- Toggle flag in UI
- Demo app reflects change immediately
- Show sticky bucketing (same user, same variant)

**1:45-2:00** - Wrap up
- "Self-hosted analytics with AI-powered querying"
- "Cerebras API provides ultra-fast inference, Llama 3 generates intelligent SQL, Docker MCP Gateway enables agent integration"
- "All three sponsor technologies working together seamlessly"
- GitHub link + thank sponsors

---

## Success Criteria

### Cerebras Track Prize ($5k + Interview)
- ✅ Cerebras Inference API actively used for query generation
- ✅ Demonstrate ultra-fast inference speed (< 500ms for SQL generation)
- ✅ Show real-time natural language to SQL conversion
- ✅ Handle complex queries with multiple conditions

### Meta Track Prize ($5k + Coffee Chat)
- ✅ Llama 3.1 or 3.3 model used for text-to-SQL generation
- ✅ Demonstrate impactful generative AI application (analytics democratization)
- ✅ Show prompt engineering for DuckDB-specific SQL
- ✅ Generate not just SQL but also insights/summaries

### Docker Track Prize ($5k)
- ✅ 6-7 MCP tools successfully exposed via Docker MCP Gateway
- ✅ Creative integration: MCP tools internally use Cerebras + Llama
- ✅ Demo shows AI agent querying analytics naturally
- ✅ Containerized deployment with docker-compose

### Technical Excellence
- ✅ Clean TypeScript throughout
- ✅ All 3 sponsor technologies integrated cohesively
- ✅ Zod schemas shared between SDK and API
- ✅ DuckDB queries < 1s on sample data
- ✅ Cerebras API calls < 500ms
- ✅ Feature flags working with deterministic bucketing

### Presentation
- ✅ 2-minute demo video hitting all sponsor integrations
- ✅ Polished README clearly explaining how each sponsor tech is used
- ✅ Architecture diagram showing data flow through all 3 systems
- ✅ GitHub repo with good commit history
- ✅ Deployed demo (optional but recommended)

---

## 7-Day Timeline

**Day 1-2:** Backend foundation
- NestJS setup with DuckDB + SQLite
- Ingest endpoints + validation
- Basic analytics queries
- **Cerebras API integration** (sign up, test connection)

**Day 3:** SDK + AI Module
- Browser SDK (track, page, identify)
- **AI Module:** Cerebras + Llama text-to-SQL pipeline
- Prompt engineering for DuckDB schema

**Day 4:** Frontend + NL Queries
- Minimal frontend (Dashboard + Events)
- **Natural Language Query page** with Cerebras integration
- Feature flags implementation

**Day 5-6:** MCP Server (Critical)
- Implement 6-7 MCP tools (including `ask_question`)
- **Integrate Cerebras into MCP tools**
- Docker MCP Gateway integration
- Testing with Claude Desktop

**Day 7:** Polish & Demo
- Demo video recording (showcase all 3 sponsors)
- README documentation (explain tech integrations)
- Bug fixes and final touches

---

## Why This Will Win ALL THREE Tracks

### Cerebras Track
1. **Best Use of API:** Uses Cerebras for ultra-fast inference in production feature (not just experimentation)
2. **Performance Showcase:** Real-time query generation demonstrates Cerebras speed advantage
3. **Practical Application:** Actual business value (analytics democratization)

### Meta Track
1. **Impactful GenAI:** Enables non-technical users to query complex data
2. **Llama Model Usage:** Text-to-SQL is a perfect Llama use case (reasoning + code generation)
3. **Open Source Spirit:** Self-hosted analytics aligns with Llama's open philosophy

### Docker Track
1. **Most Creative:** MCP tools that internally use AI for intelligent responses (meta-creativity)
2. **Technical Depth:** Shows understanding of MCP protocol, containerization, and AI integration
3. **Business Value:** AI agents can now query analytics conversationally
4. **Novel Architecture:** Docker MCP Gateway + Cerebras + Llama working together

### Overall Synergy
- All 3 technologies are **deeply integrated**, not just bolted on
- Each sponsor tech **enables** the others (MCP exposes Cerebras+Llama capabilities)
- Demo shows **one cohesive product**, not three separate features

---

## Resources

- **Cerebras API:** https://cloud.cerebras.ai/ (sign up with code: wemakedevs)
- **Llama Models:** https://www.llama.com/ + https://huggingface.co/meta-llama
- **Cerebras Model List:** Check available Llama models on Cerebras (llama3.1-8b, llama-3.3-70b)
- **Docker MCP:** https://www.docker.com/products/mcp-catalog-and-toolkit/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **MCP TypeScript SDK:** https://github.com/modelcontextprotocol/typescript-sdk
- **DuckDB Docs:** https://duckdb.org/docs/
- **NestJS:** https://nestjs.com/
- **shadcn/ui:** https://ui.shadcn.com/

---

## Notes

- **KISS Principle:** When in doubt, simplify. A polished core beats half-finished features.
- **DuckDB is enough:** No Parquet, no complex pipelines. DuckDB handles everything.
- **Integration is key:** All 3 sponsors must be used **meaningfully**, not superficially.
- **Cerebras + Llama together:** Run Llama models via Cerebras API for best results.
- **MCP enhances AI:** MCP tools should use Cerebras internally to show deep integration.
- **Demo all 3:** Video must clearly show Cerebras API calls, Llama model, and Docker MCP.
- **Test early:** Get Cerebras API working by Day 3, MCP by Day 5.
- **Prompt engineering matters:** Spend time crafting good prompts for SQL generation.
