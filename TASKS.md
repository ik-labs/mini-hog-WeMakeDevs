# Minihog - Task Breakdown & Tracking

**Status Legend:**
- 🔴 **TODO** - Not started
- 🟡 **IN PROGRESS** - Currently working on
- 🟢 **DONE** - Completed

---

## Phase 1: Project Setup & Backend Foundation
**Timeline:** Day 1-2  
**Priority:** HIGH - Foundation for everything

### 1.1 Repository & Monorepo Setup
- [x] 🟢 Initialize git repository
- [x] 🟢 Set up monorepo structure (apps/packages folders)
- [x] 🟢 Create package.json with workspaces
- [x] 🟢 Add .gitignore (node_modules, .env, *.db, data/)
- [x] 🟢 Set up TypeScript config (root + per-package)
- [x] 🟢 Configure ESLint + Prettier

### 1.2 NestJS Backend Setup
- [x] 🟢 Initialize NestJS app in `/apps/api`
- [x] 🟢 Install dependencies: @nestjs/core, @nestjs/platform-fastify, fastify
- [x] 🟢 Configure Fastify adapter instead of Express
- [x] 🟢 Set up environment variables (.env + validation)
- [x] 🟢 Configure pino logger
- [x] 🟢 Add helmet middleware for security
- [x] 🟢 Set up CORS configuration
- [x] 🟢 Create basic module structure (ingest, insights, flags, ai, mcp, admin, auth, health)

### 1.3 Database Setup - DuckDB
- [x] 🟢 Install duckdb npm package
- [x] 🟢 Create DuckDB connection service
- [x] 🟢 Create `events` table schema
- [x] 🟢 Add migration/initialization script for DuckDB
- [x] 🟢 Test basic INSERT and SELECT operations
- [x] 🟢 Add indexes for performance (timestamp, distinct_id, event)

### 1.4 Database Setup - SQLite (Metadata)
- [x] 🟢 Install better-sqlite3 + drizzle-orm
- [x] 🟢 Set up Drizzle schema definitions
- [x] 🟢 Create `feature_flags` table schema
- [x] 🟢 Create `flag_decisions` table schema
- [x] 🟢 Create `api_keys` table schema
- [x] 🟢 Create migration scripts
- [x] 🟢 Test basic CRUD operations

### 1.5 Shared Packages Setup
- [x] 🟢 Create `/packages/shared` package
- [x] 🟢 Define Zod schemas for events
- [x] 🟢 Define Zod schemas for API requests/responses
- [x] 🟢 Export shared TypeScript types
- [x] 🟢 Export constants (event names, time periods)

### 1.6 Ingest Module (Backend)
- [x] 🟢 Create IngestModule with controller and service
- [x] 🟢 Implement `POST /e` endpoint (batch events)
- [x] 🟢 Add Zod validation for event payloads
- [x] 🟢 Implement auto-enrichment (timestamp, received_at)
- [x] 🟢 Add UTM parameter extraction
- [x] 🟢 Integrate ua-parser-js for user-agent parsing
- [x] 🟢 Implement DuckDB event insertion
- [x] 🟢 Add request body size limits (1MB max)
- [x] 🟢 Create `POST /id` endpoint (identify/alias)
- [x] 🟢 Add error handling and validation errors
- [x] 🟢 Test with sample payloads

### 1.7 Auth Module
- [x] 🟢 Create AuthModule with API key guard
- [x] 🟢 Implement API key validation logic
- [x] 🟢 Create decorator for @RequireApiKey()
- [x] 🟢 Add API key seeding script (generate first key)
- [ ] 🔴 Implement rate limiting (optional but recommended)

### 1.8 Basic Analytics - Insights Module
- [ ] 🔴 Create InsightsModule with controller and service
- [ ] 🔴 Implement `GET /insights/trends` endpoint
- [ ] 🔴 Add query parameters: event_name, from, to, interval
- [ ] 🔴 Write DuckDB query for event counts over time
- [ ] 🔴 Add time grouping logic (hour/day/week)
- [ ] 🔴 Implement `GET /insights/active-users` (DAU/WAU/MAU)
- [ ] 🔴 Implement `GET /insights/top-events` with limit parameter
- [ ] 🔴 Optimize queries with proper WHERE clauses
- [ ] 🔴 Add query result caching (in-memory, 60s TTL)
- [ ] 🔴 Test with sample data

