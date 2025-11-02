# 🚀 Deployment Guide - Hetzner Cloud with Docker

Complete guide to deploy the Product Detector API to Hetzner Cloud with automatic deployments via GitHub Actions.

## 📋 Prerequisites

### Required Accounts
- ✅ Hetzner Cloud account ([https://console.hetzner.com](https://console.hetzner.com))
- ✅ GitHub account with repository access
- ✅ Domain name (optional, but required for SSL)

### Local Requirements
- Git installed
- SSH client
- Docker (for local testing)

---

## 🏗️ Architecture

```
Internet (HTTPS)
      ↓
Hetzner Cloud Server
      ↓
Nginx (SSL Termination + Reverse Proxy)
      ├─→ /api/* → Backend Container (FastAPI + YOLOv5)
      └─→ /* → Frontend Container (React + Nginx)
```

**Containers:**
- `detector-backend`: FastAPI application with YOLO model
- `detector-frontend`: React frontend served by nginx
- `detector-nginx`: Main nginx reverse proxy with SSL
- `detector-certbot`: Let's Encrypt certificate renewal

---

## 🎯 Step-by-Step Deployment

### Step 1: Set Up Hetzner Server

#### 1.1 Create a Server

1. Log in to [Hetzner Cloud Console](https://console.hetzner.com/projects/12324513/dashboard)
2. Click "Add Server"
3. Select:
   - **Location**: Choose closest to your users (e.g., Nuremberg, Helsinki, Ashburn)
   - **Image**: Ubuntu 22.04 (or latest LTS)
   - **Type**: 
     - Minimum: CPX21 (3 vCPU, 4 GB RAM) - $9.90/month
     - Recommended: CPX31 (4 vCPU, 8 GB RAM) - $18.90/month
   - **SSH Key**: Add your public key (from `.ssh/hetzner_deploy_key.pub`)
   - **Name**: detector-api-prod

4. Click "Create & Buy Now"
5. Note the server's IP address

#### 1.2 Configure DNS (if using domain)

Point your domain to the Hetzner server:

```
Type: A Record
Name: @ (or your subdomain)
Value: YOUR_HETZNER_IP
TTL: 3600
```

Wait for DNS propagation (can take 5-60 minutes).

#### 1.3 Run Server Setup Script

SSH into your server and run the setup script:

```bash
# SSH into server
ssh root@YOUR_HETZNER_IP

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/detector-api/main/deploy/setup-server.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

Or manually copy and run the script:

```bash
# From your local machine
scp deploy/setup-server.sh root@YOUR_HETZNER_IP:/root/
ssh root@YOUR_HETZNER_IP 'bash /root/setup-server.sh'
```

This script will:
- ✅ Install Docker and Docker Compose
- ✅ Configure firewall (ports 22, 80, 443)
- ✅ Install Certbot for SSL
- ✅ Create application directory at `/opt/detector-api`
- ✅ Set up log rotation

---

### Step 2: Configure Environment Variables

#### 2.1 Edit Server Configuration

SSH into your server and edit the `.env` file:

```bash
ssh root@YOUR_HETZNER_IP
cd /opt/detector-api
nano .env
```

Update these values:

```bash
# Domain Configuration
DOMAIN_NAME=your-domain.com  # Replace with your domain
LETSENCRYPT_EMAIL=your-email@example.com  # Replace with your email

# GitHub Container Registry
GITHUB_REPOSITORY=yourusername/detector-api  # Replace with your GitHub username/repo

# Backend Configuration
MODEL_PATH=/app/best (1).pt
CONFIDENCE_THRESHOLD=0.25
ALLOWED_ORIGINS=https://your-domain.com  # Replace with your domain
```

Save and exit (Ctrl+X, then Y, then Enter).

---

### Step 3: Generate SSL Certificate

Still on the server, generate your SSL certificate:

```bash
certbot certonly --standalone \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

Verify certificates are created:

```bash
ls -la /etc/letsencrypt/live/your-domain.com/
```

You should see:
- `fullchain.pem`
- `privkey.pem`

---

### Step 4: Set Up GitHub Secrets

#### 4.1 Add SSH Key to GitHub

1. On your local machine, display the private key:

```bash
cat "/Users/pavelpopkov/Desktop/Detector API/.ssh/hetzner_deploy_key"
```

2. Copy the entire output (including `-----BEGIN` and `-----END` lines)

3. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/detector-api/settings/secrets/actions`

4. Click "New repository secret"

5. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `HETZNER_SSH_KEY` | Content of `hetzner_deploy_key` (private key) |
| `HETZNER_HOST` | Your Hetzner server IP address |
| `HETZNER_USER` | `root` |
| `DOMAIN_NAME` | Your domain name |

#### 4.2 Verify GitHub Actions Permissions

1. Go to repository Settings → Actions → General
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
3. Click "Save"

---

### Step 5: Initial Deployment

#### 5.1 Create docker-compose.yml on Server

SSH into your server and create the docker-compose file:

```bash
cd /opt/detector-api
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/${GITHUB_REPOSITORY}/backend:latest
    container_name: detector-backend
    restart: unless-stopped
    networks:
      - detector-network

  frontend:
    image: ghcr.io/${GITHUB_REPOSITORY}/frontend:latest
    container_name: detector-frontend
    restart: unless-stopped
    networks:
      - detector-network
    depends_on:
      - backend

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: detector-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    networks:
      - detector-network
    depends_on:
      - backend
      - frontend

networks:
  detector-network:
    driver: bridge
```

#### 5.2 Push Code to GitHub

From your local machine:

```bash
cd "/Users/pavelpopkov/Desktop/Detector API"

# Initialize git (if not already)
git init

# Add files
git add .

# Commit
git commit -m "Initial deployment setup"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/detector-api.git

# Create main branch and push
git branch -M main
git push -u origin main
```

#### 5.3 Monitor Deployment

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the deployment workflow run
4. If successful, you'll see green checkmarks

---

### Step 6: Verify Deployment

#### 6.1 Check Services

On the server:

```bash
cd /opt/detector-api
docker compose ps
```

You should see all containers running.

#### 6.2 Test Endpoints

```bash
# Test backend health
curl https://your-domain.com/api/health

# Expected response:
# {"status":"healthy","model_path":"/app/best (1).pt"}

# Test frontend
curl https://your-domain.com/

# Should return HTML
```

#### 6.3 Test in Browser

Visit `https://your-domain.com` and:
1. Upload an image
2. Click "Detect Products"
3. See results with bounding boxes

---

## 🔄 Updating the Application

### Automatic Updates (Recommended)

Simply push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions will automatically:
1. Build new Docker images
2. Push to GitHub Container Registry
3. SSH into Hetzner server
4. Pull and restart containers
5. Run health checks

### Manual Updates

SSH into server and run:

```bash
cd /opt/detector-api
./deploy/update.sh
```

---

## 🔍 Monitoring and Logs

### View Container Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Check Resource Usage

```bash
# Container stats
docker stats

# System resources
htop  # or: top
```

### Check Disk Space

```bash
df -h
docker system df
```

---

## 🛠️ Troubleshooting

### Issue: Deployment Fails

**Check GitHub Actions logs:**
1. Go to Actions tab
2. Click on failed workflow
3. Check error messages

**Common fixes:**
- Verify all GitHub secrets are set correctly
- Ensure server is accessible via SSH
- Check server has enough disk space

### Issue: SSL Certificate Errors

**Renew certificate manually:**

```bash
certbot renew --standalone --pre-hook "docker compose stop nginx" --post-hook "docker compose start nginx"
```

**Check certificate expiry:**

```bash
certbot certificates
```

### Issue: Backend Not Loading Model

**Check logs:**

```bash
docker compose logs backend | grep -i "model"
```

**Verify model file exists:**

```bash
docker exec detector-backend ls -lh /app/
```

### Issue: Out of Memory

**Check memory usage:**

```bash
free -h
docker stats --no-stream
```

**Solutions:**
- Upgrade to larger Hetzner instance
- Restart containers: `docker compose restart`
- Clean up old images: `docker system prune -a`

### Issue: Containers Not Starting

**Check status:**

```bash
docker compose ps
docker compose logs
```

**Restart services:**

```bash
docker compose down
docker compose up -d
```

---

## 🔐 Security Best Practices

### 1. Firewall Configuration

Verify only necessary ports are open:

```bash
ufw status
```

Should show:
- 22/tcp (SSH)
- 80/tcp (HTTP)
- 443/tcp (HTTPS)

### 2. SSH Security

**Disable password authentication:**

Edit `/etc/ssh/sshd_config`:

```bash
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:

```bash
systemctl restart sshd
```

### 3. Regular Updates

```bash
# Update system
apt update && apt upgrade -y

# Update Docker images
cd /opt/detector-api
docker compose pull
docker compose up -d
```

### 4. Backup Configuration

```bash
# Backup .env and certificates
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/detector-api/.env /etc/letsencrypt/
```

---

## 📊 Cost Estimation

### Hetzner Cloud Costs

| Server Type | vCPU | RAM | Storage | Cost/Month |
|-------------|------|-----|---------|------------|
| CPX21 | 3 | 4 GB | 80 GB | $9.90 |
| CPX31 | 4 | 8 GB | 160 GB | $18.90 |
| CPX41 | 8 | 16 GB | 240 GB | $35.90 |

**Recommended:** CPX31 for production use

### Additional Costs

- Domain name: $10-15/year
- Backup space (optional): $3-5/month
- **Total estimated:** ~$20-25/month

---

## 🔄 SSL Certificate Renewal

### Automatic Renewal

Certbot automatically renews certificates. The renewal happens via the `certbot` container in docker-compose.

### Manual Renewal (if needed)

```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

### Check Renewal Status

```bash
docker compose logs certbot
```

---

## 📞 Support and Resources

### Useful Commands

```bash
# View all containers
docker ps -a

# Restart a specific container
docker compose restart backend

# Rebuild and restart
docker compose up -d --build

# View nginx config
docker exec detector-nginx cat /etc/nginx/nginx.conf

# Test nginx config
docker exec detector-nginx nginx -t
```

### Documentation Links

- [Docker Documentation](https://docs.docker.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Hetzner Cloud Docs](https://docs.hetzner.com/cloud/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## ✅ Deployment Checklist

Use this checklist for new deployments:

- [ ] Hetzner server created and accessible
- [ ] DNS configured (if using domain)
- [ ] Server setup script executed
- [ ] `.env` file configured on server
- [ ] SSL certificate generated
- [ ] GitHub secrets added
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow succeeded
- [ ] Services are running (`docker compose ps`)
- [ ] Health check passes (`curl https://domain.com/api/health`)
- [ ] Frontend loads in browser
- [ ] Image upload and detection works
- [ ] Logs are clean (no errors)
- [ ] Monitoring set up

---

## 🎉 Success!

Your Product Detector API is now deployed and running on Hetzner Cloud with:

- ✅ Automatic deployments via GitHub Actions
- ✅ SSL encryption via Let's Encrypt
- ✅ Zero-downtime updates
- ✅ Scalable Docker containers
- ✅ Reverse proxy with nginx

**Your API is live at:** `https://your-domain.com`

For questions or issues, check the troubleshooting section or review container logs.

