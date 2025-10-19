# GitHub Repository Status Automation - Workflow

This document describes the complete workflow for automatically tracking and visualizing GitHub repository status.

## System Architecture

```
┌─────────────────┐
│  GitHub Repos   │
└────────┬────────┘
         │
         │ (1) Webhook Events
         │     (push, PR, release)
         ↓
┌─────────────────────────┐
│  CloudFlare Worker      │
│  /api/github-webhook    │
├─────────────────────────┤
│  - Verify signature     │
│  - Fetch repo data      │
│  - Generate status      │
│  - Store in KV          │
│  - Trigger aggregation  │
└────────┬────────────────┘
         │
         │ (2) Store Status
         ↓
┌─────────────────────────┐
│  CloudFlare KV Storage  │
├─────────────────────────┤
│  status:repo-1          │
│  status:repo-2          │
│  ...                    │
│  aggregated-status      │
└────────┬────────────────┘
         │
         │ (3) Fetch Status
         ↓
┌─────────────────────────┐
│  CloudFlare Worker      │
│  /api/status            │
├─────────────────────────┤
│  - Serve aggregated     │
│  - or specific repo     │
└────────┬────────────────┘
         │
         │ (4) Load Data
         ↓
┌─────────────────────────┐
│  3D Visualization       │
│  app.js                 │
├─────────────────────────┤
│  - Load config          │
│  - Render nodes/edges   │
│  - Interactive graph    │
└─────────────────────────┘
```

## Workflow Steps

### Initial Setup (One-time)

1. **Generate GitHub Token**
   - Create Personal Access Token with `repo` and `admin:repo_hook` scopes
   - Store securely (never commit to git)

2. **Setup CloudFlare Workers**
   ```bash
   # Create KV namespace
   wrangler kv:namespace create "STATUS_KV"
   
   # Store secrets
   wrangler kv:key put --binding=STATUS_KV "GITHUB_TOKEN" "your_token"
   wrangler kv:key put --binding=STATUS_KV "GITHUB_WEBHOOK_SECRET" "your_secret"
   
   # Deploy workers
   wrangler pages deploy public
   ```

3. **Initial Repository Scan**
   ```bash
   # Scan all GitHub repos
   python github_scanner.py
   
   # Aggregate status files
   python status_aggregator.py ./github-status --output ./public/pow3r.v3.status.json
   
   # Deploy
   wrangler pages deploy public
   ```

4. **Setup Webhooks**
   ```bash
   # Configure webhooks on all repos
   python setup_github_webhooks.py
   ```

### Automatic Updates (Ongoing)

1. **Developer Pushes Code**
   - Developer commits and pushes to any repository
   - GitHub receives the push

2. **GitHub Webhook Triggers**
   - GitHub sends POST request to `/api/github-webhook`
   - Includes event type and repository data
   - Signed with HMAC-SHA256

3. **Worker Processes Event**
   - Verifies webhook signature
   - Fetches latest repository data:
     - Recent commits
     - Languages
     - Contributors
     - Branches
   - Infers development status (green/orange/red/gray)
   - Discovers architectural components
   - Generates `pow3r.status.json`

4. **Worker Stores Status**
   - Saves status to KV: `status:repo-name`
   - Includes metadata: timestamp, event type

5. **Worker Aggregates**
   - Fetches all `status:*` keys from KV
   - Combines into unified graph
   - Stores as `aggregated-status`
   - Total nodes, edges, status counts

6. **Visualization Updates**
   - User visits website
   - app.js fetches `/api/status`
   - Loads aggregated graph data
   - Renders 3D visualization
   - Shows real-time status

## Data Flow

### Status Generation

```python
# github_scanner.py generates:
{
  "graphId": "unique-hash",
  "projectName": "repo-name",
  "status": "green",          # Inferred from activity
  "stats": {
    "totalCommitsLast30Days": 42,
    "stars": 100,
    ...
  },
  "nodes": [                  # Discovered components
    {
      "id": "repo-main",
      "type": "service.repository",
      ...
    },
    {
      "id": "repo-src",
      "type": "component.source",
      ...
    }
  ],
  "edges": [                  # Component relationships
    {
      "from": "repo-main",
      "to": "repo-src",
      "type": "contains"
    }
  ]
}
```

### Status Aggregation

```python
# status_aggregator.py combines to:
{
  "projectName": "All GitHub Repositories",
  "totalProjects": 25,
  "nodes": [
    # Project 1 nodes (with positions)
    # Project 2 nodes (with positions)
    # ...
  ],
  "edges": [
    # Intra-project edges
    # Inter-project edges (shared topics/languages)
  ],
  "stats": {
    "totalNodes": 150,
    "totalEdges": 200,
    "statusCounts": {
      "green": 10,
      "orange": 8,
      "red": 2,
      "gray": 5
    }
  }
}
```

### Visualization Loading

```javascript
// app.js loads in priority order:
1. /pow3r.v3.status.json  (static file)
2. /api/status                (live from KV)
3. /data.json                 (fallback)

// Converts to internal format:
{
  nodes: [
    {
      id: "unique-id",
      name: "Component Name",
      status: "green",
      position: {x, y, z},
      ...
    }
  ],
  edges: [
    {
      from: "node-1",
      to: "node-2",
      type: "uses"
    }
  ]
}
```

## Event Types and Actions

### Tracked GitHub Events