### 1.9 Health Module
- [ ] 🔴 Create HealthModule
- [ ] 🔴 Implement `GET /healthz` (basic health check)
- [ ] 🔴 Implement `GET /readyz` (DuckDB + SQLite connectivity check)
- [ ] 🔴 Add disk space check

### 1.10 Cerebras API Setup
- [ ] 🔴 Sign up for Cerebras Cloud (use code: wemakedevs)
- [ ] 🔴 Get API key and add to .env
- [ ] 🔴 Install SDK or HTTP client for Cerebras API
- [ ] 🔴 Test basic inference call with Llama model
- [ ] 🔴 Verify model availability (llama3.1-8b or llama-3.3-70b)
- [ ] 🔴 Document API rate limits and quotas

---

## Phase 2: Browser SDK Development
**Timeline:** Day 3  
**Priority:** HIGH - Required for demo

### 2.1 SDK Project Setup
- [ ] 🔴 Create `/packages/sdk` package
- [ ] 🔴 Set up TypeScript config for browser target
- [ ] 🔴 Install tsup/rollup for bundling
- [ ] 🔴 Configure build to output ESM + IIFE
- [ ] 🔴 Add package.json with build scripts

### 2.2 SDK Core Implementation
- [ ] 🔴 Implement `init(config)` method
- [ ] 🔴 Add config validation (endpoint, apiKey required)
- [ ] 🔴 Implement `track(event, properties)` method
- [ ] 🔴 Implement `page(properties?)` method (auto-capture URL)
- [ ] 🔴 Implement `identify(distinctId, traits?)` method
- [ ] 🔴 Generate anonymous_id using UUID
- [ ] 🔴 Implement session_id generation and persistence

### 2.3 SDK Transport & Batching
- [ ] 🔴 Implement event queue (in-memory array)
- [ ] 🔴 Add batching logic (10 events OR 10 seconds)
- [ ] 🔴 Implement flush() method to send batch
- [ ] 🔴 Use fetch for normal sends
- [ ] 🔴 Use navigator.sendBeacon on page unload
- [ ] 🔴 Add retry logic with exponential backoff
- [ ] 🔴 Handle network errors gracefully

### 2.4 SDK Context & Auto-capture
- [ ] 🔴 Auto-capture URL, referrer, title on page()
- [ ] 🔴 Extract UTM parameters from URL
- [ ] 🔴 Add user-agent string to context
- [ ] 🔴 Add timestamp (client-side) to all events
- [ ] 🔴 Include SDK version in context

### 2.5 SDK Build & Distribution
- [ ] 🔴 Build SDK bundle (minified)
- [ ] 🔴 Generate TypeScript type definitions
- [ ] 🔴 Test bundle size (target < 10KB gzipped)
- [ ] 🔴 Create simple test HTML page
- [ ] 🔴 Verify events reach backend

---

## Phase 3: AI Module - Cerebras Integration
**Timeline:** Day 3  
**Priority:** CRITICAL - Core differentiator

### 3.1 AI Module Setup
- [ ] 🔴 Create AiModule in `/apps/api/src/ai`
- [ ] 🔴 Create AiService for Cerebras API calls
- [ ] 🔴 Add Cerebras API client configuration
- [ ] 🔴 Create types for AI request/response

### 3.2 Prompt Engineering for Text-to-SQL
- [ ] 🔴 Define DuckDB schema description for prompts
- [ ] 🔴 Create system prompt for SQL generation
- [ ] 🔴 Include example queries in prompt (few-shot learning)
- [ ] 🔴 Add instructions for DuckDB-specific syntax
- [ ] 🔴 Create prompt template function

### 3.3 Natural Language to SQL Service
- [ ] 🔴 Implement `generateSql(question: string)` method
- [ ] 🔴 Call Cerebras API with Llama model
- [ ] 🔴 Parse SQL from AI response
- [ ] 🔴 Add SQL validation (read-only, no DDL/DML)
- [ ] 🔴 Implement SQL safety checks (no DELETE, DROP, etc.)
- [ ] 🔴 Add query timeout limits
- [ ] 🔴 Test with various natural language questions

