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
- [x] 🟢 Create InsightsModule with controller and service
- [x] 🟢 Implement `GET /insights/trends` endpoint
- [x] 🟢 Add query parameters: event_name, from, to, interval
- [x] 🟢 Write DuckDB query for event counts over time
- [x] 🟢 Add time grouping logic (hour/day/week)
- [x] 🟢 Implement `GET /insights/active-users` (DAU/WAU/MAU)
- [x] 🟢 Implement `GET /insights/top-events` with limit parameter
- [x] 🟢 Optimize queries with proper WHERE clauses
- [ ] 🔴 Add query result caching (in-memory, 60s TTL)
- [x] 🟢 Test with sample data

### 1.9 Health Module
- [x] 🟢 Create HealthModule
- [x] 🟢 Implement `GET /healthz` (basic health check)
- [x] 🟢 Implement `GET /readyz` (DuckDB + SQLite connectivity check)
- [x] 🟢 Add disk space check

### 1.10 Cerebras API Setup
- [x] 🟢 Sign up for Cerebras Cloud (use code: wemakedevs) - MANUAL STEP
- [x] 🟢 Get API key and add to .env - MANUAL STEP
- [x] 🟢 Install SDK or HTTP client for Cerebras API
- [x] 🟢 Test basic inference call with Llama model
- [x] 🟢 Verify model availability (llama3.1-8b or llama-3.3-70b)
- [x] 🟢 Document API rate limits and quotas

---

## Phase 2: Browser SDK Development
**Timeline:** Day 3  
**Priority:** HIGH - Required for demo

### 2.1 SDK Project Setup
- [x] 🟢 Create `/packages/sdk` package
- [x] 🟢 Set up TypeScript config for browser target
- [x] 🟢 Install tsup/rollup for bundling
- [x] 🟢 Configure build to output ESM + IIFE
- [x] 🟢 Add package.json with build scripts

### 2.2 SDK Core Implementation
- [x] 🟢 Implement `init(config)` method
- [x] 🟢 Add config validation (endpoint, apiKey required)
- [x] 🟢 Implement `track(event, properties)` method
- [x] 🟢 Implement `page(properties?)` method (auto-capture URL)
- [x] 🟢 Implement `identify(distinctId, traits?)` method
- [x] 🟢 Generate anonymous_id using UUID
- [x] 🟢 Implement session_id generation and persistence

### 2.3 SDK Transport & Batching
- [x] 🟢 Implement event queue (in-memory array)
- [x] 🟢 Add batching logic (10 events OR 10 seconds)
- [x] 🟢 Implement flush() method to send batch
- [x] 🟢 Use fetch for normal sends
- [x] 🟢 Use navigator.sendBeacon on page unload
- [x] 🟢 Add retry logic with exponential backoff
- [x] 🟢 Handle network errors gracefully

### 2.4 SDK Context & Auto-capture
- [x] 🟢 Auto-capture URL, referrer, title on page()
- [x] 🟢 Extract UTM parameters from URL
- [x] 🟢 Add user-agent string to context
- [x] 🟢 Add timestamp (client-side) to all events
- [x] 🟢 Include SDK version in context

### 2.5 SDK Build & Distribution
- [x] 🟢 Build SDK bundle (minified)
- [x] 🟢 Generate TypeScript type definitions
- [x] 🟢 Test bundle size (target < 10KB gzipped)
- [x] 🟢 Create simple test HTML page
- [x] 🟢 Verify events reach backend

---

## Phase 3: AI Module - Cerebras Integration
**Timeline:** Day 3  
**Priority:** CRITICAL - Core differentiator

### 3.1 AI Module Setup
- [x] 🟢 Create AiModule in `/apps/api/src/ai`
- [x] 🟢 Create AiService for Cerebras API calls
- [x] 🟢 Add Cerebras API client configuration
- [x] 🟢 Create types for AI request/response

### 3.2 Prompt Engineering for Text-to-SQL
- [x] 🟢 Define DuckDB schema description for prompts
- [x] 🟢 Create system prompt for SQL generation
- [x] 🟢 Include example queries in prompt (few-shot learning)
- [x] 🟢 Add instructions for DuckDB-specific syntax
- [x] 🟢 Create prompt template function

