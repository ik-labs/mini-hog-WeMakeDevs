# Deploy to Digital Ocean App Platform

**Much faster than manual droplet setup!** Deploy in 5 minutes with zero server configuration.

---

## **Why App Platform?**

✅ **No server setup** - Just connect GitHub and deploy  
✅ **Auto-scaling** - Handles traffic automatically  
✅ **Built-in SSL** - HTTPS out of the box  
✅ **Auto-deploy** - Push to GitHub = automatic deployment  
✅ **Easy rollbacks** - One-click revert to previous versions  
✅ **Cheaper** - $5/month starter plan  

---

## **Prerequisites**

- ✅ GitHub repository (already done!)
- ✅ Digital Ocean account
- ✅ 5 minutes of your time

---

## **Step-by-Step Deployment**

### **Step 1: Go to App Platform**

1. Login to Digital Ocean: https://cloud.digitalocean.com/
2. Click **"Create"** → **"Apps"**
3. Or go directly: https://cloud.digitalocean.com/apps/new

---

### **Step 2: Connect GitHub Repository**

1. **Choose Source:**
   - Select **GitHub**
   - Click **"Authorize Digital Ocean"** (if first time)
   - Allow access to repositories

2. **Select Repository:**
   - Choose: `ik-labs/mini-hog-WeMakeDevs`
   - Branch: `main`
   - **Autodeploy:** ✅ Enable (deploys on every push)

3. Click **"Next"**

---

### **Step 3: Configure Resources**

Digital Ocean will auto-detect your apps. Configure each:

#### **API Service (apps/api)**

1. **Resource Type:** Web Service
2. **Name:** `minihog-api`
3. **Environment:** Node.js
4. **Build Command:**
   ```bash
   npm install && npm run build
   ```

5. **Run Command:**
   ```bash
   cd apps/api && node dist/main.js
   ```

6. **HTTP Port:** `3000`
7. **HTTP Request Routes:** `/`
8. **Instance Size:** Basic ($5/month)
   - 512 MB RAM
   - 1 vCPU

9. Click **"Edit Plan"** if you need more resources:
   - Professional: $12/month (1GB RAM) - Recommended for production

---

### **Step 4: Add Environment Variables**

Click **"Edit"** on your API service → **"Environment Variables"**

Add these variables:

```bash
NODE_ENV=production
PORT=3000
DATABASE_PATH=/tmp/analytics.duckdb
API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
CEREBRAS_API_KEY=your_actual_cerebras_key_here
CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions
LOG_LEVEL=info
CORS_ORIGIN=*
```

**Important Notes:**
- `DATABASE_PATH=/tmp/analytics.duckdb` - Will be recreated on each deploy
- Replace `CEREBRAS_API_KEY` with your actual key
- `CORS_ORIGIN=*` allows all origins (change to your frontend URL in production)

---

### **Step 5: Add Startup Script (Database Seeding)**

We need to create the database on startup since App Platform containers are ephemeral.

**Option A: Modify package.json (Recommended)**

Already done! Your `package.json` has:
```json
{
  "scripts": {
    "seed": "tsx scripts/seed-data.ts"
  }
}
```

**Option B: Create startup script**

Create `apps/api/startup.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting MiniHog API..."

# Create database directory
mkdir -p /tmp

# Generate seed data (only if database doesn't exist)
if [ ! -f "/tmp/analytics.duckdb" ]; then
  echo "📊 Generating seed data..."
  cd /workspace
  npm run seed
  echo "✅ Seed data generated"
fi

# Start API
echo "🎯 Starting API server..."
cd /workspace/apps/api
exec node dist/main.js
```

Then update **Run Command:**
```bash
chmod +x apps/api/startup.sh && ./apps/api/startup.sh
```

---

### **Step 6: Review and Deploy**

1. **Review your configuration:**
   - Service: minihog-api
   - Plan: $5/month (or $12/month)
   - Region: Choose closest to users (e.g., Bangalore, Singapore, NYC)

