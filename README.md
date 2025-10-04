# Minihog 🦔

> Self-hosted analytics platform with AI-powered natural language querying

**Built for FutureStack GenAI Hackathon** - Integrating Cerebras API, Llama 3, and Docker MCP Gateway

## 🚀 Status

🏗️ **Under Active Development** - Phase 1 Complete

## 🎯 Features (Planned)

- 📊 **Real-time Event Analytics** - Track user events with DuckDB-powered insights
- 🤖 **AI-Powered Queries** - Ask questions in natural language using Cerebras + Llama
- 🎛️ **Feature Flags** - Boolean flags with sticky bucketing
- 🔌 **MCP Integration** - Expose analytics via Docker MCP Gateway for AI agents
- 🏠 **Self-Hosted** - No third-party services, full data ownership

## 🛠️ Tech Stack

### Backend
- **NestJS** + Fastify
- **DuckDB** (Analytics)
- **SQLite** (Metadata)
- **Cerebras API** + Llama 3.1/3.3

### Frontend
- **Next.js 15** (App Router)
- **shadcn/ui** + Tailwind CSS
- **Recharts** for visualizations

### SDK
- **TypeScript** browser SDK with batching

### AI & DevOps
- **Docker** + Docker MCP Gateway
- **Model Context Protocol** (MCP)

## 📦 Monorepo Structure

```
minihog/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js frontend
│   └── demo/         # Demo application
├── packages/
│   ├── sdk/          # Browser SDK
│   └── shared/       # Shared types & schemas
└── docs/             # Documentation
```

## 🚀 Getting Started

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   # Get your Cerebras API key from https://cloud.cerebras.ai
   # Edit apps/api/.env and add your key:
   nano apps/api/.env
   ```

3. **Start Backend API**
   ```bash
   cd apps/api
   npm run dev
   # API runs on http://localhost:3000
   ```

4. **Find Your API Key**
   
   On first startup, the API auto-generates a secure API key. To find it:
   ```bash
   sqlite3 data/metadata.db "SELECT key FROM api_keys WHERE active=1;"
   ```
   
   You'll see something like: `mh_live_abc123...`
   
   **Save this key!** You'll need it for all API requests.

5. **Start Frontend**
   ```bash
   cd apps/web
   npm run dev
   # Web UI runs on http://localhost:3001
   ```

6. **Test Event Ingestion**
   ```bash
   # Use the API key from step 4
   curl -X POST http://localhost:3000/api/ingest/e \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_API_KEY_HERE" \
     -d '{
       "events": [{
         "event": "test",
         "distinct_id": "user1",
         "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
       }]
     }'
   ```

### 📚 Detailed Guides

- **Quick Testing (10 min):** See [QUICK_START.md](./QUICK_START.md)
- **Complete Testing (45 min):** See [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)
- **Docker Deployment:** See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **MCP with Claude Desktop:** See [MCP_SETUP.md](./MCP_SETUP.md)
- **Test Commands Reference:** See [TEST_COMMANDS.md](./TEST_COMMANDS.md)

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Cerebras](https://cerebras.ai/) - Ultra-fast AI inference
- [Meta Llama](https://llama.com/) - Open-source LLM
- [Docker MCP Gateway](https://www.docker.com/products/mcp-catalog-and-toolkit/) - AI agent integration