### 3.3 Natural Language to SQL Service
- [x] 🟢 Implement `generateSql(question: string)` method
- [x] 🟢 Call Cerebras API with Llama model
- [x] 🟢 Parse SQL from AI response
- [x] 🟢 Add SQL validation (read-only, no DDL/DML)
- [x] 🟢 Implement SQL safety checks (no DELETE, DROP, etc.)
- [x] 🟢 Add query timeout limits
- [x] 🟢 Test with various natural language questions

### 3.4 Query Execution Service
- [x] 🟢 Implement `executeNaturalLanguageQuery(question)` method
- [x] 🟢 Generate SQL using Cerebras
- [x] 🟢 Execute SQL on DuckDB
- [x] 🟢 Format results as JSON
- [x] 🟢 Add error handling for invalid SQL
- [x] 🟢 Generate AI insights/summary of results
- [x] 🟢 Suggest chart type based on results

### 3.5 AI API Endpoints
- [x] 🟢 Create `POST /ai/query` endpoint
- [x] 🟢 Add request validation (question required)
- [x] 🟢 Return: question, sql, results, insights, chart_suggestion
- [x] 🟢 Add response time logging
- [ ] 🔴 Implement caching for identical questions
- [x] 🟢 Test with multiple question types

### 3.6 Performance Optimization
- [x] 🟢 Measure Cerebras API latency
- [x] 🟢 Optimize prompt length for faster inference
- [ ] 🔴 Add connection pooling if needed
- [x] 🟢 Target < 500ms for SQL generation

---

## Phase 4: Frontend - Dashboard & Basic UI
**Timeline:** Day 4 (Morning)  
**Priority:** MEDIUM - Needed for demo

### 4.1 Next.js Setup
- [x] 🟢 Create `/apps/web` with Next.js 15
- [x] 🟢 Use App Router (not Pages Router)
- [x] 🟢 Set up TypeScript config
- [x] 🟢 Install and configure Tailwind CSS
- [x] 🟢 Set up shadcn/ui (run init command)

### 4.2 shadcn/ui Components Installation
- [x] 🟢 Install button component
- [x] 🟢 Install card component
- [x] 🟢 Install table component
- [x] 🟢 Install input component
- [x] 🟢 Install select component
- [x] 🟢 Install badge component
- [x] 🟢 Install lucide-react for icons

### 4.3 API Client & Data Fetching
- [x] 🟢 Install @tanstack/react-query
- [x] 🟢 Set up QueryClient and provider
- [x] 🟢 Create API client helper functions
- [x] 🟢 Create custom hooks for queries (useEvents, useTrends)

### 4.4 Layout & Navigation
- [x] 🟢 Create root layout with sidebar
- [x] 🟢 Add navigation menu (Dashboard, AI Query, Analytics, Settings)
- [x] 🟢 Add logo/branding
- [x] 🟢 Implement responsive layout

### 4.5 Dashboard Page
- [x] 🟢 Create `/app/page.tsx` (Dashboard)
- [x] 🟢 Add KPI cards: DAU, WAU, MAU
- [x] 🟢 Fetch stats from `/analytics/active-users`
- [x] 🟢 Install Recharts
- [x] 🟢 Create simple line chart for events over time (24h)
- [x] 🟢 Add "Top Events" list (shows top 5 events with counts)
- [x] 🟢 Add auto-refresh (30s interval)
- [x] 🟢 Add loading skeletons

### 4.6 Events Explorer Page
- [x] 🟢 Create `/app/analytics/page.tsx` (placeholder for now)
- [x] 🟢 Fetch events from backend
- [x] 🟢 Display in TanStack Table
- [x] 🟢 Add columns: timestamp, event, distinct_id, properties
- [x] 🟢 Add time range filter (today, 7d, 30d)
- [x] 🟢 Add event name filter
- [x] 🟢 Add search by distinct_id
- [x] 🟢 Add pagination (20 per page)
- [x] 🟢 Make properties column expandable (JSON view)

### 4.7 Settings Page
- [x] 🟢 Create `/app/settings/page.tsx`
- [x] 🟢 Display API key (masked, with copy button)
- [x] 🟢 Create SDK snippet generator
- [x] 🟢 Add code block with syntax highlighting
- [x] 🟢 Add "Copy to clipboard" functionality
- [x] 🟢 Add Cerebras API key configuration form (optional)

---

## Phase 5: AI-Powered Natural Language Queries UI
**Timeline:** Day 4 (Afternoon)  
**Priority:** CRITICAL - Key demo feature