### 3.4 Query Execution Service
- [ ] 🔴 Implement `executeNaturalLanguageQuery(question)` method
- [ ] 🔴 Generate SQL using Cerebras
- [ ] 🔴 Execute SQL on DuckDB
- [ ] 🔴 Format results as JSON
- [ ] 🔴 Add error handling for invalid SQL
- [ ] 🔴 Generate AI insights/summary of results
- [ ] 🔴 Suggest chart type based on results

### 3.5 AI API Endpoints
- [ ] 🔴 Create `POST /ai/query` endpoint
- [ ] 🔴 Add request validation (question required)
- [ ] 🔴 Return: question, sql, results, insights, chart_suggestion
- [ ] 🔴 Add response time logging
- [ ] 🔴 Implement caching for identical questions
- [ ] 🔴 Test with multiple question types

### 3.6 Performance Optimization
- [ ] 🔴 Measure Cerebras API latency
- [ ] 🔴 Optimize prompt length for faster inference
- [ ] 🔴 Add connection pooling if needed
- [ ] 🔴 Target < 500ms for SQL generation

---

## Phase 4: Frontend - Dashboard & Basic UI
**Timeline:** Day 4 (Morning)  
**Priority:** MEDIUM - Needed for demo

### 4.1 Next.js Setup
- [ ] 🔴 Create `/apps/web` with Next.js 15
- [ ] 🔴 Use App Router (not Pages Router)
- [ ] 🔴 Set up TypeScript config
- [ ] 🔴 Install and configure Tailwind CSS
- [ ] 🔴 Set up shadcn/ui (run init command)

### 4.2 shadcn/ui Components Installation
- [ ] 🔴 Install button component
- [ ] 🔴 Install card component
- [ ] 🔴 Install table component
- [ ] 🔴 Install input component
- [ ] 🔴 Install select component
- [ ] 🔴 Install badge component
- [ ] 🔴 Install lucide-react for icons

### 4.3 API Client & Data Fetching
- [ ] 🔴 Install @tanstack/react-query
- [ ] 🔴 Set up QueryClient and provider
- [ ] 🔴 Create API client helper functions
- [ ] 🔴 Create custom hooks for queries (useEvents, useTrends)

### 4.4 Layout & Navigation
- [ ] 🔴 Create root layout with sidebar
- [ ] 🔴 Add navigation menu (Dashboard, Events, Query, Settings)
- [ ] 🔴 Add logo/branding
- [ ] 🔴 Implement responsive layout

### 4.5 Dashboard Page
- [ ] 🔴 Create `/app/page.tsx` (Dashboard)
- [ ] 🔴 Add KPI cards: Total Events, DAU, WAU, MAU
- [ ] 🔴 Fetch stats from `/insights/active-users` and `/insights/trends`
- [ ] 🔴 Install Recharts
- [ ] 🔴 Create simple line chart for events over time (24h)
- [ ] 🔴 Add "Recent Events" table (last 20 events)
- [ ] 🔴 Add auto-refresh (30s interval)
- [ ] 🔴 Add loading skeletons

### 4.6 Events Explorer Page
- [ ] 🔴 Create `/app/events/page.tsx`
- [ ] 🔴 Fetch events from backend
- [ ] 🔴 Display in TanStack Table
- [ ] 🔴 Add columns: timestamp, event, distinct_id, properties
- [ ] 🔴 Add time range filter (today, 7d, 30d)
- [ ] 🔴 Add event name filter
- [ ] 🔴 Add search by distinct_id
- [ ] 🔴 Add pagination (20 per page)
- [ ] 🔴 Make properties column expandable (JSON view)

### 4.7 Settings Page
- [ ] 🔴 Create `/app/settings/page.tsx`
- [ ] 🔴 Display API key (masked, with copy button)
- [ ] 🔴 Create SDK snippet generator
- [ ] 🔴 Add code block with syntax highlighting
- [ ] 🔴 Add "Copy to clipboard" functionality
- [ ] 🔴 Add Cerebras API key configuration form

---

## Phase 5: AI-Powered Natural Language Queries UI
**Timeline:** Day 4 (Afternoon)  
**Priority:** CRITICAL - Key demo feature

