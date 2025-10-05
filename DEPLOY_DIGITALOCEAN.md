# Deploy MiniHog Backend to Digital Ocean

Complete guide to deploy the backend API + database with seed data.

---

## **Phase 1: Digital Ocean Droplet Setup**

### Step 1: Create Droplet

1. **Go to Digital Ocean Dashboard:**
   - https://cloud.digitalocean.com/

2. **Create New Droplet:**
   - Click "Create" → "Droplets"
   
3. **Choose Configuration:**
   ```
   Image: Ubuntu 22.04 LTS
   Plan: Basic
   CPU: Regular (Shared CPU)
   Size: $12/month (2 GB RAM, 1 vCPU, 50 GB SSD)
   Region: Choose closest to your users (e.g., Bangalore, Singapore)
   ```

4. **Authentication:**
   - Choose: SSH Key (Recommended)
   - Or: Password (easier but less secure)

5. **Hostname:**
   ```
   minihog-api
   ```

6. **Click "Create Droplet"**
   - Wait 1-2 minutes for provisioning
   - Note the IP address (e.g., `143.198.123.45`)

---

## **Phase 2: Initial Server Setup**

### Step 2: Connect to Server

```bash
# Replace with your droplet IP
ssh root@YOUR_DROPLET_IP

# Example:
ssh root@143.198.123.45
```

### Step 3: Update System

```bash
apt update && apt upgrade -y
```

### Step 4: Install Node.js 20.x

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 5: Install Build Tools & Git

```bash
# Install essential build tools
apt-get install -y build-essential git curl wget

# Verify git
git --version
```

### Step 6: Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify
pm2 --version
```

---

## **Phase 3: Deploy Application**

### Step 7: Clone Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repository
git clone git@github.com:ik-labs/mini-hog-WeMakeDevs.git minihog

# Or if using HTTPS:
git clone https://github.com/ik-labs/mini-hog-WeMakeDevs.git minihog

cd minihog
```

### Step 8: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Root dependencies
# - API dependencies
# - Shared package dependencies
# - MCP server dependencies (if needed)
```

### Step 9: Build the Project

```bash
# Build shared packages first
npm run build

# This builds:
# - @minihog/shared package
# - @minihog/api
# - @minihog/sdk
```

---

## **Phase 4: Database & Seed Data**

### Step 10: Create Data Directory

```bash
# Create directory for DuckDB database
mkdir -p /var/www/minihog/data

# Set permissions
chmod 755 /var/www/minihog/data
```

### Step 11: Generate Seed Data

```bash
cd /var/www/minihog

# Run seed data generation script
npm run seed

# This will:
# - Create analytics.duckdb
# - Generate 10,000 events
# - Create 500 users
# - Span 2 months of data
# - Insert 15 different event types

# Expected output:
# ✅ Database initialized
# ✅ Generated 10,000 events
# ✅ Seeded in ~11 seconds
```

### Step 12: Verify Database

```bash
# Check database file exists
ls -lh data/analytics.duckdb

# Should show file size ~500KB - 2MB
```

---

## **Phase 5: Environment Configuration**

### Step 13: Create Production Environment File

```bash
cd /var/www/minihog/apps/api

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/www/minihog/data/analytics.duckdb
API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
CEREBRAS_API_KEY=your_cerebras_api_key_here
CEREBRAS_API_URL=https://api.cerebras.ai/v1/chat/completions
CORS_ORIGIN=https://your-frontend-domain.vercel.app
LOG_LEVEL=info
EOF

# Note: Replace CEREBRAS_API_KEY with your actual key
# Note: Replace CORS_ORIGIN once you deploy frontend
```

### Step 14: Set Permissions

```bash
# Secure environment file
chmod 600 /var/www/minihog/apps/api/.env

# Set ownership (if using non-root user)
chown -R www-data:www-data /var/www/minihog
```

---

## **Phase 6: Start API Server**

### Step 15: Start with PM2

```bash
cd /var/www/minihog

# Start API server
pm2 start apps/api/dist/main.js --name minihog-api \
  --cwd /var/www/minihog/apps/api \
  --log /var/log/minihog-api.log \
  --time

# Check status
pm2 status

# View logs
pm2 logs minihog-api

# Expected output:
# [MiniHog] Server listening on port 3000
# ✅ Database connected
# ✅ All modules initialized
```

### Step 16: Configure PM2 Startup

```bash
# Save PM2 process list
pm2 save

# Generate startup script (auto-restart on reboot)
pm2 startup systemd

# Copy and run the command it outputs
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### Step 17: Test API Locally

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected: {"status":"ok","timestamp":"..."}