2. **Click "Next"**

3. **Review final settings**

4. **Click "Create Resources"**

---

### **Step 7: Wait for Deployment**

Digital Ocean will now:
1. ✅ Clone your repository
2. ✅ Install dependencies (~2 minutes)
3. ✅ Build the application (~1 minute)
4. ✅ Generate seed data (~15 seconds)
5. ✅ Start your API (~10 seconds)

**Total time: ~3-5 minutes**

Watch the build logs in real-time!

---

### **Step 8: Get Your API URL**

Once deployed, you'll get a URL like:

```
https://minihog-api-xxxxx.ondigitalocean.app
```

This is your **production API URL**!

---

## **Testing Your Deployment**

### **From Browser:**

1. **Health Check:**
   ```
   https://minihog-api-xxxxx.ondigitalocean.app/health
   ```

2. **API Overview:**
   ```
   https://minihog-api-xxxxx.ondigitalocean.app/api/insights/overview
   ```
   (Add header: `X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252`)

### **From Terminal:**

```bash
# Set your URL
API_URL="https://minihog-api-xxxxx.ondigitalocean.app"

# Test health
curl $API_URL/health

# Test authentication
curl "$API_URL/api/insights/overview" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Test active users
curl "$API_URL/api/insights/active-users?period=7d" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Test funnel
curl -X POST "$API_URL/api/insights/funnel" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252" \
  -d '{
    "steps": [{"event": "pageview"}, {"event": "purchase"}],
    "time_window": "30d"
  }'

# Test retention
curl -X POST "$API_URL/api/insights/retention" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252" \
  -d '{"period_type": "weekly", "periods": 8}'
```

---

## **Using app.yaml (Alternative Method)**

You can also deploy using a configuration file. Create `app.yaml` in your repo root:

```yaml
name: minihog
region: nyc

services:
  - name: api
    github:
      repo: ik-labs/mini-hog-WeMakeDevs
      branch: main
      deploy_on_push: true
    
    source_dir: /
    
    build_command: npm install && npm run build && npm run seed
    run_command: cd apps/api && node dist/main.js
    
    http_port: 3000
    
    instance_count: 1
    instance_size_slug: basic-xxs  # $5/month
    
    routes:
      - path: /
    
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"
      - key: DATABASE_PATH
        value: /tmp/analytics.duckdb
      - key: API_KEY
        value: mh_live_bf947c81aa941e864d35a23fd3fe9252
      - key: CORS_ORIGIN
        value: "*"
      - key: LOG_LEVEL
        value: info
      - key: CEREBRAS_API_KEY
        value: your_cerebras_key_here
        type: SECRET  # Marked as secret
      - key: CEREBRAS_API_URL
        value: https://api.cerebras.ai/v1/chat/completions

    health_check:
      http_path: /health
      initial_delay_seconds: 30
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3
```

Then deploy via doctl CLI:
```bash
doctl apps create --spec app.yaml
```

---

## **Database Persistence Options**

Since App Platform containers are ephemeral, your database is recreated on each deploy.

### **Option 1: Recreate on Startup (Current - Perfect for Demo)**
✅ **Pros:** Simple, fast (11 seconds), always fresh data  
❌ **Cons:** Data lost on restart  

**Current Setup:** Seed data is generated on each deployment

### **Option 2: Digital Ocean Spaces (S3-compatible storage)**

Store DuckDB file in Spaces:

```bash
# On startup, download database
aws s3 cp s3://your-space/analytics.duckdb /tmp/analytics.duckdb

# Periodically backup (optional)
aws s3 cp /tmp/analytics.duckdb s3://your-space/analytics.duckdb
```

Cost: ~$5/month for 250GB storage

### **Option 3: Persistent Volume (Coming Soon)**

Digital Ocean is adding persistent volumes to App Platform.

### **Recommendation for Demo/Hackathon:**