### 5.1 Natural Language Query Page
- [ ] 🔴 Create `/app/query/page.tsx`
- [ ] 🔴 Add large text input for questions
- [ ] 🔴 Add example questions as clickable chips
- [ ] 🔴 Add "Ask" button with loading state
- [ ] 🔴 Create mutation hook for `/ai/query` endpoint

### 5.2 Query Results Display
- [ ] 🔴 Show "Generating SQL..." loading state with Cerebras branding
- [ ] 🔴 Display generated SQL in code block (with syntax highlighting)
- [ ] 🔴 Show query execution time
- [ ] 🔴 Display results in table format
- [ ] 🔴 Add chart visualization based on chart_suggestion
- [ ] 🔴 Display AI-generated insights/summary
- [ ] 🔴 Add error handling with helpful messages

### 5.3 Query History (Optional Enhancement)
- [ ] 🔴 Show last 5 queries in sidebar
- [ ] 🔴 Make them clickable to re-run
- [ ] 🔴 Store in localStorage

### 5.4 Polish & UX
- [ ] 🔴 Add keyboard shortcut (Cmd/Ctrl + Enter to submit)
- [ ] 🔴 Add animation for loading state
- [ ] 🔴 Add "Powered by Cerebras + Llama" badge
- [ ] 🔴 Test with various question types
- [ ] 🔴 Handle edge cases (empty results, errors)

---

## Phase 6: Feature Flags Implementation
**Timeline:** Day 4 (Evening)  
**Priority:** HIGH - Shows feature completeness

### 6.1 Flags Backend - CRUD Endpoints
- [ ] 🔴 Create FlagsModule with controller and service
- [ ] 🔴 Implement `GET /flags` (list all flags)
- [ ] 🔴 Implement `POST /flags` (create flag)
- [ ] 🔴 Implement `GET /flags/:key` (get single flag)
- [ ] 🔴 Implement `PATCH /flags/:key` (update flag)
- [ ] 🔴 Implement `DELETE /flags/:key` (delete flag)
- [ ] 🔴 Add Zod validation for flag payloads

### 6.2 Flag Evaluation Logic
- [ ] 🔴 Implement deterministic bucketing algorithm (hash-based)
- [ ] 🔴 Use distinct_id + flag_key for consistent hashing
- [ ] 🔴 Compare hash to rollout_percentage
- [ ] 🔴 Implement sticky assignment (store in flag_decisions table)
- [ ] 🔴 Create `GET /ff?key=...&distinct_id=...` endpoint
- [ ] 🔴 Return: enabled (boolean), reason (string)

### 6.3 SDK Flag Support
- [ ] 🔴 Add `getFlag(key, defaultValue?)` method to SDK
- [ ] 🔴 Store flag values in localStorage for persistence
- [ ] 🔴 Implement fetch from `/ff` endpoint
- [ ] 🔴 Add callback for flag changes (optional)

### 6.4 Flags Frontend UI
- [ ] 🔴 Create `/app/flags/page.tsx`
- [ ] 🔴 Display list of flags in cards/table
- [ ] 🔴 Show: key, name, active status, rollout %
- [ ] 🔴 Add "Create Flag" button and modal
- [ ] 🔴 Add toggle to enable/disable flag
- [ ] 🔴 Add slider to adjust rollout percentage
- [ ] 🔴 Add "Test Evaluation" section (enter distinct_id, see result)
- [ ] 🔴 Add delete confirmation dialog

---

## Phase 7: MCP Server & Docker Integration
**Timeline:** Day 5-6  
**Priority:** CRITICAL - Docker track requirement

### 7.1 MCP Module Setup
- [ ] 🔴 Create McpModule in `/apps/api/src/mcp`
- [ ] 🔴 Install MCP TypeScript SDK (@modelcontextprotocol/sdk)
- [ ] 🔴 Create MCP server instance
- [ ] 🔴 Configure server metadata (name, version, description)

### 7.2 MCP Tool 1: get_trend
- [ ] 🔴 Define tool schema with parameters
- [ ] 🔴 Implement handler: call InsightsService.getTrends()
- [ ] 🔴 Format response as required JSON structure
- [ ] 🔴 Test with MCP inspector

