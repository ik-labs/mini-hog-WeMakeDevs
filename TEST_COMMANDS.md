# Quick Test Commands

Copy-paste these commands to test Minihog step-by-step.

---

## 1. Verify Ports Are Free

```bash
lsof -i :3000
lsof -i :3001
```

**Expected:** No output (ports are free) ✅

---

## 2. Start API (Terminal 1)

```bash
cd /Users/himeshp/apps/hackthons/minihog/apps/api
npm run dev
```

**Wait for:** `Nest application successfully started` ✅

**Keep this terminal running!**

---

## 3. Test API (Terminal 2 - New Terminal)

### Health Check
```bash
curl http://localhost:3000/api/health/healthz
```

**Expected:**
```json
{"status":"ok","timestamp":"..."}
```

### Ingest Test Event
```bash
curl -X POST http://localhost:3000/api/ingest/e \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "events": [{
      "event": "test_event",
      "distinct_id": "user1",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }]
  }'
```

**Expected:**
```json
{"success":true}
```

### Get Active Users
```bash
curl http://localhost:3000/api/analytics/active-users \
  -H "X-API-Key: YOUR_API_KEY"
```

**Expected:**
```json
{"dau":1,"wau":1,"mau":1}
```

### Get Top Events
```bash
curl http://localhost:3000/api/analytics/top-events \
  -H "X-API-Key: YOUR_API_KEY"
```

**Expected:**
```json
[{"event":"test_event","count":1}]
```

### Test Feature Flag - Create
```bash
curl -X POST http://localhost:3000/api/flags \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "key": "test_flag",
    "name": "Test Feature",
    "description": "Testing flags",
    "active": true,
    "rollout_percentage": 50
  }'
```

**Expected:** Flag details with ID

### Test Feature Flag - Evaluate
```bash
curl 'http://localhost:3000/api/ff?key=test_flag&distinct_id=user1' \
  -H "X-API-Key: YOUR_API_KEY"
```

**Expected:**
```json
{"success":true,"data":{"key":"test_flag","enabled":true/false,"variant":"treatment/control","reason":"..."}}
```

### Test AI Query (Cerebras) ⚡
```bash
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "question": "What are the top events by count?"
  }'
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "sql": "SELECT event, COUNT(*) as count FROM events GROUP BY event ORDER BY count DESC LIMIT 10",
    "results": [...],
    "insights": "...",
    "chartSuggestion": "bar"
  }
}
```

✅ **All API tests passing? Move to frontend!**

---

## 4. Start Frontend (Terminal 3 - New Terminal)

```bash
cd /Users/himeshp/apps/hackthons/minihog/apps/web
npm run dev
```

**Wait for:** `Local: http://localhost:3001` ✅

**Keep this terminal running!**

---

## 5. Test Frontend (Browser)

Open: **http://localhost:3001**

### ✅ Dashboard Page
- Should see metrics cards
- Active users count
- Top events list
- Recent activity

### ✅ AI Query Page
Click "AI Query" in sidebar

1. Type: **"What are the most popular events?"**
2. Press **Cmd+Enter** or click "Ask"
3. Wait for response (Cerebras AI)

**Expected:**
- SQL query with syntax highlighting
- Results table
- AI insights
- Chart visualization

### ✅ Analytics Page
Click "Analytics" in sidebar

1. Should see events table
2. Try time period: **7d**
3. Try filtering by event: **test_event**
4. Click properties to see JSON

### ✅ Feature Flags Page
Click "Flags" in sidebar

1. Should see **test_flag** you created
2. **Toggle** it on/off (see toast notification)
3. **Drag slider** to change rollout %
4. Click **"Test Evaluation"**:
   - Flag key: `test_flag`
   - User ID: `user1`
   - Click "Test"
   - See result

### ✅ Settings Page
Click "Settings" in sidebar

- Should see Cerebras API key (masked)
- Can update key

---

## 6. Send More Test Data

Want more data to visualize?

```bash
# Send 10 different events
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/ingest/e \
    -H "Content-Type: application/json" \
    -H "X-API-Key: YOUR_API_KEY" \
    -d '{
      "events": [{
        "event": "event_'$i'",
        "distinct_id": "user_'$((i % 3 + 1))'",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
        "properties": {"index": '$i'}
      }]
    }' && echo " ✓ Event $i sent"
  sleep 0.2
done
```

Then refresh the dashboard to see updated metrics!

---

## 7. Complete Test Checklist

### Backend API ✅
- [ ] Health check responds
- [ ] Events ingest successfully
- [ ] Active users endpoint works
- [ ] Top events endpoint works
- [ ] Feature flags CRUD works
- [ ] AI query with Cerebras works

### Frontend UI ✅
- [ ] Dashboard loads with metrics
- [ ] AI Query page works
- [ ] AI query returns results
- [ ] Keyboard shortcuts work (Cmd+Enter)
- [ ] Analytics page shows events
- [ ] Event filtering works
- [ ] Feature Flags page works
- [ ] Can create/toggle/test flags
- [ ] Settings page loads

---

## Troubleshooting

### API Not Starting
```bash
# Check if port is in use
lsof -i :3000

# Kill and restart
pkill -f node
cd /Users/himeshp/apps/hackthons/minihog/apps/api
npm run dev
```

### Wrong API Key Error
Check your `.env` has:
```bash
API_KEY=YOUR_API_KEY
```

Then restart API.

### Cerebras API Error
Check `.env` has valid key:
```bash
CEREBRAS_API_KEY=csk-...
```

### Frontend Can't Connect
Check API is running on port 3000:
```bash
curl http://localhost:3000/api/health/healthz
```

---

## Success! 🎉

If all tests pass:
- ✅ Backend API is working
- ✅ Frontend UI is working
- ✅ Cerebras AI integration is working
- ✅ Feature flags are working

**Next steps:**
- Record demo video
- Test MCP with Claude Desktop (optional)
- Test Docker deployment (optional)

---

**Quick Reference:**
- API: http://localhost:3000
- Web: http://localhost:3001
- API Key: `YOUR_API_KEY`
