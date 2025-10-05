#!/usr/bin/env node

/**
 * Simple MCP Server Tester
 * Tests MCP server tools without needing Claude Desktop
 */

const { spawn } = require('child_process');
const path = require('path');

// Start MCP server
const server = spawn('node', [path.join(__dirname, 'dist/index.js')], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseBuffer = '';
let requestId = 0;

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  // Try to parse complete JSON responses
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // Keep incomplete line
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('\n📥 Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw output:', line);
      }
    }
  });
});

// Helper to send JSON-RPC request
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params
  };
  
  console.log('\n📤 Request:', JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Test sequence
console.log('🚀 Starting MCP Server Tests...\n');

setTimeout(() => {
  console.log('\n--- Test 1: List Available Tools ---');
  sendRequest('tools/list');
}, 500);

setTimeout(() => {
  console.log('\n--- Test 2: Get Active Users ---');
  sendRequest('tools/call', {
    name: 'get_active_users',
    arguments: {
      period: '7d'
    }
  });
}, 2000);

setTimeout(() => {
  console.log('\n--- Test 3: Get Top Events ---');
  sendRequest('tools/call', {
    name: 'get_top_events',
    arguments: {
      limit: 5
    }
  });
}, 4000);

setTimeout(() => {
  console.log('\n--- Test 4: Query Events ---');
  sendRequest('tools/call', {
    name: 'query_events',
    arguments: {
      event: 'pageview',
      limit: 10
    }
  });
}, 6000);

setTimeout(() => {
  console.log('\n✅ Tests complete! Shutting down...\n');
  server.kill();
  process.exit(0);
}, 8000);

// Handle errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});
