# 🎯 Next Steps - Deploy Your Product Detector API

## ✅ What's Complete

All deployment files have been created! Here's what you now have:

### 📦 Deployment Files
- Docker configurations for backend, frontend, and nginx
- GitHub Actions CI/CD pipeline
- Automated server setup scripts
- Comprehensive documentation

### 🔑 SSH Keys
- Private key: `.ssh/hetzner_deploy_key` (keep secret!)
- Public key: `.ssh/hetzner_deploy_key.pub` (add to Hetzner)

### 📚 Documentation
- `DEPLOYMENT.md` - Complete 37-page deployment guide
- `GITHUB_SETUP.md` - GitHub configuration guide
- `DEPLOYMENT_SUMMARY.md` - Quick reference
- `NEXT_STEPS.md` - This file

---

## 🚀 Your 5-Step Deployment Path

### Step 1: Add SSH Key to Hetzner (2 minutes)

**Your SSH Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMPImWRQRHvwCQrZ5SG7WSH/hsC2Uoufq87BlKJxrpcN hetzner-detector-api
```

**How to add:**
1. Go to [Hetzner Cloud Console](https://console.hetzner.com/projects/12324513/dashboard)
2. Click "Security" → "SSH Keys"
3. Click "Add SSH Key"
4. Paste the public key above
5. Name it: "Detector API Deploy Key"

**Then create your server:**
- Click "Add Server"
- Choose: Ubuntu 22.04
- Size: CPX31 (4 vCPU, 8 GB RAM) - Recommended
- Select your SSH key
- Name: detector-api-prod

---

### Step 2: Set Up Your Server (15 minutes)

**SSH into your new server:**
```bash
ssh root@YOUR_HETZNER_IP
```

**Run the automated setup script:**

On the server, run these commands:

```bash
# Download setup script
curl -fsSL https://gist.githubusercontent.com/YOUR_USERNAME/setup-server.sh -o setup.sh

# Or copy from your local machine
# (Recommended for now since repo isn't pushed yet)
```

**For now, manually copy the script:**

On your Mac:
```bash
scp "/Users/pavelpopkov/Desktop/Detector API/deploy/setup-server.sh" root@YOUR_HETZNER_IP:/root/
```

On the server:
```bash
chmod +x /root/setup-server.sh
/root/setup-server.sh
```

This will install Docker, configure firewall, and set up the application directory.

---

### Step 3: Configure Domain & SSL (10 minutes)

**A. Point your domain to the server**

Add an A record in your domain's DNS:
```
Type: A
Name: @ (or subdomain like 'api')
Value: YOUR_HETZNER_IP
TTL: 3600
```

Wait 5-10 minutes for DNS propagation.

**B. Configure environment on server**

SSH into your server:
```bash
ssh root@YOUR_HETZNER_IP
cd /opt/detector-api
nano .env
```

Edit these values:
```bash
DOMAIN_NAME=your-actual-domain.com
LETSENCRYPT_EMAIL=your-actual-email@example.com
GITHUB_REPOSITORY=your-github-username/detector-api
```

Save (Ctrl+X, Y, Enter).

**C. Generate SSL certificate**

```bash
certbot certonly --standalone \
  -d your-actual-domain.com \
  --email your-actual-email@example.com \
  --agree-tos
```

---

### Step 4: Set Up GitHub (10 minutes)

**A. Create GitHub repository**

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `detector-api`
3. Visibility: Your choice (Public or Private)
4. **Don't** initialize with README
5. Click "Create repository"

**B. Push your code**

On your Mac:
```bash
cd "/Users/pavelpopkov/Desktop/Detector API"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Product Detector API with Docker deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/detector-api.git

# Push
git branch -M main
git push -u origin main
```

**C. Add GitHub Secrets**

Go to: `https://github.com/YOUR_USERNAME/detector-api/settings/secrets/actions`

Click "New repository secret" and add:

