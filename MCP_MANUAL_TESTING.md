# MCP Server Manual Testing Guide

Easy ways to test your MCP server **without** Claude Desktop.

## Method 1: Automated Test Script (Easiest)

### Run the test script:
```bash
cd apps/mcp-server
node test-mcp.js
```

This will automatically:
1. Start the MCP server
2. List available tools
3. Test get_active_users
4. Test get_top_events  
5. Test query_events
6. Show all responses
7. Shut down cleanly

**Expected Output:**
```
🚀 Starting MCP Server Tests...

--- Test 1: List Available Tools ---
📤 Request: {
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

📥 Response: {
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_active_users",
        "description": "Get active user counts...",
        ...
      }
    ]
  }
}
...
```

---

## Method 2: Interactive Manual Testing

### Start the server:
```bash
cd apps/mcp-server
node dist/index.js
```

### Send test commands (in same terminal):

**List tools:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

**Get active users:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_active_users","arguments":{"period":"7d"}}}' | node dist/index.js
```

**Get top events:**
```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_top_events","arguments":{"limit":5}}}' | node dist/index.js
```

**Query events:**
```bash
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"query_events","arguments":{"event":"pageview","limit":10}}}' | node dist/index.js
```

---

## Method 3: Node.js REPL Testing

```bash
cd apps/mcp-server
node
```

Then in Node REPL:
```javascript
const { spawn } = require('child_process');
const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'inherit'] });

// Listen to responses
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});

// Send request
function call(method, params) {
  const req = { jsonrpc: '2.0', id: Date.now(), method, params };
  server.stdin.write(JSON.stringify(req) + '\n');
}

// Test it
call('tools/list');
call('tools/call', { name: 'get_active_users', arguments: { period: '7d' } });
```

---

## Method 4: cURL via HTTP Proxy (If you add HTTP support)

If you modify MCP server to also listen on HTTP:

```bash
curl -X POST http://localhost:3333/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

---

## Method 5: Docker Testing

### Build MCP container:
```bash
docker build -t minihog-mcp -f apps/mcp-server/Dockerfile .
```

### Run MCP server:
```bash
docker run -it --rm \
  -e DATABASE_PATH=/data/analytics.duckdb \
  -v $(pwd)/data:/data \
  minihog-mcp
```

### Test from another terminal:
```bash
docker exec -it <container-id> node test-mcp.js
```

---

## Method 6: Python Test Client

```python
#!/usr/bin/env python3
import subprocess
import json
import sys

# Start MCP server
server = subprocess.Popen(
    ['node', 'dist/index.js'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

def send_request(method, params=None):
    request = {
        'jsonrpc': '2.0',
        'id': 1,
        'method': method
    }
    if params:
        request['params'] = params
    
    server.stdin.write(json.dumps(request) + '\n')
    server.stdin.flush()
    
    response = server.stdout.readline()
    return json.loads(response)

# Test
print(send_request('tools/list'))
print(send_request('tools/call', {
    'name': 'get_active_users',
    'arguments': {'period': '7d'}
}))

server.terminate()
```

---

## Quick Verification Checklist

After running any test method, verify:

- ✅ Server starts without errors
- ✅ `tools/list` returns 4 tools:
  - `get_active_users`
  - `get_top_events`
  - `query_events`
  - `track_event`
- ✅ Each tool call returns valid JSON
- ✅ Data matches your analytics database
- ✅ No error messages in stderr

---

## Common Issues & Solutions

### Issue: "Cannot find module 'dist/index.js'"
**Solution:** Build first:
```bash
npm run build
```

### Issue: "Database not found"
**Solution:** Set correct path:
```bash
export DATABASE_PATH=/Users/himeshp/apps/hackthons/minihog/data/analytics.duckdb
node dist/index.js
```

### Issue: "No response"
**Solution:** MCP uses stdio - ensure you're sending complete JSON + newline:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

### Issue: "Parse error"
**Solution:** Check JSON syntax - must be valid JSON-RPC 2.0:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

---

## Recommended Testing Flow

1. **Quick sanity check:**
   ```bash
   node test-mcp.js
   ```

2. **Interactive testing:**
   ```bash
   node dist/index.js
   # Then send JSON commands
   ```

3. **Integration testing:**
   - Test with Claude Desktop (if needed)
   - Or build custom client

4. **Production validation:**
   - Docker container testing
   - Load testing
   - Error handling

---

## Next Steps

- ✅ Use `test-mcp.js` for quick testing
- ✅ Verify all 4 tools work correctly
- ✅ Check data accuracy against database
- ✅ Test error scenarios (invalid params, etc.)
- ✅ Optional: Add HTTP endpoint for easier testing
- ✅ Optional: Create Postman collection

**The `test-mcp.js` script is the easiest way - just run it and see all tests!** 🚀