### 7.3 MCP Tool 2: get_active_users
- [ ] 🔴 Define tool schema
- [ ] 🔴 Implement handler: call InsightsService.getActiveUsers()
- [ ] 🔴 Return DAU/WAU/MAU
- [ ] 🔴 Test with MCP inspector

### 7.4 MCP Tool 3: get_top_events
- [ ] 🔴 Define tool schema with limit parameter
- [ ] 🔴 Implement handler: query top events from DuckDB
- [ ] 🔴 Return event names and counts
- [ ] 🔴 Test with MCP inspector

### 7.5 MCP Tool 4: evaluate_flag
- [ ] 🔴 Define tool schema with distinct_id and flag_key
- [ ] 🔴 Implement handler: call FlagsService.evaluate()
- [ ] 🔴 Return enabled + reason
- [ ] 🔴 Test with MCP inspector

### 7.6 MCP Tool 5: get_user_timeline
- [ ] 🔴 Define tool schema with distinct_id and limit
- [ ] 🔴 Implement handler: query events for user from DuckDB
- [ ] 🔴 Return chronological event list
- [ ] 🔴 Test with MCP inspector

### 7.7 MCP Tool 6: run_query
- [ ] 🔴 Define tool schema with sql parameter
- [ ] 🔴 Implement SQL safety validation
- [ ] 🔴 Execute query on DuckDB
- [ ] 🔴 Return columns + rows
- [ ] 🔴 Add error handling for invalid SQL
- [ ] 🔴 Test with MCP inspector

### 7.8 MCP Tool 7: ask_question (Cerebras-powered)
- [ ] 🔴 Define tool schema with question parameter
- [ ] 🔴 Implement handler: call AiService.executeNaturalLanguageQuery()
- [ ] 🔴 Return: question, sql, results, insights, chart_suggestion
- [ ] 🔴 Ensure Cerebras API is called internally
- [ ] 🔴 Test with various questions via MCP inspector

### 7.9 Docker Configuration
- [ ] 🔴 Create Dockerfile for backend API
- [ ] 🔴 Create Dockerfile for MCP server (if separate)
- [ ] 🔴 Create docker-compose.yml with all services
- [ ] 🔴 Add volume mounts for DuckDB/SQLite persistence
- [ ] 🔴 Configure environment variables in docker-compose
- [ ] 🔴 Add healthcheck directives

### 7.10 Docker MCP Gateway Integration
- [ ] 🔴 Read Docker MCP Gateway documentation
- [ ] 🔴 Configure MCP server to expose via Docker MCP Gateway
- [ ] 🔴 Test MCP server accessibility
- [ ] 🔴 Create MCP configuration file (if required)

### 7.11 Testing with Claude Desktop
- [ ] 🔴 Install Claude Desktop (if not already)
- [ ] 🔴 Configure Claude Desktop to connect to MCP server
- [ ] 🔴 Test each MCP tool via Claude conversations
- [ ] 🔴 Verify Cerebras integration in `ask_question` tool
- [ ] 🔴 Document any issues and fixes
- [ ] 🔴 Record test interactions for demo video

### 7.12 Docker Build & Run
- [ ] 🔴 Build all Docker images
- [ ] 🔴 Test docker-compose up
- [ ] 🔴 Verify all services start successfully
- [ ] 🔴 Test API endpoints from within containers
- [ ] 🔴 Test MCP server from within containers
- [ ] 🔴 Fix any networking issues

---

## Phase 8: Demo App & Documentation
**Timeline:** Day 7  
**Priority:** CRITICAL - Required for submission

### 8.1 Demo Application
- [ ] 🔴 Create simple demo website (in `/apps/demo` or standalone HTML)
- [ ] 🔴 Integrate SDK script tag
- [ ] 🔴 Add buttons to trigger events (pageview, signup, add_to_cart, purchase)
- [ ] 🔴 Add form for user properties (name, email)
- [ ] 🔴 Implement identify() on form submit
- [ ] 🔴 Add feature flag toggle demonstration
- [ ] 🔴 Style demo app (make it look good for video)
- [ ] 🔴 Deploy demo app (optional: Vercel/Netlify)

