# GitHub Repository Status Automation - Setup Guide

This guide explains how to set up automatic GitHub repository scanning and status reporting with CloudFlare Workers.

## Overview

The automation system consists of:

1. **GitHub Scanner** (`github_scanner.py`) - Scans all GitHub repos and generates `pow3r.status.json` for each
2. **Status Aggregator** (`status_aggregator.py`) - Combines all status files into a unified config
3. **CloudFlare Workers** - Auto-updates status when repositories change via webhooks
4. **3D Visualization** - Displays the unified repository network

## Prerequisites

- Python 3.7+
- GitHub Personal Access Token
- CloudFlare account with Workers enabled
- Node.js 18+ (for local testing)

## Setup Steps

### 1. Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org data if scanning org repos)
   - `admin:repo_hook` (Full control of repository hooks for webhooks)
4. Save the token securely

### 2. Install Dependencies

```bash
# Install Python dependencies
pip install requests

# The scripts use only standard library except for requests
```

### 3. Set Environment Variables

```bash
# GitHub credentials
export GITHUB_TOKEN="your_github_token_here"
export GITHUB_USERNAME="your_username"  # Optional: scan specific user
export GITHUB_ORG="your_org_name"       # Optional: scan organization

# Webhook configuration (for CloudFlare setup)
export WEBHOOK_URL="https://your-domain.pages.dev/api/github-webhook"
export WEBHOOK_SECRET="your_webhook_secret_here"
```

### 4. Initial Repository Scan

Run the GitHub scanner to generate initial status files:

```bash
python github_scanner.py

# Output will be saved to ./github-status/
# Each repository gets its own [repo-name].pow3r.status.json file
# An aggregated.pow3r.status.json is also created
```

### 5. Aggregate Status Files

Combine all status files into the unified config:

```bash
python status_aggregator.py ./github-status ./local-status

# Or specify custom output location:
python status_aggregator.py ./github-status --output ./public/pow3r.status.config.json

# This creates a unified config that the 3D visualization loads
```

### 6. CloudFlare Workers Setup

#### A. Create KV Namespace

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to CloudFlare
wrangler login

# Create KV namespace for status storage
wrangler kv:namespace create "STATUS_KV"

# Note the ID returned, add it to wrangler.toml:
# [[kv_namespaces]]
# binding = "STATUS_KV"
# id = "your_kv_namespace_id"
```

#### B. Store Secrets in KV

```bash
# Store GitHub token
wrangler kv:key put --binding=STATUS_KV "GITHUB_TOKEN" "your_github_token"

# Store webhook secret
wrangler kv:key put --binding=STATUS_KV "GITHUB_WEBHOOK_SECRET" "your_webhook_secret"
```

#### C. Deploy Workers

```bash
# Deploy to CloudFlare Pages
wrangler pages deploy public

# Your webhooks will be available at:
# https://your-domain.pages.dev/api/github-webhook
# https://your-domain.pages.dev/api/status
```

### 7. Setup GitHub Webhooks

Run the webhook setup script to configure webhooks on all your repositories:

```bash
python setup_github_webhooks.py
```

This will:
- Scan all your repositories
- Create webhooks pointing to your CloudFlare Worker
- Configure the webhook to trigger on: push, pull_request, release, create, delete, repository events

### 8. Test the Webhook

Test that webhooks are working:

```bash
# Make a commit to any repository
git commit -m "test webhook" --allow-empty
git push

# Check CloudFlare Worker logs
wrangler tail

# Verify status was updated
curl https://your-domain.pages.dev/api/status
```

## Usage

### Manual Scan

To manually scan all repositories and update status:

```bash
# Scan GitHub repos
python github_scanner.py

# Aggregate status files
python status_aggregator.py ./github-status --output ./public/pow3r.status.config.json

