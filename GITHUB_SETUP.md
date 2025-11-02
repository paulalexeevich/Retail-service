# GitHub Setup Guide

This guide will help you set up your GitHub repository and configure it for automatic deployment to Hetzner.

## Step 1: Create GitHub Repository

### Option A: Create New Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `detector-api` (or your preferred name)
3. Description: "Product Detection API with YOLO - deployed on Hetzner"
4. Visibility: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: Use Existing Repository

If you already have a repository, you can use that.

---

## Step 2: Connect Local Repository to GitHub

Open terminal in the project directory:

```bash
cd "/Users/pavelpopkov/Desktop/Detector API"

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Product Detector API with Docker deployment"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/detector-api.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 3: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add the following secrets:

### Secret 1: HETZNER_SSH_KEY

**Value:** Content of the private SSH key

```bash
# Display the private key on your Mac
cat "/Users/pavelpopkov/Desktop/Detector API/.ssh/hetzner_deploy_key"
```

Copy the **entire output** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Secret 2: HETZNER_HOST

**Value:** Your Hetzner server IP address

Example: `123.456.789.012`

### Secret 3: HETZNER_USER

**Value:** `root`

(or the username you use to SSH into your server)

### Secret 4: DOMAIN_NAME (Optional)

**Value:** Your domain name

Example: `api.example.com`

Only needed if you're using a custom domain.

---

## Step 4: Enable GitHub Actions Permissions

1. Still in **Settings**, click **Actions** → **General**
2. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
3. ✅ Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

---

## Step 5: Enable GitHub Container Registry

The workflow will push Docker images to GitHub Container Registry (ghcr.io).

### Make Package Public (Optional)

After first successful deployment:

1. Go to your GitHub profile
2. Click **Packages** tab
3. Find `detector-api/backend` and `detector-api/frontend`
4. Click on each package
5. Click **Package settings** (bottom of sidebar)
6. Under **Danger Zone**, click **Change visibility**
7. Select **Public** (if you want public access)
8. Type the package name to confirm

---

## Step 6: Test GitHub Actions

### Trigger a Deployment

```bash
# Make a small change
echo "\n# Deployment test" >> README.md

# Commit and push
git add README.md
git commit -m "Test GitHub Actions deployment"
git push origin main
```

### Monitor the Workflow

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You should see a workflow running
4. Click on it to see progress

The workflow will:
1. ✅ Build backend Docker image
2. ✅ Build frontend Docker image
3. ✅ Push images to GitHub Container Registry
4. ✅ SSH into Hetzner server
5. ✅ Pull and deploy new images
6. ✅ Run health checks

---

## Step 7: Verify Deployment

### Check Workflow Status

- ✅ **Green checkmark** = Success!
- ❌ **Red X** = Failed (click to see logs)

### Common Issues

#### Issue: "Permission denied (publickey)"

**Solution:** Double-check `HETZNER_SSH_KEY` secret:
- Ensure it's the **private key**, not public
- Include the BEGIN and END lines
- No extra spaces or newlines

#### Issue: "Could not resolve host"

**Solution:** Verify `HETZNER_HOST` secret:
- Use IP address, not hostname (unless DNS is configured)
- No `http://` or `https://` prefix
- No port number (SSH uses 22 by default)

#### Issue: "Docker build failed"

**Solution:** Check the build logs:
- Ensure all files are committed and pushed
- Verify `best (1).pt` model file exists
- Check Dockerfile syntax

---

## Step 8: Set Up Branch Protection (Optional)

Protect your main branch:

1. Go to **Settings** → **Branches**
2. Click **Add rule** or **Add classic branch protection rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Click **Create** or **Save changes**

---

## Your GitHub Repository Structure

After setup, your repo should have:

```
detector-api/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ← GitHub Actions workflow
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── deploy/
│   ├── setup-server.sh
│   └── update.sh
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── .ssh/
│   ├── hetzner_deploy_key.pub  # ← Public key (safe to commit)
│   └── README.md
├── docker-compose.yml
├── .gitignore                  # ← Excludes private key
├── README.md
├── DEPLOYMENT.md
└── best (1).pt
```

---

## Quick Reference

### View Secrets

Settings → Secrets and variables → Actions

### View Actions

Repository → Actions tab

### Re-run Failed Workflow

Actions tab → Click failed workflow → Re-run jobs

### Manual Deployment Trigger

Actions tab → Deploy to Hetzner → Run workflow

---

## Next Steps

After GitHub is set up:

1. ✅ [Follow DEPLOYMENT.md](./DEPLOYMENT.md) to set up Hetzner server
2. ✅ Configure DNS (if using custom domain)
3. ✅ Generate SSL certificate
4. ✅ Push to main branch to trigger deployment

---

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create and switch to new branch
git checkout -b feature-name

# Merge branch to main
git checkout main
git merge feature-name

# Tag a release
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote URL
git remote -v
```

---

## Support

If you encounter issues:

1. Check GitHub Actions logs for error messages
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
3. Verify all secrets are set correctly
4. Ensure Hetzner server is accessible via SSH

---

**Your GitHub repository is ready for automatic deployments! 🚀**