### 5.1 Natural Language Query Page
- [x] 🟢 Create `/app/query/page.tsx`
- [x] 🟢 Add large text input for questions
- [x] 🟢 Add example questions as clickable chips
- [x] 🟢 Add "Ask" button with loading state
- [x] 🟢 Create mutation hook for `/ai/query` endpoint

### 5.2 Query Results Display
- [x] 🟢 Show "Generating SQL..." loading state with Cerebras branding
- [x] 🟢 Display generated SQL in code block (with syntax highlighting)
- [x] 🟢 Show query execution time
- [x] 🟢 Display results in table format
- [x] 🟢 Add chart visualization based on chart_suggestion
- [x] 🟢 Display AI-generated insights/summary
- [x] 🟢 Add error handling with helpful messages

### 5.3 Query History (Optional Enhancement)
- [x] 🟢 Show last 5 queries in sidebar
- [x] 🟢 Make them clickable to re-run
- [x] 🟢 Store in localStorage

### 5.4 Polish & UX
- [x] 🟢 Add keyboard shortcut (Cmd/Ctrl + Enter to submit)
- [x] 🟢 Add animation for loading state
- [x] 🟢 Add "Powered by Cerebras + Llama" badge
- [x] 🟢 Test with various question types
- [x] 🟢 Handle edge cases (empty results, errors)

---

## Phase 6: Feature Flags Implementation
**Timeline:** Day 4 (Evening)  
**Priority:** HIGH - Shows feature completeness

### 6.1 Flags Backend - CRUD Endpoints
- [x] 🟢 Create FlagsModule with controller and service
- [x] 🟢 Implement `GET /flags` (list all flags)
- [x] 🟢 Implement `POST /flags` (create flag)
- [x] 🟢 Implement `GET /flags/:key` (get single flag)
- [x] 🟢 Implement `PATCH /flags/:key` (update flag)
- [x] 🟢 Implement `DELETE /flags/:key` (delete flag)
- [x] 🟢 Add Zod validation for flag payloads

### 6.2 Flag Evaluation Logic
- [x] 🟢 Implement deterministic bucketing algorithm (hash-based)
- [x] 🟢 Use distinct_id + flag_key for consistent hashing
- [x] 🟢 Compare hash to rollout_percentage
- [x] 🟢 Implement sticky assignment (store in flag_decisions table)
- [x] 🟢 Create `GET /ff?key=...&distinct_id=...` endpoint
- [x] 🟢 Return: enabled (boolean), reason (string)

### 6.3 SDK Flag Support
- [x] 🟢 Add `getFlag(key, defaultValue?)` method to SDK
- [x] 🟢 Store flag values in localStorage for persistence
- [x] 🟢 Implement fetch from `/ff` endpoint
- [x] 🟢 Add callback for flag changes (optional)

### 6.4 Flags Frontend UI
- [x] 🟢 Create `/app/flags/page.tsx`
- [x] 🟢 Display list of flags in cards/table
- [x] 🟢 Show: key, name, active status, rollout %
- [x] 🟢 Add "Create Flag" button and modal
- [x] 🟢 Add toggle to enable/disable flag
- [x] 🟢 Add slider to adjust rollout percentage
- [x] 🟢 Add "Test Evaluation" section (enter distinct_id, see result)
- [x] 🟢 Add delete confirmation dialog

---

## Phase 7: MCP Server & Docker Integration
**Timeline:** Day 5-6  
**Priority:** CRITICAL - Docker track requirement

### 7.1 MCP Module Setup
- [x] 🟢 Create McpModule in `/apps/api/src/mcp`
- [x] 🟢 Install MCP TypeScript SDK (@modelcontextprotocol/sdk)
- [x] 🟢 Create MCP server instance
- [x] 🟢 Configure server metadata (name, version, description)

### 7.2 MCP Tool 1: get_trend
- [x] 🟢 Define tool schema with parameters
- [x] 🟢 Implement handler: call InsightsService.getTrends()
- [x] 🟢 Format response as required JSON structure
- [ ] 🔴 Test with MCP inspector

### 7.3 MCP Tool 2: get_active_users
- [x] 🟢 Define tool schema
- [x] 🟢 Implement handler: call InsightsService.getActiveUsers()
- [x] 🟢 Return DAU/WAU/MAU
- [ ] 🔴 Test with MCP inspector