# Test API key authentication
curl http://localhost:3000/api/insights/overview \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Should return analytics data
```

---

## **Phase 7: Nginx Reverse Proxy**

### Step 18: Install Nginx

```bash
apt-get install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Verify
systemctl status nginx
```

### Step 19: Configure Nginx

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/minihog-api << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Increase body size for large payloads
    client_max_body_size 10M;

    # API endpoints
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no auth required)
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

# Replace YOUR_DOMAIN_OR_IP with:
# - Your domain: api.yourdomain.com
# - Or your IP: 143.198.123.45

sed -i 's/YOUR_DOMAIN_OR_IP/YOUR_ACTUAL_VALUE/' /etc/nginx/sites-available/minihog-api
```

### Step 20: Enable Nginx Site

```bash
# Create symlink
ln -s /etc/nginx/sites-available/minihog-api /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## **Phase 8: Firewall Configuration**

### Step 21: Configure UFW Firewall

```bash
# Allow SSH (important!)
ufw allow OpenSSH

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS (for SSL later)
ufw allow 443/tcp

# Enable firewall
ufw enable

# Verify
ufw status
```

---

## **Phase 9: SSL Certificate (Optional but Recommended)**

### Step 22: Install Certbot (If using domain)

```bash
# Only if you have a domain name pointed to your droplet

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (option 2)

# Certificate will auto-renew
```

---

## **Phase 10: Verification & Testing**

### Step 23: Test External Access

```bash
# From your LOCAL machine (not server):

# Test health endpoint
curl http://YOUR_DROPLET_IP/health

# Test API endpoint
curl http://YOUR_DROPLET_IP/api/insights/overview \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Test with SSL (if configured)
curl https://api.yourdomain.com/health
```

### Step 24: Test All Endpoints

```bash
# Active Users
curl http://YOUR_DROPLET_IP/api/insights/active-users?period=7d \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Top Events
curl http://YOUR_DROPLET_IP/api/insights/top-events?limit=5 \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"

# Funnel
curl -X POST http://YOUR_DROPLET_IP/api/insights/funnel \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252" \
  -d '{
    "steps": [
      {"event": "pageview"},
      {"event": "purchase"}
    ],
    "time_window": "30d"
  }'

# Retention
curl -X POST http://YOUR_DROPLET_IP/api/insights/retention \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252" \
  -d '{
    "period_type": "weekly",
    "periods": 8
  }'
```

---

## **Phase 11: Monitoring & Maintenance**

### Step 25: Monitor Application

```bash
# View PM2 logs
pm2 logs minihog-api

# View PM2 status
pm2 status

# Monitor resource usage
pm2 monit

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Step 26: Restart Commands

```bash
# Restart API
pm2 restart minihog-api

# Reload Nginx
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View system resources
htop  # (install with: apt-get install htop)
```

---

## **Quick Deployment Script**

Save this as `deploy.sh` on your server:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying MiniHog API..."

cd /var/www/minihog

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building..."
npm run build

# Restart API
echo "♻️ Restarting API..."
pm2 restart minihog-api

echo "✅ Deployment complete!"
pm2 status
```

Make it executable:
```bash
chmod +x /var/www/minihog/deploy.sh
```

---

## **Troubleshooting**

### API Not Starting

```bash
# Check PM2 logs
pm2 logs minihog-api --lines 100

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart PM2
pm2 delete minihog-api
pm2 start apps/api/dist/main.js --name minihog-api
```

### Database Errors

```bash
# Check database file
ls -lh /var/www/minihog/data/analytics.duckdb

# Regenerate seed data
cd /var/www/minihog
npm run seed
```

### Nginx Errors

```bash
# Check Nginx config
nginx -t

# View error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Out of Memory

```bash
# Check memory
free -h

# Create swap file (if needed)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## **Post-Deployment Checklist**

- ✅ API responding on http://YOUR_IP/health
- ✅ All endpoints working with API key
- ✅ Database has 10,000 seed events
- ✅ PM2 running and auto-restart configured
- ✅ Nginx reverse proxy working
- ✅ Firewall configured (SSH, HTTP, HTTPS)
- ✅ SSL certificate installed (if using domain)
- ✅ Logs accessible and monitored

---

## **API URL for Frontend**

Once deployed, your API will be available at:

```
http://YOUR_DROPLET_IP
# or
https://api.yourdomain.com
```

**Use this URL in your Vercel frontend deployment!**

---

## **Next Steps**

1. ✅ Note your API URL
2. ✅ Test all endpoints
3. ✅ Deploy frontend to Vercel (use API URL in env vars)
4. ✅ Update CORS_ORIGIN in backend .env
5. ✅ Test full stack integration

---

**Your backend is now live! 🎉**
