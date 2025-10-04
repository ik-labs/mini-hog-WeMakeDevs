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

> Full setup instructions coming soon

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Cerebras](https://cerebras.ai/) - Ultra-fast AI inference
- [Meta Llama](https://llama.com/) - Open-source LLM
- [Docker MCP Gateway](https://www.docker.com/products/mcp-catalog-and-toolkit/) - AI agent integration