### 7.4 MCP Tool 3: get_top_events
- [x] 🟢 Define tool schema with limit parameter
- [x] 🟢 Implement handler: query top events from DuckDB
- [x] 🟢 Return event names and counts
- [ ] 🔴 Test with MCP inspector

### 7.5 MCP Tool 4: evaluate_flag
- [x] 🟢 Define tool schema with distinct_id and flag_key
- [x] 🟢 Implement handler: call FlagsService.evaluate()
- [x] 🟢 Return enabled + reason
- [ ] 🔴 Test with MCP inspector

### 7.6 MCP Tool 5: get_user_timeline
- [x] 🟢 Define tool schema with distinct_id and limit
- [x] 🟢 Implement handler: query events for user from DuckDB
- [x] 🟢 Return chronological event list
- [ ] 🔴 Test with MCP inspector

### 7.7 MCP Tool 6: run_query
- [x] 🟢 Define tool schema with sql parameter
- [x] 🟢 Implement SQL safety validation
- [x] 🟢 Execute query on DuckDB
- [x] 🟢 Return columns + rows
- [x] 🟢 Add error handling for invalid SQL
- [ ] 🔴 Test with MCP inspector

### 7.8 MCP Tool 7: ask_question (Cerebras-powered)
- [x] 🟢 Define tool schema with question parameter
- [x] 🟢 Implement handler: call AiService.executeNaturalLanguageQuery()
- [x] 🟢 Return: question, sql, results, insights, chart_suggestion
- [x] 🟢 Ensure Cerebras API is called internally
- [ ] 🔴 Test with various questions via MCP inspector

### 7.9 Docker Configuration
- [x] 🟢 Create Dockerfile for backend API
- [x] 🟢 Create Dockerfile for MCP server (if separate)
- [x] 🟢 Create docker-compose.yml with all services
- [x] 🟢 Add volume mounts for DuckDB/SQLite persistence
- [x] 🟢 Configure environment variables in docker-compose
- [x] 🟢 Add healthcheck directives

### 7.10 Docker MCP Gateway Integration
- [x] 🟢 Read Docker MCP Gateway documentation
- [x] 🟢 Configure MCP server to expose via Docker MCP Gateway
- [x] 🟢 Create MCP configuration file (claude_desktop_config.json)
- [x] 🟢 Create MCP_SETUP.md with complete instructions
- [ ] 🔴 Test MCP server accessibility (USER MUST DO - requires running Docker)

### 7.11 Testing with Claude Desktop
- [x] 🟢 Create Claude Desktop configuration template
- [x] 🟢 Document configuration steps for macOS/Windows
- [x] 🟢 Create testing checklist for all 7 MCP tools
- [x] 🟢 Document troubleshooting steps
- [ ] 🔴 Install Claude Desktop (USER MUST DO)
- [ ] 🔴 Test each MCP tool via Claude conversations (USER MUST DO)
- [ ] 🔴 Verify Cerebras integration in `ask_question` tool (USER MUST DO)
- [ ] 🔴 Record test interactions for demo video (USER MUST DO)

### 7.12 Docker Build & Run
- [x] 🟢 Create DOCKER_DEPLOYMENT.md with complete guide
- [x] 🟢 Document build commands and testing procedures
- [x] 🟢 Create troubleshooting guide
- [x] 🟢 Document monitoring and resource management
- [ ] 🔴 Build all Docker images (USER MUST DO - requires Docker)
- [ ] 🔴 Test docker-compose up (USER MUST DO)
- [ ] 🔴 Verify all services start successfully (USER MUST DO)
- [ ] 🔴 Test API endpoints from within containers (USER MUST DO)
- [ ] 🔴 Fix any networking issues if they arise (USER MUST DO)

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
- [x] Phase 1: Project Setup & Backend Foundation (59/61 tasks - 97%)
- [x] Phase 2: Browser SDK Development (20/20 tasks - 100%)
- [x] Phase 3: AI Module - Cerebras Integration (19/21 tasks - 90%)
- [x] Phase 4: Frontend - Dashboard & Basic UI (37/37 tasks - 100%)
- [x] Phase 5: AI-Powered NL Queries UI (18/18 tasks - 100%)
- [x] Phase 6: Feature Flags Implementation (20/20 tasks - 100%)
- [x] Phase 7: MCP Server & Docker Integration (42/48 tasks - 88%)
- [ ] Phase 8: Demo App & Documentation (0/52 tasks - 0%)

**Total Tasks: 277**
**Completed: 215/277 (78%)**

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
