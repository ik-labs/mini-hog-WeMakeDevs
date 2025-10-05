# Digital Ocean Deployment - Quick Reference

## **TL;DR - Fast Deployment (15 minutes)**

### 1. Create Droplet
```
- Ubuntu 22.04 LTS
- 2 GB RAM ($12/month)
- Note IP address
```

### 2. Connect & Setup
```bash
ssh root@YOUR_IP

# Install everything
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs build-essential git
npm install -g pm2
```

### 3. Deploy App
```bash
cd /var/www
git clone https://github.com/ik-labs/mini-hog-WeMakeDevs.git minihog
cd minihog
npm install
npm run build
npm run seed  # Creates database with 10K events
```

### 4. Configure Environment
```bash
cd apps/api
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/www/minihog/data/analytics.duckdb
API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
CEREBRAS_API_KEY=your_key_here
CORS_ORIGIN=*
EOF
```

### 5. Start API
```bash
cd /var/www/minihog
pm2 start apps/api/dist/main.js --name minihog-api
pm2 save
pm2 startup
```

### 6. Setup Nginx
```bash
apt-get install -y nginx

cat > /etc/nginx/sites-available/minihog-api << 'EOF'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/minihog-api /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 7. Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 8. Test
```bash
# From your local machine:
curl http://YOUR_IP/health
curl http://YOUR_IP/api/insights/overview -H "X-API-Key: mh_live_bf947c81aa941e864d35a23fd3fe9252"
```

---

## **Your API URL**
```
http://YOUR_DROPLET_IP

# Example:
http://143.198.123.45
```

**Use this in Vercel frontend env vars!**

---

## **Common Commands**

```bash
# View logs
pm2 logs minihog-api

# Restart API
pm2 restart minihog-api

# Pull updates & redeploy
cd /var/www/minihog
git pull
npm install
npm run build
pm2 restart minihog-api

# Check status
pm2 status
systemctl status nginx
```

---

## **Environment Variables for Vercel**

When deploying frontend:
```
NEXT_PUBLIC_API_URL=http://YOUR_DROPLET_IP/api
NEXT_PUBLIC_API_KEY=mh_live_bf947c81aa941e864d35a23fd3fe9252
```

---

**Full guide:** See `DEPLOY_DIGITALOCEAN.md`