| Event | Trigger | Action |
|-------|---------|--------|
| `push` | Code pushed | Update commit count, infer status |
| `pull_request` | PR opened/merged | Update status |
| `release` | New release | Mark as active, update version |
| `create` | Branch/tag created | Update branch count |
| `delete` | Branch/tag deleted | Update branch count |
| `repository` | Repo settings changed | Update metadata |

### Status Inference Rules

| Condition | Status |
|-----------|--------|
| 5+ commits in 14 days | 🟢 Green (active) |
| 2-4 commits in 14 days | 🟠 Orange (moderate) |
| 10+ open issues, low activity | 🔴 Red (needs attention) |
| No commits in 90+ days | ⚫ Gray (stale) |
| Archived or disabled | ⚫ Gray (archived) |

### Component Discovery

Components are discovered from directory structure:

| Directory | Type | Category |
|-----------|------|----------|
| `src/` | component.source | Source |
| `public/` | component.ui | Frontend |
| `server/` | service.backend | Backend |
| `api/` | service.api | API |
| `functions/` | service.serverless | Functions |
| `components/` | component.ui.react | UI |
| `lib/` | library.js | Library |
| `docs/` | doc.markdown | Documentation |
| `tests/` | test.e2e | Testing |

## Monitoring and Debugging

### Check Worker Logs

```bash
# Tail live logs
wrangler tail

# View logs in dashboard
# https://dash.cloudflare.com → Workers → Logs
```

### Test Webhook Manually

```bash
# Trigger webhook test in GitHub
# Repository → Settings → Webhooks → [Your webhook] → Recent Deliveries → Redeliver

# Or use curl:
curl -X POST https://your-domain.pages.dev/api/github-webhook \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=..." \
  -H "Content-Type: application/json" \
  -d @webhook-payload.json
```

### Verify Status Storage

```bash
# Check KV storage
wrangler kv:key list --binding=STATUS_KV

# Get specific status
wrangler kv:key get --binding=STATUS_KV "status:repo-name"

# Get aggregated status
wrangler kv:key get --binding=STATUS_KV "aggregated-status"
```

### Test API Endpoints

```bash
# Get aggregated status
curl https://your-domain.pages.dev/api/status

# Get specific repo status
curl https://your-domain.pages.dev/api/status?repo=pow3r.build

# Pretty print JSON
curl https://your-domain.pages.dev/api/status | jq .
```

## Performance Considerations

### CloudFlare KV Limits

- **Read**: Unlimited (with caching)
- **Write**: 1000 writes/second per account
- **Storage**: 1 GB free, then $0.50/GB

### Optimization Strategies

1. **Caching**
   - API responses cached for 5 minutes
   - Static files cached by CloudFlare CDN

2. **Rate Limiting**
   - Webhooks are rate-limited by GitHub
   - Worker handles bursts gracefully

3. **Aggregation**
   - Only re-aggregate on change
   - Store aggregated result in KV
   - Avoids fetching all statuses on each request

## Scaling

### For Many Repositories (100+)

1. **Batch Processing**
   - Process webhooks in batches
   - Use Durable Objects for coordination

2. **Partial Aggregation**
   - Only update changed repositories
   - Merge with existing aggregated status

3. **Scheduled Cleanup**
   - Remove stale statuses periodically
   - Archive old data

### For Large Organizations

1. **Multiple KV Namespaces**
   - Separate KV per team/project
   - Aggregate across namespaces

2. **Database Integration**
   - Store full history in D1 (CloudFlare SQL)
   - KV for latest status only

3. **Advanced Visualization**
   - Filter by team/project
   - Multiple graph layouts
   - Time-based animations

## Maintenance

### Daily

- ✅ Monitor webhook deliveries (should be automatic)
- ✅ Check CloudFlare Worker logs for errors

### Weekly

- 🔄 Review status distribution (green/orange/red/gray)
- 🔄 Verify webhook configuration on new repos

### Monthly

- 🔄 Rotate GitHub tokens
- 🔄 Update webhook secrets
- 🔄 Clean up KV storage (remove deleted repos)
- 🔄 Review and optimize component detection rules

## Troubleshooting

### Webhook Not Triggering

1. Check GitHub webhook settings
2. Verify webhook secret matches KV
3. Check webhook delivery logs in GitHub
4. Test with "Redeliver" button

### Status Not Updating

1. Check CloudFlare Worker logs
2. Verify GitHub token permissions
3. Check KV bindings in wrangler.toml
4. Manually trigger webhook

### Visualization Not Loading

1. Check browser console
2. Verify API endpoint returns data
3. Check CORS headers
4. Verify JSON format

### Performance Issues

1. Check KV read/write limits
2. Optimize aggregation frequency
3. Add caching layers
4. Review component discovery complexity

## Future Enhancements

### Planned Features

- [ ] Historical status tracking
- [ ] Trend analysis and predictions
- [ ] Team/project grouping
- [ ] Custom status rules per repo
- [ ] Email/Slack notifications
- [ ] Advanced filtering in UI
- [ ] Export to Obsidian Canvas
- [ ] Integration with Jira/Linear

### Advanced Integrations

- [ ] CI/CD pipeline status
- [ ] Test coverage metrics
- [ ] Security vulnerability tracking
- [ ] Dependency analysis
- [ ] Code quality scores
- [ ] Time-based animations
- [ ] Multi-user collaboration

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-10  
**Author**: pow3r.build team
