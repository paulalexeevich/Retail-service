# Quick Deployment Commands

Replace `YOUR_HETZNER_IP` with your actual server IP address.

## Step 2: Set Up Server

### Copy setup script to server:
```bash
cd "/Users/pavelpopkov/Desktop/Detector API"
scp -i .ssh/hetzner_deploy_key deploy/setup-server.sh root@YOUR_HETZNER_IP:/root/
```

### SSH into server:
```bash
ssh -i .ssh/hetzner_deploy_key root@YOUR_HETZNER_IP
```

### On the server, run setup:
```bash
chmod +x /root/setup-server.sh
/root/setup-server.sh
```

Wait for setup to complete (~5 minutes).

---

## Step 3: Configure Environment

### Still on the server:
```bash
cd /opt/detector-api
nano .env
```

### Edit these values:
- `DOMAIN_NAME` → your-actual-domain.com
- `LETSENCRYPT_EMAIL` → your-email@example.com
- `GITHUB_REPOSITORY` → your-github-username/detector-api

Save: Ctrl+X, then Y, then Enter

---

## Step 4: Generate SSL Certificate

### On the server:
```bash
certbot certonly --standalone \
  -d your-actual-domain.com \
  --email your-actual-email@example.com \
  --agree-tos
```

### Verify certificate:
```bash
ls -la /etc/letsencrypt/live/your-actual-domain.com/
```

---

## Step 5: Push to GitHub

### On your Mac:
```bash
cd "/Users/pavelpopkov/Desktop/Detector API"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Product Detector API"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/detector-api.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 6: Add GitHub Secrets

Go to: https://github.com/YOUR_USERNAME/detector-api/settings/secrets/actions

### Get private key:
```bash
cat "/Users/pavelpopkov/Desktop/Detector API/.ssh/hetzner_deploy_key"
```

### Add these secrets:

1. **HETZNER_SSH_KEY**
   - Paste entire private key (including BEGIN/END lines)

2. **HETZNER_HOST**
   - Value: YOUR_HETZNER_IP (just the IP)

3. **HETZNER_USER**
   - Value: `root`

4. **DOMAIN_NAME**
   - Value: your-actual-domain.com

---

## Step 7: Deploy!

### Trigger deployment:
```bash
git push origin main
```

Watch at: https://github.com/YOUR_USERNAME/detector-api/actions

---

## Useful Commands

### View server logs:
```bash
ssh -i .ssh/hetzner_deploy_key root@YOUR_HETZNER_IP
docker compose logs -f
```

### Check container status:
```bash
docker ps
docker compose ps
```

### Restart services:
```bash
docker compose restart
```

### Manual update:
```bash
cd /opt/detector-api
./update.sh
```