### 8.2 Demo Video Script & Storyboard
- [ ] 🔴 Write detailed script following MVP.md structure
- [ ] 🔴 Practice narration and timing
- [ ] 🔴 Prepare screen recording setup (1080p or 4K)
- [ ] 🔴 Set up demo environment (clear browser, fresh data)
- [ ] 🔴 Create sample data for realistic demo

### 8.3 Demo Video Recording
- [ ] 🔴 Record intro (0:00-0:20): introduce project, show architecture
- [ ] 🔴 Record event ingestion (0:20-0:50): SDK integration, real-time updates
- [ ] 🔴 Record AI queries in UI (0:50-1:10): natural language query with Cerebras
- [ ] 🔴 Record MCP demo (1:10-1:30): Claude Desktop calling MCP tools
- [ ] 🔴 Record feature flags (1:30-1:45): toggle flag, see demo change
- [ ] 🔴 Record wrap-up (1:45-2:00): summarize sponsor integrations
- [ ] 🔴 Edit video (cut mistakes, add transitions)
- [ ] 🔴 Add captions/text overlays for clarity
- [ ] 🔴 Export in high quality (MP4, max 100MB)

### 8.4 Architecture Diagram
- [ ] 🔴 Create architecture diagram (use Excalidraw, Figma, or draw.io)
- [ ] 🔴 Show: Browser SDK → API → DuckDB
- [ ] 🔴 Show: API → Cerebras API → Llama models
- [ ] 🔴 Show: MCP Gateway → MCP Server → API/AI Module
- [ ] 🔴 Highlight all 3 sponsor technologies clearly
- [ ] 🔴 Export as PNG/SVG

### 8.5 README Documentation
- [ ] 🔴 Create comprehensive README.md
- [ ] 🔴 Add project title, description, and tagline
- [ ] 🔴 Add architecture diagram image
- [ ] 🔴 Document all 3 sponsor technology integrations
- [ ] 🔴 Add **Features** section
- [ ] 🔴 Add **Tech Stack** section
- [ ] 🔴 Add **Setup Instructions** section
  - [ ] 🔴 Prerequisites (Node, Docker)
  - [ ] 🔴 Clone repo
  - [ ] 🔴 Install dependencies
  - [ ] 🔴 Set up .env file (with Cerebras API key)
  - [ ] 🔴 Run database migrations
  - [ ] 🔴 Start backend
  - [ ] 🔴 Start frontend
  - [ ] 🔴 Start MCP server
- [ ] 🔴 Add **Docker Setup** section
  - [ ] 🔴 Docker Compose commands
  - [ ] 🔴 MCP Gateway configuration
- [ ] 🔴 Add **Usage** section
  - [ ] 🔴 SDK integration example
  - [ ] 🔴 Natural language query examples
  - [ ] 🔴 MCP tools usage with Claude
- [ ] 🔴 Add **Demo Video** link
- [ ] 🔴 Add **Sponsor Technologies** section explaining how each is used
- [ ] 🔴 Add **Screenshots** (Dashboard, Query page, MCP demo)
- [ ] 🔴 Add **License** (MIT)
- [ ] 🔴 Add **Acknowledgments** (thank sponsors)

### 8.6 Additional Documentation
- [ ] 🔴 Create CONTRIBUTING.md (if open-sourcing)
- [ ] 🔴 Create API.md documenting all endpoints
- [ ] 🔴 Create MCP.md documenting all MCP tools
- [ ] 🔴 Add JSDoc comments to key functions
- [ ] 🔴 Create example .env.example file

### 8.7 Code Quality & Cleanup
- [ ] 🔴 Run ESLint and fix all errors
- [ ] 🔴 Run Prettier to format all code
- [ ] 🔴 Remove console.logs (keep only important logs)
- [ ] 🔴 Remove commented-out code
- [ ] 🔴 Add TODO comments for known issues/improvements
- [ ] 🔴 Check for exposed secrets/API keys

