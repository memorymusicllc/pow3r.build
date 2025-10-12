# Quick Command Reference

## Setup Commands

```bash
# 1. Generate webhook secret
export WEBHOOK_SECRET="$(openssl rand -hex 32)"
echo "Save this: $WEBHOOK_SECRET"

# 2. Set environment variables
export GITHUB_TOKEN="your_github_personal_access_token"
export WEBHOOK_URL="https://your-domain.pages.dev/api/github-webhook"

# 3. Create CloudFlare KV namespace
wrangler kv:namespace create "STATUS_KV"
# Copy the ID and update wrangler.toml

# 4. Store secrets in KV
wrangler kv:key put --binding=STATUS_KV "GITHUB_TOKEN" "$GITHUB_TOKEN"
wrangler kv:key put --binding=STATUS_KV "GITHUB_WEBHOOK_SECRET" "$WEBHOOK_SECRET"
```

## Daily Usage Commands

```bash
# Scan all GitHub repositories
python github_scanner.py

# Aggregate status files
python status_aggregator.py ./github-status --output ./public/pow3r.status.config.json

# Deploy to CloudFlare
wrangler pages deploy public

# Setup webhooks on all repos (one-time)
python setup_github_webhooks.py

# Monitor webhook activity
wrangler tail
```

## Testing Commands

```bash
# Test API endpoints
curl https://your-domain.pages.dev/api/status | jq .
curl https://your-domain.pages.dev/api/status?repo=repo-name | jq .

# Check KV storage
wrangler kv:key list --binding=STATUS_KV
wrangler kv:key get --binding=STATUS_KV "aggregated-status" | jq .
wrangler kv:key get --binding=STATUS_KV "status:repo-name" | jq .

# Test webhook locally
wrangler dev
# Then trigger from GitHub or use curl

# Validate JSON files
cat github-status/*.json | jq empty
cat public/pow3r.status.config.json | jq .stats
```

## Development Commands

```bash
# Make scripts executable
chmod +x github_scanner.py status_aggregator.py setup_github_webhooks.py

# Install Python dependencies
pip install requests

# Run local dev server
wrangler pages dev public

# Watch logs in real-time
wrangler tail
```

## Maintenance Commands

```bash
# List all webhooks
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/username/repo/hooks

# Delete a webhook
curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/username/repo/hooks/HOOK_ID

# Clean old status files
rm -rf github-status/*.json

# Rotate secrets
export NEW_SECRET="$(openssl rand -hex 32)"
wrangler kv:key put --binding=STATUS_KV "GITHUB_WEBHOOK_SECRET" "$NEW_SECRET"
python setup_github_webhooks.py  # Re-run to update all webhooks
```

## Troubleshooting Commands

```bash
# Check CloudFlare deployment
wrangler pages deployment list

# View CloudFlare logs
wrangler tail --format pretty

# Test webhook signature locally
python -c "import hmac, hashlib; print(hmac.new(b'secret', b'payload', hashlib.sha256).hexdigest())"

# Validate JSON schema
cat pow3r.status.json | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Check GitHub API rate limit
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

## One-Liner Workflows

```bash
# Full scan and deploy
python github_scanner.py && \
python status_aggregator.py ./github-status && \
wrangler pages deploy public

# Quick status check
curl -s https://your-domain.pages.dev/api/status | jq '.stats'

# Count repos by status
curl -s https://your-domain.pages.dev/api/status | jq '.stats.statusCounts'

# List all repos
curl -s https://your-domain.pages.dev/api/status | jq '.nodes[] | select(.type == "service.repository") | .name'
```

## Environment Variables

```bash
# Required
export GITHUB_TOKEN="ghp_..."              # GitHub Personal Access Token
export WEBHOOK_URL="https://..."          # CloudFlare Worker webhook URL
export WEBHOOK_SECRET="..."               # Webhook HMAC secret

# Optional
export GITHUB_USERNAME="username"         # Scan specific user's repos
export GITHUB_ORG="org-name"             # Scan organization repos
```

## File Locations

```
github_scanner.py              → Scans GitHub repos
status_aggregator.py           → Aggregates status files
setup_github_webhooks.py       → Configures webhooks
functions/api/github-webhook.js → Webhook handler
functions/api/status.js        → Status API
public/app.js                  → 3D visualization
public/pow3r.status.config.json → Aggregated config (output)
github-status/                 → Scanner output directory
wrangler.toml                  → CloudFlare configuration
```

## API Endpoints

```
GET  /api/status              → Aggregated status for all repos
GET  /api/status?repo=name    → Status for specific repo
POST /api/github-webhook      → GitHub webhook handler (internal)
GET  /pow3r.status.config.json → Static aggregated config
```

## Status Format Quick Reference

```json
{
  "projectName": "repo-name",
  "status": "green|orange|red|gray",
  "stats": {
    "totalCommitsLast30Days": 42,
    "stars": 100,
    "forks": 20
  },
  "nodes": [
    {
      "id": "node-id",
      "name": "Component",
      "type": "component.ui.react",
      "status": "green"
    }
  ],
  "edges": [
    {
      "from": "node-1",
      "to": "node-2",
      "type": "uses"
    }
  ]
}
```

## Component Types

```
service.repository     → Main repository node
component.source       → Source code (src/)
component.ui          → Frontend UI (public/)
service.backend       → Backend service (server/)
service.api           → API endpoints (api/)
service.serverless    → Serverless functions (functions/)
component.ui.react    → React components (components/)
library.js            → Library code (lib/)
doc.markdown          → Documentation (docs/)
test.e2e              → Tests (tests/)
```

## Status Colors

```
🟢 green  → Active (5+ commits in 14 days)
🟠 orange → Moderate (2-4 commits in 14 days)
🔴 red    → Needs attention (low activity + issues)
⚫ gray   → Stale/archived (90+ days inactive)
```

## Useful JQ Queries

```bash
# Count total repos
jq '.totalProjects' public/pow3r.status.config.json

# List green repos
jq '.nodes[] | select(.status == "green") | .name' public/pow3r.status.config.json

# Count components by type
jq '[.nodes[].type] | group_by(.) | map({type: .[0], count: length})' public/pow3r.status.config.json

# Find most active repos
jq '.nodes[] | select(.stats.totalCommitsLast30Days > 10) | {name, commits: .stats.totalCommitsLast30Days}' github-status/*.json
```
