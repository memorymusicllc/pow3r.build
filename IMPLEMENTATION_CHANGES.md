# Implementation Changes - Updated Schema & Features

## Schema Changes

### File Name Change
- **Old**: `dev-status.config.json`
- **New**: `pow3r.status.json`

### Schema Structure Changes

#### Root Level Changes
```json
// OLD
{
  "projectName": "string",
  "lastUpdate": "timestamp",
  "source": "local",
  "nodes": [...],
  "edges": [...]
}

// NEW
{
  "graphId": "unique-id",
  "lastScan": "timestamp",
  "assets": [...],     // renamed from 'nodes'
  "edges": [...]
}
```

#### Asset (Node) Structure Changes
```json
// OLD Node
{
  "id": "node-1",
  "title": "Component Name",
  "type": "component",
  "path": "./src"
}

// NEW Asset
{
  "id": "content-hash",
  "type": "component.ui.react",  // Enum of specific types
  "source": "local",              // Enum: github, local, obsidian, etc.
  "location": "file:///path",
  "metadata": {
    "title": "string",
    "description": "AI-generated summary",
    "tags": ["tag1", "tag2"],
    "version": "1.0.0",
    "authors": ["author"],
    "createdAt": "timestamp",
    "lastUpdate": "timestamp"
  },
  "status": {
    "phase": "green",            // green/orange/red/gray
    "completeness": 0.95,        // 0-1 scale
    "qualityScore": 0.85,        // 0-1 AI assessment
    "notes": "AI recommendations"
  },
  "dependencies": {
    "io": {},
    "universalConfigRef": "schema-version"
  },
  "analytics": {
    "embedding": [0.1, 0.2, ...],  // Vector embedding
    "connectivity": 5,              // Connection count
    "centralityScore": 0.8,         // Graph importance
    "activityLast30Days": 42        // Recent activity
  }
}
```

#### Edge Structure Changes
```json
// OLD
{
  "id": "edge-1",
  "source": "node-1",
  "target": "node-2",
  "type": "uses"
}

// NEW
{
  "from": "asset-id-1",
  "to": "asset-id-2",
  "type": "dependsOn",  // Enum: dependsOn, implements, references, etc.
  "strength": 0.95      // Confidence score
}
```

---

## Feature Changes

### 1. Source Selection (Phase 0 Enhancement)
**Status**: ❌ Not Implemented

**Changes Needed**:
- Add interactive source selection (GitHub vs Local)
- GitHub authentication flow
- Unified repository selection interface

### 2. GitHub Integration
**Status**: ❌ Not Implemented

**Changes Needed**:
- GitHub API client
- Repository fetching
- Issue analysis for status
- Commit analysis via API
- Token management

### 3. Enhanced Schema Support
**Status**: ⚠️ Partial

**Changes Needed**:
- Support new asset types
- Generate AI descriptions
- Calculate quality scores
- Add embeddings (future)
- Enhanced analytics

### 4. Visualization Enhancements
**Status**: ⚠️ Partial

**Changes Needed**:
- Card geometry (not cubes)
- UnrealBloomPass
- CSS2DRenderer labels
- Waveform visualization
- Source badges
- Enhanced edges with types

### 5. Config Management Workflow
**Status**: ❌ Not Implemented

**Changes Needed**:
- Reusable config CRUD operations
- Status checking
- Incremental updates
- Schema validation

---

## Implementation Workflow

### Step 1: Config Management System
Create reusable workflow for all config operations:

```python
class ConfigManager:
    """Manages pow3r.status.json lifecycle"""
    
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.config_file = Path(repo_path) / 'pow3r.status.json'
    
    def exists(self) -> bool:
        """Check if config exists"""
        return self.config_file.exists()
    
    def read(self) -> dict:
        """Read existing config"""
        if self.exists():
            with open(self.config_file, 'r') as f:
                return json.load(f)
        return None
    
    def create(self, data: dict) -> bool:
        """Create new config"""
        with open(self.config_file, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    
    def update(self, updates: dict) -> bool:
        """Update existing config"""
        config = self.read() or {}
        config.update(updates)
        return self.create(config)
    
    def get_status(self) -> str:
        """Get current phase status"""
        config = self.read()
        return config.get('assets', [{}])[0].get('status', {}).get('phase', 'unknown')
    
    def validate(self) -> tuple[bool, list]:
        """Validate against schema"""
        config = self.read()
        errors = []
        
        # Check required fields
        required = ['graphId', 'lastScan', 'assets', 'edges']
        for field in required:
            if field not in config:
                errors.append(f"Missing required field: {field}")
        
        return len(errors) == 0, errors
```

