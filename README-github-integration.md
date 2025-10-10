# GitHub Integration for Pow3r.build

This feature enables automatic scanning of GitHub repositories to generate `power.status.json` files that visualize the architecture and development status of each codebase in the 3D graph.

## Features

### 1. GitHub Repository Scanner (`github_scanner.py`)
- Scans individual repositories or entire organizations
- Analyzes repository structure, commits, issues, and pull requests
- Generates comprehensive `power.status.json` files
- Determines development status (green/orange/red/gray) for each component
- Discovers relationships between files and components

### 2. Data Aggregator (`data_aggregator.py`)
- Collects all `power.status.json` files from multiple sources
- Formats data for 3D visualization
- Watches for changes and auto-updates
- Generates `data.json` for the frontend

### 3. CloudFlare Workers
- **GitHub Webhook Handler** (`github-webhook.js`): Receives GitHub events
- **Scan Processor** (`scan-processor.js`): Processes repository scans
- **Data API** (`data.js`): Serves aggregated data for visualization

### 4. Webhook Setup (`setup_github_webhooks.py`)
- Automatically configures GitHub webhooks
- Supports organization-wide setup
- Tests webhook connectivity

## Quick Start

### 1. Local Scanning

```bash
# Install dependencies
pip install -r requirements.txt

# Scan a single repository
python github_scanner.py --token YOUR_GITHUB_TOKEN --repo owner/repo

# Scan an entire organization
python github_scanner.py --token YOUR_GITHUB_TOKEN --org your-org

# Aggregate data for visualization
python data_aggregator.py

# Watch for changes
python data_aggregator.py --watch
```

### 2. CloudFlare Setup

1. **Configure CloudFlare KV Namespaces**:
```bash
wrangler kv:namespace create "REPO_SCANS"
wrangler kv:namespace create "REPO_STATUS"
wrangler kv:namespace create "POWER_STATUS"
```

2. **Set CloudFlare Secrets**:
```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put GITHUB_WEBHOOK_SECRET
```

3. **Update `wrangler.toml`**:
```toml
name = "thewatchmen"
compatibility_date = "2024-01-01"
pages_build_output_dir = "public"

[[kv_namespaces]]
binding = "REPO_SCANS"
id = "your-namespace-id"

[[kv_namespaces]]
binding = "REPO_STATUS"
id = "your-namespace-id"

[[kv_namespaces]]
binding = "POWER_STATUS"
id = "your-namespace-id"

# Optional R2 bucket for larger storage
[[r2_buckets]]
binding = "POWER_STATUS_BUCKET"
bucket_name = "power-status"
```

4. **Deploy Workers**:
```bash
wrangler pages publish
```

### 3. GitHub Webhook Setup

```bash
# Setup webhooks for an organization
python setup_github_webhooks.py \
  --token YOUR_GITHUB_TOKEN \
  --webhook-url https://thewatchmen.pages.dev/api/github-webhook \
  --secret YOUR_WEBHOOK_SECRET \
  --org your-org

# Setup webhook for a single repository
python setup_github_webhooks.py \
  --token YOUR_GITHUB_TOKEN \
  --webhook-url https://thewatchmen.pages.dev/api/github-webhook \
  --secret YOUR_WEBHOOK_SECRET \
  --repo owner/repo

# List existing webhooks
python setup_github_webhooks.py \
  --token YOUR_GITHUB_TOKEN \
  --repo owner/repo \
  --list
```

## Architecture

### Data Flow

1. **GitHub Events** → CloudFlare Webhook Handler
2. **Webhook Handler** → Queues repository scan
3. **Scan Processor** → Generates `power.status.json`
4. **Data API** → Aggregates all data
5. **3D Visualization** → Fetches from Data API

### Status Determination

#### Repository Status
- **Green**: Active development, no critical issues
- **Orange**: Many pending PRs or in-progress work
- **Red**: Critical bugs or blockers present
- **Gray**: No recent activity (stale)

#### File Status
- **Green**: Recently modified (stable development)
- **Orange**: Heavily modified (>10 changes in 30 days)
- **Gray**: No recent changes
- **Red**: (Reserved for files with errors)

### Node Types Mapping

| power.status.json Type | Visualization Type | Description |
|----------------------|-------------------|-------------|
| component.ui.react | ui | React components |
| component.ui.3d | 3d | 3D/Three.js components |
| service.backend | service | Backend services/APIs |
| config.schema | config | Configuration files |
| doc.markdown | doc | Documentation |
| test.e2e | test | Test files |
| workflow.ci-cd | workflow | CI/CD workflows |
| library.js | lib | JavaScript libraries |

## API Endpoints

### CloudFlare Workers

#### GitHub Webhook
```
POST /api/github-webhook
Headers:
  X-Hub-Signature-256: <signature>
  X-GitHub-Event: <event-type>
```

#### Scan Status
```
GET /api/github-webhook?scanId=<scan-id>
GET /api/github-webhook?repository=<owner/repo>
```

#### Data API
```
GET /api/data
Response: {
  success: true,
  timestamp: "2025-01-01T00:00:00Z",
  summary: {
    totalProjects: 10,
    totalNodes: 250,
    totalEdges: 500,
    sources: ["github", "cloudflare"]
  },
  projects: [...]
}
```

## Environment Variables

### GitHub Scanner
- `GITHUB_TOKEN`: Personal access token with repo scope

### CloudFlare Workers
- `GITHUB_TOKEN`: GitHub API token
- `GITHUB_WEBHOOK_SECRET`: Webhook verification secret
- `NOTIFICATION_WEBHOOK`: Optional webhook for notifications
- `AGGREGATION_WEBHOOK`: Optional webhook to trigger aggregation

## Troubleshooting

### Common Issues

1. **Webhook not triggering**:
   - Verify webhook URL is correct
   - Check CloudFlare worker logs
   - Test with ping event

2. **Rate limiting**:
   - GitHub API has rate limits
   - Use pagination for large organizations
   - Consider caching responses

3. **Missing data**:
   - Check file permissions
   - Verify GitHub token has required scopes
   - Check KV namespace bindings

### Debug Commands

```bash
# Test GitHub API access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Test webhook manually
curl -X POST https://your-worker.workers.dev/api/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "Design for failure."}'

# Check CloudFlare KV
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
```

## Security Considerations

1. **Token Security**:
   - Never commit tokens to version control
   - Use CloudFlare secrets for production
   - Rotate tokens regularly

2. **Webhook Verification**:
   - Always verify webhook signatures
   - Use strong webhook secrets
   - Validate payload structure

3. **Access Control**:
   - Limit GitHub token scopes
   - Use read-only tokens where possible
   - Monitor API usage

## Next Steps

1. **Enhanced Analysis**:
   - Add code complexity metrics
   - Integrate with AI for better insights
   - Analyze dependencies

2. **Performance**:
   - Implement incremental updates
   - Add caching layers
   - Optimize large repository handling

3. **Visualization**:
   - Add real-time updates via WebSocket
   - Implement diff visualization
   - Add timeline view

## Related Documentation

- [Main README](README.md)
- [CloudFlare Setup](CLOUDFLARE_SETUP.md)
- [3D Visualization](3JS%20Three.js%20Data%20Visualization%20Generated%20by%20AI.md)