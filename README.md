# Minihog 🦔

> Self-hosted analytics platform with AI-powered natural language querying

**Built for FutureStack GenAI Hackathon** - Integrating Cerebras API, Llama 3, and Model Context Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)

---

## ✨ Features

- 📊 **Real-time Event Analytics** - Track user events with DuckDB-powered insights
- 🤖 **AI-Powered Queries** - Ask questions in natural language using Cerebras + Llama
- 📈 **Advanced Analytics** - Funnels, retention cohorts, trends, and more
- 🎛️ **Feature Flags** - Boolean flags with sticky bucketing
- 🔌 **MCP Integration** - Expose analytics to AI agents like Claude Desktop
- 🏠 **Self-Hosted** - No third-party services, full data ownership
- ⚡ **Fast & Efficient** - DuckDB OLAP engine with sub-second queries

---

## 🎯 Quick Start

### 1. Install

```bash
git clone https://github.com/your-org/minihog.git
cd minihog
npm install
```

### 2. Configure

```bash
# Get Cerebras API key from https://cloud.cerebras.ai
cd apps/api
cp .env.example .env
nano .env  # Add your CEREBRAS_API_KEY
```

### 3. Start

```bash
# Terminal 1: API
cd apps/api
npm run dev

# Terminal 2: Web UI
cd apps/web
npm run dev
```

### 4. Get API Key

```bash
# Find auto-generated key
cd apps/api
sqlite3 data/metadata.db "SELECT key FROM api_keys WHERE active=1;"
```

### 5. Test

```bash
curl -X POST http://localhost:3000/api/ingest/e \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"events":[{"distinct_id":"user1","event":"test"}]}'
```

Visit **http://localhost:3001** for the dashboard! 🎉

---

## 📚 Documentation

### Getting Started
- **[Quick Start](./QUICK_START.md)** - 10-minute guided setup
- **[Development Guide](./docs/DEVELOPMENT.md)** - Complete dev setup, testing, and architecture

### Deployment
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Digital Ocean, Docker, and production setup

### Advanced
- **[MCP Integration](./docs/MCP.md)** - Connect to Claude Desktop and AI agents

### Package Documentation
- **[SDK README](./packages/sdk/README.md)** - Browser SDK usage
- **[Web README](./apps/web/README.md)** - Frontend documentation
- **[MCP Demo](./apps/mcp-server/DEMO.md)** - MCP server walkthrough

---

## 🏗️ Architecture

```
┌─────────────┐
│  Browser    │
│    SDK      │
└──────┬──────┘
       │ HTTP POST
       ▼
┌─────────────┐     ┌──────────────┐
│   NestJS    │────▶│   DuckDB     │  Analytics (OLAP)
│     API     │     │  (events)    │
│             │────▶│   SQLite     │  Metadata (OLTP)
└──────┬──────┘     └──────────────┘
       │
       ├─────▶ Next.js Dashboard
       ├─────▶ MCP Server (Claude Desktop)
       └─────▶ AI Queries (Cerebras + Llama)
```

### Tech Stack

**Backend:**
- NestJS + Fastify
- DuckDB (analytics)
- SQLite (metadata)
- Cerebras API + Llama 3.1/3.3

**Frontend:**
- Next.js 15 (App Router)
- shadcn/ui + Tailwind CSS
- Recharts for visualizations

**Integration:**
- Model Context Protocol (MCP)
- TypeScript SDK
- Docker deployment

---

## 🚀 Features Breakdown

### Analytics

- **Dashboard** - Real-time metrics and visualizations
- **Event Tracking** - Flexible event ingestion with properties
- **Active Users** - DAU, WAU, MAU calculations
- **Top Events** - Most frequent events with percentages
- **Trends** - Time-series event analysis
- **Funnels** - Multi-step conversion analysis
- **Retention** - Cohort retention analysis (daily/weekly/monthly)

### AI-Powered

- **Natural Language Queries** - Ask questions in plain English
- **SQL Generation** - AI converts text to optimized SQL
- **Smart Insights** - Automated pattern detection
- **MCP Tools** - Expose analytics to AI assistants

### Developer Experience

- **Type-Safe** - Full TypeScript throughout
- **Monorepo** - Organized with Turbo
- **Hot Reload** - Fast development workflow
- **API Documentation** - OpenAPI/Swagger (coming soon)

---

## 📊 Example Queries

### Via API

```bash
# Get overview
curl http://localhost:3000/api/insights/overview \
  -H "X-API-Key: your_key"

# Funnel analysis
curl -X POST http://localhost:3000/api/insights/funnel \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      {"event": "page_viewed", "name": "Landing"},
      {"event": "signup_started", "name": "Signup"},
      {"event": "signup_completed", "name": "Complete"}
    ],
    "timeWindow": "30d"
  }'

# AI Query
curl -X POST http://localhost:3000/api/ai/query \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me total events by day for the last week"}'
```

### Via Claude Desktop (MCP)

```
"What are my top events?"
"How many active users do I have?"
"Show me weekly retention cohorts"
"What events did user_123 trigger today?"
```

---

## 🎨 Screenshots

_Dashboard showing real-time analytics with 9K+ events_

![Dashboard](./docs/images/dashboard.png) _(coming soon)_

_AI-powered natural language queries_

![AI Queries](./docs/images/ai-queries.png) _(coming soon)_

_Funnel analysis with conversion rates_

![Funnels](./docs/images/funnels.png) _(coming soon)_

---

## 🗂️ Project Structure

```
minihog/
├── apps/
│   ├── api/              # NestJS backend
│   ├── web/              # Next.js frontend  
│   └── mcp-server/       # MCP integration
├── packages/
│   ├── shared/           # Shared types & schemas
│   └── sdk/              # Browser SDK
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── Dockerfile            # Production deployment
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Start all apps
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint & format
npm run lint
npm run format

# Seed test data (10K events)
npm run seed
```

See **[Development Guide](./docs/DEVELOPMENT.md)** for detailed instructions.

---

## 🚢 Deployment

### Digital Ocean (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Create app on Digital Ocean App Platform
# 3. Connect repository
# 4. Use Dockerfile build strategy
# 5. Set environment variables
# 6. Deploy!
```

### Docker

```bash
# Build
docker build -t minihog-api .

# Run
docker run -d \
  -p 8080:8080 \
  -e API_KEY=your_key \
  -e CEREBRAS_API_KEY=your_key \
  -v $(pwd)/data:/app/data \
  minihog-api
```

See **[Deployment Guide](./docs/DEPLOYMENT.md)** for complete instructions.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT © [Your Name]

---

## 🙏 Acknowledgments

Built with:
- [Cerebras](https://cerebras.ai/) - Ultra-fast AI inference
- [Meta Llama](https://llama.com/) - Open-source LLM
- [DuckDB](https://duckdb.org/) - In-process analytical database
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration standard
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components

---

## 🔗 Links

- **Documentation:** [./docs](./docs)
- **Issues:** [GitHub Issues](https://github.com/your-org/minihog/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/minihog/discussions)
- **Cerebras Docs:** [inference-docs.cerebras.ai](https://inference-docs.cerebras.ai/)
- **MCP Spec:** [spec.modelcontextprotocol.io](https://spec.modelcontextprotocol.io/)

---

**Star ⭐ this repo if you find it useful!**