### Step 2: Enhanced Analyzer
Update analyzer to support new schema:

```python
class EnhancedAnalyzer:
    """Generates pow3r.status.json with full schema"""
    
    def generate_graph_id(self, repo_name: str) -> str:
        """Generate unique graph ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.sha256(f"{repo_name}-{timestamp}".encode()).hexdigest()[:16]
    
    def analyze_asset(self, component_path: Path) -> dict:
        """Analyze single asset with full metadata"""
        return {
            "id": self.generate_asset_id(component_path),
            "type": self.detect_asset_type(component_path),
            "source": self.source_type,  # 'github' or 'local'
            "location": str(component_path.as_uri()),
            "metadata": self.extract_metadata(component_path),
            "status": self.assess_status(component_path),
            "dependencies": self.extract_dependencies(component_path),
            "analytics": self.calculate_analytics(component_path)
        }
    
    def detect_asset_type(self, path: Path) -> str:
        """Detect specific asset type"""
        type_map = {
            '.jsx': 'component.ui.react',
            '.tsx': 'component.ui.react',
            '.vue': 'component.ui.vue',
            'server.js': 'service.backend',
            'config.json': 'config.schema',
            '.md': 'doc.markdown',
            '.canvas': 'doc.canvas'
        }
        # Detection logic...
    
    def extract_metadata(self, path: Path) -> dict:
        """Extract comprehensive metadata"""
        return {
            "title": self.extract_title(path),
            "description": self.generate_description(path),  # AI-enhanced
            "tags": self.extract_tags(path),
            "version": self.extract_version(path),
            "authors": self.extract_authors(path),
            "createdAt": self.get_creation_date(path),
            "lastUpdate": self.get_last_modified(path)
        }
    
    def assess_status(self, path: Path) -> dict:
        """Assess asset status with quality score"""
        return {
            "phase": self.infer_phase(path),  # green/orange/red/gray
            "completeness": self.calculate_completeness(path),
            "qualityScore": self.assess_quality(path),
            "notes": self.generate_notes(path)
        }
    
    def calculate_analytics(self, path: Path) -> dict:
        """Calculate analytics metrics"""
        return {
            "embedding": [],  # TODO: Add vector embeddings
            "connectivity": self.count_connections(path),
            "centralityScore": self.calculate_centrality(path),
            "activityLast30Days": self.get_activity(path)
        }
```

### Step 3: GitHub Integration
Add GitHub API support:

```python
class GitHubAnalyzer(EnhancedAnalyzer):
    """Analyzer for GitHub repositories"""
    
    def __init__(self, org: str, token: str):
        super().__init__()
        self.org = org
        self.token = token
        self.source_type = 'github'
        self.headers = {'Authorization': f'token {token}'}
    
    def fetch_repositories(self) -> list:
        """Fetch all org repos"""
        url = f'https://api.github.com/orgs/{self.org}/repos'
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def analyze_via_api(self, repo_name: str) -> dict:
        """Analyze using GitHub API"""
        # Get commits
        commits = self.fetch_commits(repo_name, since='30 days ago')
        
        # Get issues
        issues = self.fetch_issues(repo_name)
        
        # Get contributors
        contributors = self.fetch_contributors(repo_name)
        
        # Infer status from API data
        status = self.infer_status_from_api(commits, issues)
        
        return self.build_config(repo_name, commits, issues, status)
```

### Step 4: Unified CLI
Create unified entry point:

