# Deploy to Digital Ocean App Platform - Quick Start

## **🚀 Deploy in 5 Minutes**

### **Step 1: Go to App Platform**
```
https://cloud.digitalocean.com/apps/new
```

### **Step 2: Connect GitHub**
- Repository: `ik-labs/mini-hog-WeMakeDevs`
- Branch: `main`
- ✅ Enable Autodeploy

### **Step 3: Configure Service**

**Service Name:** `minihog-api`

**Build Command:**
```bash
npm install && npm run build && npm run seed
```

**Run Command:**
```bash
cd apps/api && node dist/main.js
```

**HTTP Port:** `3000`

**Instance Size:** Basic ($5/month) - 512MB RAM

### **Step 4: Add Environment Variables**

```bash
NODE_ENV=production
PORT=3000
DATABASE_PATH=/tmp/analytics.duckdb
API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
CORS_ORIGIN=*
LOG_LEVEL=info
CEREBRAS_API_KEY=your_key_here
CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions
```

### **Step 5: Deploy!**

Click **"Create Resources"**

Wait 3-5 minutes...

✅ **Done!**

---

## **Your API URL**

```
https://minihog-api-xxxxx.ondigitalocean.app
```

---

## **Test It**

```bash
# Replace with your actual URL
API_URL="https://minihog-api-xxxxx.ondigitalocean.app"

# Health check
curl $API_URL/health

# Get analytics
curl "$API_URL/api/insights/overview" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"
```

---

## **For Vercel Frontend**

Use these environment variables:

```bash
NEXT_PUBLIC_API_URL=https://minihog-api-xxxxx.ondigitalocean.app/api
NEXT_PUBLIC_API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
```

---

## **Alternative: Deploy via CLI**

```bash
# Install doctl
brew install doctl  # macOS
# or download from: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Deploy using app.yaml
doctl apps create --spec .do/app.yaml

# Check status
doctl apps list
```

---

## **Why App Platform?**

✅ **5 minutes** vs 30 minutes (manual droplet)  
✅ **Auto SSL/HTTPS** - No setup needed  
✅ **Auto-deploy** - Push to GitHub = deployed  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **$5/month** - Cheaper than droplet  
✅ **Zero maintenance** - No server updates  

---

## **What Happens During Deployment?**

1. ✅ Clones your GitHub repo
2. ✅ Installs dependencies (~2 min)
3. ✅ Builds TypeScript → JavaScript (~1 min)
4. ✅ Generates 10,000 seed events (~15 sec)
5. ✅ Starts API server (~10 sec)
6. ✅ Provisions SSL certificate
7. ✅ Your API is live! 🎉

---

## **Database Notes**

- Database is **recreated on each deploy** (ephemeral)
- Seed data generates in **11 seconds**
- **10,000 events** with 500 users
- **Perfect for demo/testing**

For production with persistent data:
- Use Digital Ocean Spaces (S3-compatible)
- Or switch to managed PostgreSQL

---

## **Monitoring**

View in Digital Ocean dashboard:
- ✅ Real-time logs
- ✅ CPU/Memory usage
- ✅ Request metrics
- ✅ Deployment history

---

## **Rollback**

If deployment breaks:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on previous version
3. Done in 10 seconds!

---

## **Upgrade Plan**

Need more power?

```
Settings → Resources → Change instance size

Basic ($5)        → 512 MB RAM
Professional ($12) → 1 GB RAM    ← Recommended for production
Professional ($24) → 2 GB RAM
```

---

## **Full Guide**

See: `DEPLOY_DO_APP_PLATFORM.md` for detailed instructions

---

**That's it!** Deploy now and get your API live in 5 minutes! 🚀
