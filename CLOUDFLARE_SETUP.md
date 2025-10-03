# Cloudflare Pages Setup - The Watchmen

Automatic deployment to `thewatchmen.pages.dev`

---

## 🎯 Overview

This repository is configured to automatically deploy to Cloudflare Pages on every push to `main`. The deployment is monitored by "The Watchmen" system which can send notifications and trigger updates.

**Live URL**: https://thewatchmen.pages.dev

---

## 📋 Prerequisites

1. **Cloudflare Account**: Sign up at https://cloudflare.com
2. **GitHub Repository**: Already set up at https://github.com/memorymusicllc/pow3r.build
3. **Cloudflare API Token**: For automated deployments

---

## 🚀 Setup Instructions

### Step 1: Create Cloudflare Pages Project

#### Option A: Via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Navigate to: **Pages** → **Create a project**

2. **Connect to GitHub**
   - Click "Connect to Git"
   - Authorize Cloudflare to access your GitHub account
   - Select organization: `memorymusicllc`
   - Select repository: `pow3r.build`

3. **Configure Build Settings**
   ```
   Project name: thewatchmen
   Production branch: main
   Build command: (leave empty - static site)
   Build output directory: public
   ```

4. **Advanced Settings**
   - **Root directory**: (leave empty)
   - **Environment variables**: (set later)

5. **Deploy**
   - Click "Save and Deploy"
   - First deployment will start automatically

#### Option B: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create Pages project
wrangler pages project create thewatchmen

# Deploy
wrangler pages deploy public --project-name=thewatchmen
```

---

### Step 2: Configure Custom Domain (Optional)

If you want to use `thewatchmen.pages.dev`:

1. Go to Pages project settings
2. Navigate to **Custom domains**
3. The `*.pages.dev` subdomain is automatically assigned
4. Your site will be at: `https://thewatchmen.pages.dev`

For a custom domain:
1. Add your domain in Cloudflare DNS
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `thewatchmen.yourdomain.com`)
4. Follow DNS configuration instructions

---

### Step 3: Set Up GitHub Actions (Automated Deployment)

#### Create GitHub Secrets

1. **Get Cloudflare API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Or create custom token with permissions:
     - Account → Cloudflare Pages → Edit
   - Copy the token

2. **Get Cloudflare Account ID**
   - Go to: https://dash.cloudflare.com
   - Select any site
   - Copy Account ID from the right sidebar

3. **Add Secrets to GitHub**
   - Go to: https://github.com/memorymusicllc/pow3r.build/settings/secrets/actions
   - Click "New repository secret"
   - Add these secrets:
     ```
     Name: CLOUDFLARE_API_TOKEN
     Value: [your-api-token]
     
     Name: CLOUDFLARE_ACCOUNT_ID
     Value: [your-account-id]
     ```

#### Verify GitHub Actions

The workflow is already configured in `.github/workflows/cloudflare-pages.yml`

**Trigger**: Automatic on push to `main`

**What it does**:
1. Checks out code
2. Installs dependencies
3. Builds the project
4. Deploys to Cloudflare Pages

---

### Step 4: Configure Environment Variables

#### In Cloudflare Dashboard

1. Go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add production variables:

```bash
# Base path for repository scanning
BASE_PATH=/Users/creator/Documents/DEV

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

#### For Telegram Notifications (Optional)

1. **Create Telegram Bot**
   - Message @BotFather on Telegram
   - Send `/newbot`
   - Follow instructions
   - Copy the bot token

2. **Get Your Chat ID**
   - Message your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

3. **Add to Cloudflare**
   - Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as environment variables

---

### Step 5: Configure Deployment Webhook

#### Set Up Deployment Notifications

1. **In Cloudflare Pages Settings**
   - Navigate to **Webhooks**
   - Click "Add webhook"
   - URL: `https://thewatchmen.pages.dev/api/deployment`
   - Events: Select "Deployment succeeded"

2. **Test Webhook**
   ```bash
   curl -X POST https://thewatchmen.pages.dev/api/deployment \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

---

## 🔧 Configuration Files

### Created Files

1. **`wrangler.toml`** - Cloudflare Workers/Pages config
2. **`.github/workflows/cloudflare-pages.yml`** - GitHub Actions
3. **`public/_headers`** - HTTP headers
4. **`public/_redirects`** - URL redirects
5. **`functions/_middleware.js`** - Edge middleware
6. **`functions/api/deployment.js`** - Deployment webhook

---

## 🧪 Testing

### Test Local Deployment

```bash
# Using Wrangler
cd "/Users/creator/Documents/DEV/Repo to 3D"
wrangler pages dev public
```

### Test Production Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "test: Trigger deployment"
   git push origin main
   ```

2. **Monitor Deployment**
   - Check GitHub Actions: https://github.com/memorymusicllc/pow3r.build/actions
   - Check Cloudflare: https://dash.cloudflare.com → Pages → thewatchmen

