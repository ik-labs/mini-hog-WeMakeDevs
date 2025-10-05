# MCP Server CLI Demo Guide

## Quick Demo for Presentation

### **What is MCP?**
Model Context Protocol - A standard for connecting AI assistants to data sources and tools.

### **What We Built:**
- MCP server that exposes MiniHog analytics via standard protocol
- 4 tools: active users, top events, query events, retention summary
- Can be connected to Claude Desktop, custom AI agents, or any MCP client

---

## **Demo Script** (2 minutes)

### Step 1: Show the Server Code

```bash
cd apps/mcp-server
cat src/index.ts | head -100
```

**Say:** "We built an MCP server that exposes our analytics data through 4 tools"

---

### Step 2: List Available Tools

```bash
cd apps/mcp-server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | DATABASE_PATH=../../data/analytics.duckdb node dist/index.js 2>/dev/null | jq '.result.tools[] | {name, description}'
```

**Expected Output:**
```json
{
  "name": "get_active_users",
  "description": "Get active user counts..."
}
{
  "name": "get_top_events",
  "description": "Get the most frequently occurring events"
}
{
  "name": "query_events",
  "description": "Query events with optional filters"
}
{
  "name": "get_retention_summary",
  "description": "Get cohort retention summary metrics"
}
```

**Say:** "These tools can be called by any AI assistant that supports MCP"

---

### Step 3: Show Tool Schema (Optional)

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | DATABASE_PATH=../../data/analytics.duckdb node dist/index.js 2>/dev/null | jq '.result.tools[0]'
```

**Say:** "Each tool has a JSON schema describing its inputs"

---

### Step 4: Show Integration Point

```bash
cat claude_desktop_config.json | jq '.'
```

**Say:** "This config connects Claude Desktop to our MCP server, making our analytics queryable via natural language"

---

## **Alternative: Quick Feature Demo** (1 minute)

If time is limited, just show this:

```bash
# Show we have an MCP server
ls -la apps/mcp-server/

# Show it's built
ls -la apps/mcp-server/dist/

# Show the tools available
cat apps/mcp-server/src/index.ts | grep "name: '" | head -5
```

**Say:**
"We built an MCP server that exposes our analytics via the Model Context Protocol. This allows AI assistants like Claude to query our analytics data using natural language. It's production-ready and follows industry standards."

---

## **Key Points for Demo:**

1. ✅ **Standards-based:** Uses official MCP SDK from Anthropic
2. ✅ **Production-ready:** TypeScript, proper error handling
3. ✅ **Extensible:** Easy to add more tools
4. ✅ **Secure:** Read-only database access
5. ✅ **AI-native:** Works with Claude Desktop, custom agents

---

## **If Asked About Usage:**

"An AI assistant connected to this MCP server could answer questions like:
- 'How many active users do we have this week?'
- 'What are our top 10 events?'
- 'Show me all pageview events from user X'
- 'What's our retention looking like?'

All without writing SQL or API calls - just natural language."

---

## **Technical Highlights:**

- **Protocol:** JSON-RPC 2.0 over stdio
- **Transport:** StdioServerTransport (standard for MCP)
- **Database:** DuckDB (embedded analytics)
- **Language:** TypeScript with ES modules
- **SDK:** @modelcontextprotocol/sdk v1.0.4

---

## **Files to Show:**

1. `src/index.ts` - Main server implementation (400 lines)
2. `package.json` - Dependencies and scripts
3. `claude_desktop_config.json` - Integration config
4. `DEMO.md` - This guide

---

## **Troubleshooting:**

If demo fails:
1. Show the code instead (`cat src/index.ts`)
2. Show the tools list (`grep "name: '" src/index.ts`)
3. Show the config (`cat ../claude_desktop_config.json`)
4. Explain the concept and value proposition

The concept and architecture are impressive even if live demo has issues!

---

## **Value Proposition:**

"This MCP server makes our analytics **AI-queryable** out of the box. Any team member with Claude Desktop can ask questions in plain English and get insights instantly - no SQL, no API docs, no training needed."

🚀 **That's the power of MCP!**
