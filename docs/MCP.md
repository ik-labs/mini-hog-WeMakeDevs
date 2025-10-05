# Model Context Protocol (MCP) Integration

Complete guide for using Minihog's MCP server with AI agents like Claude Desktop.

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Quick Setup](#quick-setup)
- [Available Tools](#available-tools)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Testing](#testing)
- [Development](#development)

---

## What is MCP?

Model Context Protocol (MCP) is a standard for connecting AI assistants to external data sources and tools. Minihog's MCP server exposes analytics data to AI agents, allowing them to query your analytics database using natural language.

### Use Cases

- **Claude Desktop:** Ask "What are my top events?" directly in Claude
- **AI Agents:** Build automated analytics workflows
- **Custom Tools:** Integrate analytics into any MCP-compatible app

---

## Quick Setup

### Prerequisites

- Minihog API running (local or deployed)
- Claude Desktop installed
- Node.js 20+

### 5-Minute Setup

1. **Configure Claude Desktop**

Create/edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "minihog": {
      "command": "node",
      "args": [
        "/path/to/minihog/apps/mcp-server/dist/index.js"
      ],
      "env": {
        "API_URL": "http://localhost:3000/api",
        "API_KEY": "your_api_key_here"
      }
    }
  }
}
```

2. **Build MCP Server**

```bash
cd apps/mcp-server
npm run build
```

3. **Restart Claude Desktop**

Quit and reopen Claude Desktop. You should see "🔌 MCP: minihog" in the status bar.

4. **Test It!**

Ask Claude:
```
"What are my top events?"
"How many active users do I have?"
"Show me retention data for the last 30 days"
```

---

## Available Tools

### 1. get_active_users

Get active user counts (DAU/WAU/MAU).

**Arguments:**
- `period` (string, optional): Time period - `24h`, `7d`, or `30d`. Default: `7d`

**Example:**
```
"How many users were active in the last 24 hours?"
```

**Returns:**
```json
{
  "dau": 150,
  "wau": 450,
  "mau": 1200,
  "period": "24h"
}
```

### 2. get_top_events

Get most frequent events with counts.

**Arguments:**
- `limit` (number, optional): Number of events to return. Default: 10

**Example:**
```
"Show me the top 5 events"
```

**Returns:**
```json
{
  "events": [
    {"event": "pageview", "count": 5000, "percentage": 45.5},
    {"event": "click", "count": 3000, "percentage": 27.3}
  ],
  "total": 11000
}
```

### 3. query_events

Query events with filters.

**Arguments:**
- `event_name` (string, optional): Filter by event name
- `distinct_id` (string, optional): Filter by user ID
- `start_date` (string, optional): Start date (ISO 8601)
- `end_date` (string, optional): End date (ISO 8601)
- `limit` (number, optional): Max results. Default: 100

**Example:**
```
"Show me pageview events from user_123 in the last week"
```

**Returns:**
```json
{
  "events": [
    {
      "id": "evt_123",
      "distinct_id": "user_123",
      "event": "pageview",
      "properties": {"page": "/home"},
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "limit": 100
}
```

### 4. get_retention_summary

Get retention cohort analysis.

**Arguments:**
- `period` (string, optional): Cohort period - `daily`, `weekly`, or `monthly`. Default: `weekly`
- `event_name` (string, optional): Event to track for retention

**Example:**
```
"Show me weekly retention for the signup event"
```

**Returns:**
```json
{
  "cohorts": [
    {
      "cohort": "2025-W01",
      "users": 100,
      "retention": {
        "P0": 100,
        "P1": 85,
        "P2": 70,
        "P3": 60
      }
    }
  ],
  "summary": {
    "p1_avg": 85,
    "p7_avg": 65,
    "p30_avg": 45
  }
}
```

---

## Claude Desktop Integration

### Configuration

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Full Configuration Example

```json
{
  "mcpServers": {
    "minihog": {
      "command": "node",
      "args": [
        "/Users/username/projects/minihog/apps/mcp-server/dist/index.js"
      ],
      "env": {
        "API_URL": "http://localhost:3000/api",
        "API_KEY": "mh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Using with Production API

```json
{
  "mcpServers": {
    "minihog": {
      "command": "node",
      "args": [
        "/path/to/minihog/apps/mcp-server/dist/index.js"
      ],
      "env": {
        "API_URL": "https://your-api.ondigitalocean.app/api",
        "API_KEY": "mh_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

### Verification

1. **Check Status Bar**
   - Open Claude Desktop
   - Look for "🔌 MCP: minihog" in bottom status bar
   - If green dot, connection is active

2. **Test Commands**
   Ask Claude:
   ```
   "List available MCP tools"
   "What analytics tools do you have?"
   ```

3. **View Logs**
   ```bash
   # macOS
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

---

## Testing

### Manual CLI Test

Test without Claude Desktop:

```bash
cd apps/mcp-server

# Build
npm run build

# Set environment
export API_URL=http://localhost:3000/api
export API_KEY=your_key_here

# Run
node dist/index.js
```

Then send JSON-RPC requests:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

### Demo Script

Use the included demo script:

```bash
cd apps/mcp-server
chmod +x demo-cli.sh
./demo-cli.sh
```

This will:
1. ✅ Check API connection
2. ✅ List available tools
3. ✅ Test each tool with sample data
4. ✅ Show formatted results

### Automated Testing

```bash
cd apps/mcp-server
npm run test
```

---

## Development

### Project Structure

```
apps/mcp-server/
├── src/
│   └── index.ts          # Main MCP server
├── dist/                 # Built files
├── package.json
├── tsconfig.json
└── demo-cli.sh          # Testing script
```

### Adding New Tools

1. **Define Tool**

```typescript
// In index.ts
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools
    {
      name: 'my_new_tool',
      description: 'Description for AI',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Parameter description'
          }
        }
      }
    }
  ]
}));
```

2. **Implement Handler**

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'my_new_tool') {
    const { param1 } = request.params.arguments;
    
    // Call API
    const response = await fetch(`${apiUrl}/your-endpoint`, {
      headers: { 'X-API-Key': apiKey }
    });
    
    // Return results
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }
});
```

3. **Build and Test**

```bash
npm run build
./demo-cli.sh
```

### Debugging

**Enable verbose logging:**
```json
{
  "env": {
    "LOG_LEVEL": "debug"
  }
}
```

**Check Claude logs:**
```bash
# macOS
open ~/Library/Logs/Claude/

# View specific log
tail -f ~/Library/Logs/Claude/mcp-server-minihog.log
```

**Test API connection:**
```bash
curl http://localhost:3000/api/health/healthz \
  -H "X-API-Key: your_key"
```

---

## Troubleshooting

### "MCP server not found"

1. Check file path in config is absolute
2. Verify `dist/index.js` exists:
   ```bash
   ls -la apps/mcp-server/dist/index.js
   ```
3. Rebuild if needed:
   ```bash
   cd apps/mcp-server && npm run build
   ```

### "Connection refused"

1. Verify API is running:
   ```bash
   curl http://localhost:3000/api/health/healthz
   ```
2. Check `API_URL` in config matches API location
3. Ensure API_KEY is correct

### "Invalid response"

1. Check API_KEY has permissions
2. Verify API endpoints are responding:
   ```bash
   curl http://localhost:3000/api/insights/top-events \
     -H "X-API-Key: your_key"
   ```
3. Check for API errors in logs

### Claude Desktop not showing tools

1. Quit Claude Desktop completely
2. Verify config syntax (use JSON validator)
3. Restart Claude Desktop
4. Check status bar for MCP indicator
5. View logs for errors

---

## Security

### API Key Protection

- ✅ API keys in config are stored locally
- ✅ Not transmitted except to your API
- ✅ Use read-only keys if possible

### Network Security

**Local development:**
```json
{
  "API_URL": "http://localhost:3000/api"
}
```

**Production:**
```json
{
  "API_URL": "https://your-api.com/api"  // HTTPS only!
}
```

### Permissions

The MCP server only has access to:
- Analytics queries (read-only)
- No write/delete operations
- No admin functions
- No user data modification

---

## Examples

### Example Queries for Claude

**Basic Analytics:**
```
"What are my top 10 events?"
"How many daily active users do I have?"
"Show me all click events from today"
```

**Time-based:**
```
"Show me pageviews from the last 7 days"
"What's my user retention looking like?"
"Give me weekly active users"
```

**User-specific:**
```
"Show me all events for user_123"
"What events did user_abc trigger today?"
```

**Retention:**
```
"Show me weekly retention cohorts"
"What's the retention rate for new signups?"
"Display monthly retention analysis"
```

---

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Claude Desktop MCP Docs](https://docs.anthropic.com/claude/docs/mcp)
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

## Demo Video

See `apps/mcp-server/DEMO.md` for a walkthrough of using the MCP server with Claude Desktop.

---

## Support

Issues with MCP integration? Check:
1. Claude Desktop logs
2. API connectivity
3. Config file syntax
4. Tool availability via demo script
