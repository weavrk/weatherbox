# WatchBox Deployment Guide

## Quick Start

### Local Development
```bash
npm run dev
# Opens at http://localhost:8000
```

### Manual Deploy to GoDaddy
```bash
git add -A
git commit -m "Your changes"
npm run deploy
```

### Auto-Deploy via GitHub
```bash
git add -A
git commit -m "Your changes"
git push
# GitHub Actions automatically deploys!
```

## 🚀 Deployment Methods

### Method 1: Manual Deploy (npm)
Use the built-in scripts:

| Command | Description |
|---------|-------------|
| `npm run archive` | Build + save local backup |
| `npm run deploy` | Build + upload to GoDaddy |
| `npm run deploy:dry` | Preview without uploading |
| `npm run deploy -- --skip-build` | Upload without rebuilding |

### Method 2: Auto-Deploy (GitHub Actions)
**Recommended for regular development**

1. Make your changes
2. Commit to git: `git commit -am "Update feature"`
3. Push to GitHub: `git push`
4. GitHub automatically builds and deploys!

Watch progress at: https://github.com/weavrk/watchbox/actions

## 🔧 GitHub Setup

### One-Time Setup

1. **Create GitHub repo** (if not done):
   ```bash
   # Already done - repo is at github.com/weavrk/watchbox
   ```

2. **Add GitHub Secrets** (for FTP credentials):
   - Go to: https://github.com/weavrk/watchbox/settings/secrets/actions
   - Click "New repository secret"
   - Add these three secrets:
     - `FTP_HOST` = `ftp.weavrk.com`
     - `FTP_USER` = `weavrk`
     - `FTP_PASS` = `Oneplus1=2`

3. **Done!** Now every `git push` auto-deploys.

## 📁 What Gets Deployed

| Local | Remote on GoDaddy |
|-------|-------------------|
| `dist/` | `/public_html/hrefs/watchbox/` |
| `api/` | `/public_html/api/` |
| `data/users/` | `/public_html/data/users/` |
| `data/avatars/` | `/public_html/data/avatars/` |

## 🌐 Live URLs

- **Production**: https://weavrk.com/hrefs/watchbox/
- **Dev Server**: http://localhost:8000/

## 🔒 Security Notes

- `.env` is in `.gitignore` (never committed)
- FTP credentials stored as GitHub Secrets (encrypted)
- Only authorized GitHub users can trigger deploys

## 📦 Local Archives

Each manual deploy creates a backup:
```
x.archive/deploys/
├── 2025-12-13_0559/
├── 2025-12-13_0600/
└── YYYY-MM-DD_HHMM/
```

These are **not** pushed to GitHub (too large, in `.gitignore`).

## 🐛 Troubleshooting

### GitHub Actions fails
- Check Actions tab: https://github.com/weavrk/watchbox/actions
- Verify FTP secrets are set correctly
- Check build logs for errors

### Manual deploy fails
- Verify `.env` file exists with correct credentials
- Test FTP connection: `npm run deploy:dry`
- Check FTP credentials in cPanel

### Local dev not working
```bash
npm install  # Reinstall dependencies
npm run dev  # Restart server
```

## 🎯 Typical Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes, see them live at localhost:8000

# 3. When ready, commit and push
git add -A
git commit -m "Add new feature"
git push

# 4. GitHub auto-deploys to weavrk.com
# Watch progress in Actions tab

# 5. Visit https://weavrk.com/hrefs/watchbox/
```

## 📊 Deployment History

View all deployments at:
- GitHub Actions: https://github.com/weavrk/watchbox/actions
- Local archives: `x.archive/deploys/`

---

**Live Site**: https://weavrk.com/hrefs/watchbox/
**Repository**: https://github.com/weavrk/watchbox