**Secret 1: HETZNER_SSH_KEY**
```bash
# On your Mac, copy this:
cat "/Users/pavelpopkov/Desktop/Detector API/.ssh/hetzner_deploy_key"
```
Paste the entire output (including BEGIN and END lines)

**Secret 2: HETZNER_HOST**
Value: `YOUR_HETZNER_IP` (just the IP address)

**Secret 3: HETZNER_USER**
Value: `root`

**Secret 4: DOMAIN_NAME**
Value: `your-actual-domain.com`

**D. Enable GitHub Actions permissions**

1. Go to Settings → Actions → General
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
3. Click Save

---

### Step 5: Deploy! (Automatic - 5 minutes)

**Trigger deployment:**

On your Mac:
```bash
# Make a small change to trigger deployment
echo "\n# Deployed $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger initial deployment"
git push origin main
```

**Watch the deployment:**

1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the workflow run

You should see:
- ✅ Build backend image
- ✅ Build frontend image
- ✅ Push to registry
- ✅ Deploy to Hetzner
- ✅ Health check

**Verify it works:**

Open your browser and go to:
```
https://your-actual-domain.com
```

You should see the Product Detector application!

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] GitHub Actions workflow completed successfully (green ✅)
- [ ] Website loads: `https://your-domain.com`
- [ ] API health check works: `https://your-domain.com/api/health`
- [ ] Can upload an image
- [ ] Detection works and shows bounding boxes
- [ ] SSL certificate is valid (green padlock in browser)

---

## 🔧 Common Issues & Quick Fixes

### Issue: "Permission denied (publickey)" in GitHub Actions

**Fix:** Double-check the `HETZNER_SSH_KEY` secret:
- Ensure it's the PRIVATE key (`.ssh/hetzner_deploy_key`)
- Include the full content with BEGIN/END lines
- No extra spaces or line breaks

### Issue: DNS not resolving

**Fix:** 
- Wait 10-30 minutes for DNS propagation
- Check DNS with: `nslookup your-domain.com`
- Verify A record points to correct IP

### Issue: SSL certificate generation fails

**Fix:**
- Ensure DNS is propagated first
- Verify port 80 is open: `ufw status`
- Try with `--dry-run` first to test

### Issue: Containers not starting on server

**Fix:**
```bash
# SSH into server
ssh root@YOUR_HETZNER_IP

# Check logs
cd /opt/detector-api
docker compose logs

# Restart
docker compose restart
```

---

## 📚 Documentation Quick Links

- **Complete Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Everything you need to know
- **GitHub Setup**: [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Detailed GitHub configuration
- **Quick Reference**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Commands and architecture
- **SSH Keys**: [.ssh/README.md](./.ssh/README.md) - SSH key management

---

## 🛠️ After Deployment

### View Logs
```bash
ssh root@YOUR_HETZNER_IP
cd /opt/detector-api
docker compose logs -f
```

### Update Application
Just push to main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions will automatically deploy!

### Manual Update
```bash
ssh root@YOUR_HETZNER_IP
cd /opt/detector-api
./update.sh
```

---

## 💡 Pro Tips

1. **Test locally first**
   ```bash
   docker compose up -d
   ```
   
2. **Use branches for features**
   ```bash
   git checkout -b feature-name
   # Make changes
   git commit -m "Add feature"
   git push origin feature-name
   ```

3. **Monitor resources**
   ```bash
   ssh root@YOUR_HETZNER_IP
   docker stats
   htop
   ```

4. **Set up monitoring**
   - Consider adding Uptime Robot
   - Set up log aggregation
   - Monitor disk space

---

## 🎯 You're Ready!

Everything is prepared for deployment. Just follow the 5 steps above and you'll have your Product Detector API live on the internet in about 45 minutes!

**Start with Step 1** and work your way through. Each step builds on the previous one.

Good luck! 🚀

---

**Need help?** 
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
- Review GitHub Actions logs for deployment errors
- SSH into server and check `docker compose logs`

**Questions about any step?** The documentation files have extensive detail on every part of the process.