```python
def main():
    """Unified CLI entry point"""
    print("🚀 Pow3r.Build - Repository Analysis Tool")
    print("=" * 50)
    
    # Step 1: Source Selection
    source = select_source()  # 'github' or 'local'
    
    # Step 2: Authentication/Path Setup
    if source == 'github':
        org = input("GitHub Organization: ")
        token = input("GitHub Token: ")
        analyzer = GitHubAnalyzer(org, token)
        repos = analyzer.fetch_repositories()
    else:
        path = input("Root Directory: ")
        analyzer = LocalAnalyzer(path)
        repos = analyzer.scan_repositories()
    
    # Step 3: Repository Selection
    selected = interactive_select(repos)
    
    # Step 4: Analysis with Config Management
    for repo in selected:
        print(f"\n📊 Analyzing: {repo['name']}")
        
        config_mgr = ConfigManager(repo['path'])
        
        if config_mgr.exists():
            print("  ✓ Config exists, checking status...")
            status = config_mgr.get_status()
            print(f"  Current status: {status}")
            
            # Update existing
            updates = analyzer.analyze_incremental(repo)
            config_mgr.update(updates)
        else:
            print("  → Creating new config...")
            config = analyzer.analyze_full(repo)
            config_mgr.create(config)
        
        # Validate
        valid, errors = config_mgr.validate()
        if valid:
            print("  ✓ Config validated")
        else:
            print(f"  ⚠️ Validation errors: {errors}")
```

---

## Priority Order

### Phase 1: Core Schema Update ⚡ HIGH
1. ✅ Rename files: `dev-status.config.json` → `pow3r.status.json`
2. ✅ Update schema structure
3. ✅ Add ConfigManager class
4. ✅ Update existing analyzer

### Phase 2: GitHub Integration ⚡ HIGH
5. ✅ Add GitHub API client
6. ✅ Implement GitHubAnalyzer
7. ✅ Add source selection to CLI
8. ✅ Test with real GitHub repos

### Phase 3: Enhanced Visualization 🎨 HIGH
9. ✅ Update server to find `pow3r.status.json`
10. ✅ Implement card geometry
11. ✅ Add UnrealBloomPass
12. ✅ Add CSS2DRenderer labels
13. ✅ Create waveforms
14. ✅ Add source badges

### Phase 4: Advanced Features 📊 MEDIUM
15. ⏳ AI descriptions (placeholder)
16. ⏳ Quality score calculation
17. ⏳ Enhanced edge types
18. ⏳ Analytics calculations

### Phase 5: The Watchmen 🤖 FUTURE
19. 📋 Cloudflare Worker
20. 📋 Telegram integration
21. 📋 Auto-update on deploy

---

## File Changes Required

### Python Files
- `analyze.py` - Add source selection
- `phase1_analyzer.py` - Rename to `enhanced_analyzer.py`, update schema
- `run_phase1.py` - Update for new workflow
- **NEW**: `config_manager.py` - Config lifecycle management
- **NEW**: `github_analyzer.py` - GitHub API integration

### JavaScript Files
- `server/server.js` - Find `pow3r.status.json` files
- `public/app.js` - Enhanced visualization
- `public/index.html` - Updated UI

### Documentation
- All docs updated with new schema
- New guide for GitHub integration

---

## Migration Path

### For Existing Configs
```python
def migrate_old_config(old_path: Path) -> dict:
    """Migrate dev-status.config.json to pow3r.status.json"""
    with open(old_path, 'r') as f:
        old = json.load(f)
    
    new = {
        "graphId": generate_graph_id(old['projectName']),
        "lastScan": datetime.now().isoformat(),
        "assets": []
    }
    
    # Convert nodes to assets
    for node in old.get('nodes', []):
        asset = {
            "id": node['id'],
            "type": detect_type_from_old(node),
            "source": old.get('source', 'local'),
            "location": node.get('path', ''),
            "metadata": {
                "title": node.get('title', ''),
                "lastUpdate": old.get('lastUpdate', '')
            },
            "status": {
                "phase": node.get('status', 'gray'),
                "completeness": 0.5,
                "qualityScore": 0.5,
                "notes": ""
            },
            "analytics": {
                "activityLast30Days": node.get('totalCommitsLast30Days', 0)
            }
        }
        new['assets'].append(asset)
    
    # Convert edges
    new['edges'] = old.get('edges', [])
    
    return new
```

---

## Testing Plan

### Unit Tests
- ConfigManager operations
- Schema validation
- Asset type detection
- Status inference

### Integration Tests  
- GitHub API calls
- Local Git operations
- Config generation
- Server endpoint

### Visual Tests
- Card rendering
- Bloom effect
- Label positioning
- Waveform generation

---

## Success Criteria

✅ All 30 repos have `pow3r.status.json`
✅ Schema validation passes
✅ GitHub integration works
✅ Visualization shows card-based nodes
✅ Bloom effect active
✅ Source badges display
✅ All tests pass
✅ Pushed to GitHub

---

Next: Implement in order of priority!