### 8.8 Testing & Bug Fixes
- [ ] 🔴 Test all API endpoints manually
- [ ] 🔴 Test SDK in different browsers (Chrome, Firefox, Safari)
- [ ] 🔴 Test natural language queries with edge cases
- [ ] 🔴 Test MCP tools end-to-end
- [ ] 🔴 Test Docker deployment on fresh machine
- [ ] 🔴 Fix any critical bugs found
- [ ] 🔴 Verify Cerebras API error handling
- [ ] 🔴 Test with rate limits/quota exceeded scenarios

### 8.9 GitHub Repository Preparation
- [ ] 🔴 Review all commits for good messages
- [ ] 🔴 Squash/rebase if needed (optional)
- [ ] 🔴 Verify .gitignore is working (no .env, no .db files)
- [ ] 🔴 Add GitHub repo description and topics
- [ ] 🔴 Add LICENSE file
- [ ] 🔴 Create GitHub Issues for known limitations (optional)
- [ ] 🔴 Make repository public

### 8.10 Submission Preparation
- [ ] 🔴 Upload demo video to YouTube/Vimeo/Google Drive
- [ ] 🔴 Get shareable link for demo video
- [ ] 🔴 Fill out hackathon submission form
- [ ] 🔴 Include GitHub repo link
- [ ] 🔴 Include demo video link
- [ ] 🔴 Write project description (emphasize all 3 sponsors)
- [ ] 🔴 Add screenshots/links
- [ ] 🔴 Submit before deadline!

---

## Optional Enhancements (If Time Permits)

### Nice-to-Have Features
- [ ] 🔴 Add unit tests for critical services
- [ ] 🔴 Add integration tests for API endpoints
- [ ] 🔴 Implement query result caching in AI module
- [ ] 🔴 Add Swagger/OpenAPI documentation
- [ ] 🔴 Deploy backend to cloud (Railway, Render, Fly.io)
- [ ] 🔴 Deploy frontend to Vercel
- [ ] 🔴 Add Google Analytics event tracking to demo app
- [ ] 🔴 Create landing page for project
- [ ] 🔴 Add dark mode to frontend
- [ ] 🔴 Improve error messages with suggestions
- [ ] 🔴 Add more example queries to Query page
- [ ] 🔴 Add export to CSV feature
- [ ] 🔴 Add chart download as PNG

---

## Progress Tracking

### Overall Progress by Phase
- [ ] Phase 1: Project Setup & Backend Foundation (0/61 tasks)
- [ ] Phase 2: Browser SDK Development (0/20 tasks)
- [ ] Phase 3: AI Module - Cerebras Integration (0/21 tasks)
- [ ] Phase 4: Frontend - Dashboard & Basic UI (0/37 tasks)
- [ ] Phase 5: AI-Powered NL Queries UI (0/15 tasks)
- [ ] Phase 6: Feature Flags Implementation (0/20 tasks)
- [ ] Phase 7: MCP Server & Docker Integration (0/48 tasks)
- [ ] Phase 8: Demo App & Documentation (0/52 tasks)

**Total Tasks: 274**

### Daily Progress Log

#### Day 1: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 2: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 3: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 4: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 5: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 6: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

#### Day 7: ___________
- Tasks completed: 
- Blockers: 
- Notes: 

---

## Critical Path (Must Complete for Minimal Demo)

These are the absolute must-haves for a working demo:

1. ✅ Backend API with event ingestion (Phase 1.6)
2. ✅ DuckDB setup with events table (Phase 1.3)
3. ✅ Browser SDK basic functions (Phase 2.2, 2.3)
4. ✅ Cerebras API integration (Phase 3.2, 3.3, 3.4)
5. ✅ Natural language query endpoint (Phase 3.5)
6. ✅ Frontend Dashboard (Phase 4.5)
7. ✅ Natural Language Query UI (Phase 5.1, 5.2)
8. ✅ MCP server with ask_question tool (Phase 7.8)
9. ✅ Docker setup (Phase 7.9, 7.10)
10. ✅ Demo video (Phase 8.3)
11. ✅ README (Phase 8.5)

**If you're running out of time, focus on these 11 items first.**

---

## Notes

- Update task status (🔴/🟡/🟢) as you progress
- Move tasks between phases if dependencies shift
- Add new tasks if you discover missing requirements
- Document blockers in daily progress log
- Don't be afraid to cut non-critical tasks if running behind schedule
- Remember: **A polished demo of core features beats half-finished everything**