3. **Verify Live Site**
   - Visit: https://thewatchmen.pages.dev
   - Should see your 3D visualization

---

## 📊 Monitoring

### Cloudflare Analytics

1. **Access Analytics**
   - Go to Pages project
   - Click "Analytics"
   - View: Requests, Bandwidth, Errors

2. **View Deployment Logs**
   - Go to "Deployments"
   - Click on any deployment
   - View build logs and status

### GitHub Actions

- **View Workflow Runs**: https://github.com/memorymusicllc/pow3r.build/actions
- **Check Status Badge**: Add to README
  ```markdown
  ![Deploy](https://github.com/memorymusicllc/pow3r.build/workflows/Deploy%20to%20Cloudflare%20Pages/badge.svg)
  ```

---

## 🔒 Security

### API Tokens

- ✅ Store tokens in GitHub Secrets (never commit)
- ✅ Use least-privilege permissions
- ✅ Rotate tokens periodically

### Environment Variables

- ✅ Set via Cloudflare dashboard
- ✅ Never hardcode sensitive data
- ✅ Use different values for preview/production

### Headers

Security headers are configured in `public/_headers`:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

---

## 🐛 Troubleshooting

### Deployment Fails

**Issue**: Build fails on Cloudflare
```
Solution:
1. Check build logs in Cloudflare dashboard
2. Verify public/ directory exists
3. Check GitHub Actions logs
```

### Site Not Accessible

**Issue**: 404 or blank page
```
Solution:
1. Verify index.html exists in public/
2. Check _redirects configuration
3. Clear Cloudflare cache: Settings → Cache → Purge
```

### Environment Variables Not Working

**Issue**: Variables undefined
```
Solution:
1. Check spelling in Cloudflare dashboard
2. Verify variables set for production environment
3. Redeploy after adding variables
```

### Telegram Notifications Not Sending

**Issue**: No notifications received
```
Solution:
1. Verify bot token is correct
2. Check chat ID is correct
3. Test bot by messaging it directly
4. Check Cloudflare function logs
```

---

## 🔄 Automatic Deployments

### How It Works

1. **Push to GitHub** → Triggers GitHub Actions
2. **GitHub Actions** → Builds and deploys to Cloudflare
3. **Cloudflare Pages** → Deploys to edge network
4. **Deployment Complete** → Triggers webhook
5. **Webhook Handler** → Checks for pow3r.status.json
6. **The Watchmen** → Sends notification (if configured)

### Deployment Workflow

```
Developer pushes code
        ↓
GitHub Actions triggered
        ↓
Install dependencies
        ↓
Build project (if needed)
        ↓
Deploy to Cloudflare Pages
        ↓
Live on thewatchmen.pages.dev
        ↓
Webhook triggered
        ↓
Telegram notification sent
```

---

## 📝 Best Practices

### Before Each Deploy

- ✅ Test locally with `wrangler pages dev`
- ✅ Validate config files
- ✅ Check for breaking changes
- ✅ Update version numbers

### After Each Deploy

- ✅ Verify site loads
- ✅ Check browser console for errors
- ✅ Test main functionality
- ✅ Monitor analytics

### Regular Maintenance

- ✅ Review deployment logs weekly
- ✅ Update dependencies monthly
- ✅ Rotate API tokens quarterly
- ✅ Check security headers

---

## 🚀 Advanced Features

### Custom Functions

Add serverless functions in `functions/` directory:

```javascript
// functions/api/status.js
export async function onRequest() {
  return new Response(JSON.stringify({
    status: 'operational',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Edge Caching

Configure caching in `_headers`:
```
/*.json
  Cache-Control: public, max-age=300
```

### Preview Deployments

Every pull request automatically gets a preview URL:
- Format: `https://abc123.thewatchmen.pages.dev`
- Test changes before merging

---

## 📚 Resources

### Official Documentation

- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Wrangler**: https://developers.cloudflare.com/workers/wrangler
- **GitHub Actions**: https://docs.github.com/actions

### Useful Links

- **Dashboard**: https://dash.cloudflare.com
- **Status Page**: https://www.cloudflarestatus.com
- **Community**: https://community.cloudflare.com

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Repository connected to Cloudflare Pages
- [ ] GitHub Actions workflow configured
- [ ] API tokens added to GitHub Secrets
- [ ] Environment variables set in Cloudflare
- [ ] First deployment successful
- [ ] Site accessible at thewatchmen.pages.dev
- [ ] Webhook configured (optional)
- [ ] Telegram notifications working (optional)
- [ ] Security headers configured
- [ ] Analytics accessible

---

## 🎉 You're Done!

Your repository is now automatically deployed to:
**https://thewatchmen.pages.dev**

Every push to `main` triggers a new deployment!

---

**Next Steps**:
1. Visit https://thewatchmen.pages.dev
2. Test the visualization
3. Monitor deployments
4. Enjoy automatic updates!

