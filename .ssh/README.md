# SSH Keys for Hetzner Deployment

## Files in this directory:

- `hetzner_deploy_key` - **Private key** (keep secret!)
- `hetzner_deploy_key.pub` - **Public key** (add to Hetzner server)

## ⚠️ IMPORTANT

**DO NOT commit the private key to Git!**

The `.gitignore` file is configured to exclude `hetzner_deploy_key`, but be extra careful.

## Usage

### 1. Add Public Key to Hetzner

When creating a new server in Hetzner Cloud:
1. Go to Security → SSH Keys
2. Click "Add SSH Key"
3. Paste the content of `hetzner_deploy_key.pub`
4. Name it: "Detector API Deploy Key"

### 2. Add Private Key to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `HETZNER_SSH_KEY`
5. Value: Paste the entire content of `hetzner_deploy_key` (including BEGIN and END lines)

### 3. Test SSH Connection

```bash
ssh -i .ssh/hetzner_deploy_key root@YOUR_HETZNER_IP
```

## Regenerating Keys

If you need to generate new keys:

```bash
ssh-keygen -t ed25519 -C "hetzner-detector-api" -f .ssh/hetzner_deploy_key -N ""
```

Then update:
1. Hetzner server's authorized_keys
2. GitHub secret `HETZNER_SSH_KEY`

## Public Key Content

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMPImWRQRHvwCQrZ5SG7WSH/hsC2Uoufq87BlKJxrpcN hetzner-detector-api
```

Add this to your Hetzner server or Cloud console.