**Stick with Option 1** - Recreating on startup is perfect because:
- ✅ Fast (11 seconds)
- ✅ Consistent demo data
- ✅ No extra cost
- ✅ No complexity

For production with real user data, use Option 2 (Spaces) or switch to managed PostgreSQL.

---

## **Monitoring & Logs**

### **View Logs:**

1. Go to your app in Digital Ocean dashboard
2. Click **"Runtime Logs"**
3. See real-time logs from your API

### **Metrics:**

- **CPU Usage**
- **Memory Usage**
- **Request Rate**
- **Response Time**

All available in the dashboard!

---

## **Automatic Deployments**

Every time you push to `main` branch:
1. ✅ Digital Ocean auto-detects changes
2. ✅ Rebuilds your app
3. ✅ Runs tests (if configured)
4. ✅ Deploys new version
5. ✅ Zero downtime!

---

## **Rollback to Previous Version**

If something breaks:

1. Go to app dashboard
2. Click **"Deployments"** tab
3. Find the working version
4. Click **"Redeploy"**

Done in 10 seconds!

---

## **Custom Domain (Optional)**

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter: `api.yourdomain.com`
4. Update your DNS:
   ```
   CNAME api <your-app-url>
   ```
5. SSL certificate auto-provisioned!

---

## **Scaling**

### **Vertical Scaling (More Power):**

1. Go to **"Settings"** → **"Resources"**
2. Change instance size:
   - Basic ($5): 512 MB RAM
   - Professional ($12): 1 GB RAM
   - Professional ($24): 2 GB RAM

### **Horizontal Scaling (More Instances):**

1. Increase instance count: 1 → 2 → 3
2. Load balancer auto-configured
3. Pay per instance

---

## **Cost Breakdown**

| Plan | RAM | vCPU | Price/month |
|------|-----|------|-------------|
| Basic | 512 MB | 0.5 | $5 |
| Professional | 1 GB | 1 | $12 |
| Professional | 2 GB | 2 | $24 |

**Recommended for demo:** Basic ($5/month)  
**Recommended for production:** Professional $12/month (1GB RAM)

---

## **Environment Variables for Vercel**

Once your API is deployed, use these in Vercel:

```bash
NEXT_PUBLIC_API_URL=https://minihog-api-xxxxx.ondigitalocean.app/api
NEXT_PUBLIC_API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
```

Replace `xxxxx` with your actual app URL!

---

## **Troubleshooting**

### **Build Fails:**

1. Check **"Build Logs"** in dashboard
2. Common issues:
   - Missing dependencies → Add to `package.json`
   - Build command wrong → Check paths
   - Out of memory → Upgrade instance size

### **API Not Responding:**

1. Check **"Runtime Logs"**
2. Verify environment variables
3. Test health endpoint: `/health`
4. Check if port is 3000

### **Database Errors:**

1. Ensure `DATABASE_PATH=/tmp/analytics.duckdb`
2. Check if seed script ran (see logs)
3. Verify DuckDB is in dependencies

---

## **Comparison: App Platform vs Droplet**

| Feature | App Platform | Droplet |
|---------|-------------|---------|
| Setup Time | 5 minutes | 30 minutes |
| SSL/HTTPS | Auto | Manual |
| Auto-deploy | Yes | No |
| Scaling | Click button | Manual |
| Monitoring | Built-in | Setup required |
| Cost | $5/month | $12/month |
| Maintenance | Zero | Regular updates |

**Winner: App Platform for 99% of use cases!** 🏆

---

## **Next Steps**

1. ✅ Deploy API to App Platform (5 minutes)
2. ✅ Get your API URL
3. ✅ Test all endpoints
4. ✅ Deploy frontend to Vercel (use API URL)
5. ✅ Update CORS_ORIGIN to frontend URL
6. ✅ Demo your full-stack app!

---

**Ready to deploy?** 

Just go to: https://cloud.digitalocean.com/apps/new

And follow the steps above! 🚀