# Deploy updated config
wrangler pages deploy public
```

### Automatic Updates

Once webhooks are set up, status updates happen automatically:

1. You push to a repository
2. GitHub sends webhook to CloudFlare Worker
3. Worker fetches repo data and generates updated `pow3r.status.json`
4. Worker stores status in KV storage
5. Worker triggers re-aggregation of all statuses
6. Aggregated status is available at `/api/status`

### View Status in 3D

1. Navigate to your deployment URL: `https://your-domain.pages.dev`
2. The 3D visualization automatically loads from:
   - `/pow3r.status.config.json` (static file)
   - `/api/status` (live from KV storage)
   - `/data.json` (fallback)

## API Endpoints

### GET /api/status

Returns aggregated status for all repositories.

```bash
curl https://your-domain.pages.dev/api/status
```

### GET /api/status?repo=repo-name

Returns status for a specific repository.

```bash
curl https://your-domain.pages.dev/api/status?repo=pow3r.build
```

### POST /api/github-webhook

GitHub webhook endpoint. Automatically called by GitHub on repository events.

Headers required:
- `X-Hub-Signature-256`: HMAC signature
- `X-GitHub-Event`: Event type

## Status File Format

Each repository generates a `pow3r.status.json` file with:

```json
{
  "graphId": "unique-hash",
  "projectName": "repository-name",
  "lastScan": "2025-10-10T00:00:00Z",
  "source": "github",
  "status": "green|orange|red|gray",
  "stats": {
    "totalCommitsLast30Days": 42,
    "stars": 100,
    "forks": 20,
    ...
  },
  "nodes": [
    {
      "id": "node-id",
      "name": "Component Name",
      "type": "component.ui.react",
      "status": "green",
      ...
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "from": "node-1",
      "to": "node-2",
      "type": "uses",
      ...
    }
  ]
}
```

## Status Color Codes

- 🟢 **Green**: Active development (5+ commits in last 14 days)
- 🟠 **Orange**: Moderate activity (2-4 commits in last 14 days)
- 🔴 **Red**: Low activity with many open issues
- ⚫ **Gray**: Archived, disabled, or stale (no commits in 90+ days)

## Troubleshooting

### Webhook Not Firing

1. Check webhook configuration in repository settings
2. Verify webhook secret matches CloudFlare KV
3. Check CloudFlare Worker logs: `wrangler tail`

### Status Not Updating

1. Verify GitHub token has correct permissions
2. Check KV namespace is correctly bound in `wrangler.toml`
3. Manually trigger webhook test in GitHub settings

### 3D Visualization Not Loading

1. Check browser console for errors
2. Verify `pow3r.status.config.json` exists and is valid JSON
3. Check `/api/status` endpoint returns data

## Scheduled Updates

To run scans on a schedule, use GitHub Actions:

```yaml
# .github/workflows/update-status.yml
name: Update Repository Status

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Scan repositories
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: python github_scanner.py
      
      - name: Aggregate status
        run: python status_aggregator.py ./github-status
      
      - name: Deploy to CloudFlare
        run: npx wrangler pages deploy public
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Advanced Configuration

### Custom Component Detection

Edit `github_scanner.py` to customize component detection:

```python
# Add custom patterns
patterns = {
    'custom-dir': { 'type': 'custom.type', 'category': 'Custom' },
    ...
}
```

### Custom Status Logic

Edit `github_scanner.py` to customize status inference:

```python
def infer_status(repo, commits):
    # Add custom logic
    if repo.name.startswith('experimental-'):
        return 'orange'
    ...
```

## Security Notes

- Never commit GitHub tokens or webhook secrets to git
- Use CloudFlare Workers secrets/KV for sensitive data
- Rotate tokens periodically
- Use webhook signature verification (already implemented)

## Support

For issues or questions:
1. Check CloudFlare Worker logs: `wrangler tail`
2. Review GitHub webhook delivery logs
3. Test endpoints manually with `curl`
4. Check browser console for frontend errors

---

**Last Updated**: 2025-10-10
**Version**: 1.0.0
