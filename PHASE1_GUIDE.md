# Phase 1: Repository Analysis & Data Generation - Complete Guide

## Overview

Phase 1 analyzes selected local Git repositories and generates `dev-status.config.json` files containing comprehensive metadata, commit statistics, development status, and architectural information.

## What Phase 1 Does

### 1. Git History Analysis
- Counts commits in the last 14 and 30 days
- Retrieves last commit information (date, message, author)
- Checks working tree cleanliness
- Identifies branches and unmerged hotfixes
- Lists tags

### 2. Status Inference
Automatically determines repository status based on Git activity:

- **🟢 GREEN (Stable)**: Clean working tree + maintenance commits + recent tag
- **🟠 ORANGE (Active Development)**: Recent commits (1+ in last 14 days)
- **🔴 RED (Blocked/Stale)**: Few commits (≤2 in 30 days) OR unmerged hotfix branches
- **⚫ GRAY (Archived)**: No commits in 180+ days

### 3. Code Structure Analysis
- Detects primary programming language
- Identifies package/dependency files
- Maps architectural components (nodes)
- Infers relationships between components (edges)

### 4. Configuration Generation
Creates `dev-status.config.json` in each repository root with:
```json
{
  "projectName": "repository-name",
  "lastUpdate": "2025-09-24T14:50:32-07:00",
  "source": "local",
  "repositoryPath": "/absolute/path/to/repo",
  "branch": "main",
  "status": "orange",
  "stats": {
    "totalCommitsLast30Days": 20,
    "totalCommitsLast14Days": 3,
    "fileCount": 26570,
    "sizeMB": 306.81,
    "primaryLanguage": "javascript",
    "workingTreeClean": false
  },
  "nodes": [...],
  "edges": [...],
  "metadata": {...}
}
```

## Usage

### Option 1: From JSON Selection File

```bash
cd "/Users/creator/Documents/DEV/Repo to 3D"
python run_phase1.py --json <path-to-selection.json>
```

Example:
```bash
python run_phase1.py --json "/Users/creator/Documents/DEV/.repo-analyzer/selected_repositories_20251002_142530.json"
```

### Option 2: From Markdown Selection File

```bash
python run_phase1.py --markdown <path-to-markdown-file> --base-path <repos-base-directory>
```

Example:
```bash
python run_phase1.py --markdown "local-repos-to-map-script-output-selection-list.md" --base-path "/Users/creator/Documents/DEV"
```

### Option 3: Dry Run (No File Creation)

Test analysis without saving config files:
```bash
python run_phase1.py --markdown "selection.md" --base-path "/path" --dry-run
```

## Architecture

### Core Components

#### `phase1_analyzer.py`

**GitAnalyzer**
- `get_commit_activity(days)`: Count commits in time period
- `get_last_commit_info()`: Retrieve last commit metadata
- `get_branch_info()`: List branches and detect hotfixes
- `get_working_tree_status()`: Check for uncommitted changes
- `get_tags()`: List repository tags
- `infer_status()`: Determine repository status

**CodeAnalyzer**
- `detect_primary_language()`: Identify main programming language
- `find_package_files()`: Locate dependency management files
- `identify_architecture_nodes()`: Map architectural components
- `identify_architecture_edges()`: Infer component relationships

**ConfigGenerator**
- `generate_config()`: Create configuration object
- `save_config()`: Write JSON file to repository

**RepositoryAnalyzer**
- Orchestrates the complete analysis workflow
- Handles error reporting
- Provides progress feedback

#### `run_phase1.py`

- Command-line interface
- Selection file parsing (JSON or Markdown)
- Batch processing coordinator
- Results summarization

## Node Identification

Phase 1 identifies architectural nodes based on directory structure patterns:

### Monorepo Patterns
- `packages/` subdirectories → Package nodes
- `apps/` subdirectories → Application nodes

### Common Architectural Patterns
| Directory Name | Node Type | Title |
|----------------|-----------|-------|
| `api` | api | API Layer |
| `backend` | backend | Backend Service |
| `frontend` | frontend | Frontend Application |
| `src` | src | Source Code |
| `lib` | lib | Library |
| `core` | core | Core Module |
| `services` | services | Services Layer |
| `models` | models | Data Models |
| `controllers` | controllers | Controllers |
| `views` | views | Views |
| `components` | components | Components |
| `database`/`db` | database | Database Layer |
| `middleware` | middleware | Middleware |
| `routes` | routes | Routes |
| `handlers` | handlers | Handlers |
| `workers` | workers | Background Workers |
| `tests` | tests | Test Suite |
| `docs` | docs | Documentation |

### Fallback
If no patterns match, creates a single "Main Application" node.

## Edge Identification

Edges (relationships) are inferred based on common architectural patterns:

| Source | Target | Relationship |
|--------|--------|--------------|
| frontend | api | uses |
| frontend | backend | calls |
| api | services | delegates to |
| api | database | queries |
| services | models | uses |
| controllers | services | calls |
| routes | controllers | routes to |
| middleware | routes | protects |

## Supported Languages

- **Python**: `.py`
- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Java**: `.java`
- **C#**: `.cs`
- **Go**: `.go`
- **Rust**: `.rs`
- **Ruby**: `.rb`
- **PHP**: `.php`
- **C++**: `.cpp`, `.cc`, `.cxx`, `.h`, `.hpp`

## Package File Detection

- `package.json` (Node.js/JavaScript)
- `requirements.txt`, `Pipfile`, `pyproject.toml` (Python)
- `pom.xml`, `build.gradle` (Java)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- `composer.json` (PHP)
- `Gemfile` (Ruby)
- `*.csproj`, `*.sln` (C#)

## Output Files

Each analyzed repository gets a `dev-status.config.json` file:

**Location**: `<repository-root>/dev-status.config.json`

**Size**: Typically 1-5 KB per repository

## Example Session

```bash
$ python run_phase1.py --markdown "local-repos-to-map-script-output-selection-list.md" --base-path "/Users/creator/Documents/DEV"

======================================================================
Local Repository Analysis & Generation Tool
Phase 1: Repository Analysis & Data Generation
======================================================================

📂 Loading selection from Markdown...
✓ Loaded 30 repositories

Starting Analysis...

[1/30] 📊 Analyzing: obsidian.power
   Path: /Users/creator/Documents/DEV/Obsidian Suite/obsidian.power
   → Analyzing Git history...
   → Analyzing code structure...
   → Generating configuration...
   → Saving dev-status.config.json...
   ✓ Analysis complete | Status: ORANGE | Nodes: 7 | Edges: 0

[2/30] 📊 Analyzing: power.lines
   ...

======================================================================
ANALYSIS SUMMARY
======================================================================

Total repositories analyzed: 30
Successful: 30
Failed: 0

Status Distribution:
  ● Green (Stable): 0
  ● Orange (Active): 5
  ● Red (Blocked/Stale): 13
  ● Gray (Archived): 12

✓ Phase 1 Analysis Complete!
Generated 30 dev-status.config.json files
Ready to proceed to Phase 2: 3D Visualization
```

## Error Handling

Phase 1 handles common issues gracefully:

- **Permission Errors**: Skips inaccessible files, continues analysis
- **Git Command Failures**: Falls back to default values
- **Missing Directories**: Uses fallback node structure
- **Invalid Paths**: Reports error and continues with other repos

## Performance

- **Speed**: ~2-5 seconds per repository (depends on size)
- **Memory**: Low footprint, processes one repo at a time
- **Scalability**: Tested with 30+ repositories

## Validation

Check if Phase 1 completed successfully:

```bash
# Count generated config files
find /Users/creator/Documents/DEV -name "dev-status.config.json" | wc -l

# View a sample config
cat "/Users/creator/Documents/DEV/Obsidian Suite/obsidian.power/dev-status.config.json" | python -m json.tool
```

## Troubleshooting

### No commits found
- Ensure repository has at least one commit
- Check that `.git` directory exists
- Verify Git is accessible: `git --version`

### Language detection fails
- Add file extensions to `language_extensions` in `CodeAnalyzer`
- Check that source files aren't in ignored directories

### Nodes not detected
- Review directory structure against patterns in guide
- Add custom patterns to `architectural_patterns` dict
- Consider manual node definition for complex projects

## Next Steps

After Phase 1 completes:

1. **Verify Config Files**: Check that `dev-status.config.json` exists in each repository
2. **Review Status Inference**: Ensure statuses match your expectations
3. **Proceed to Phase 2**: Build the 3D visualization web application

## Integration with Phase 2

Phase 2 will:
- Discover all `dev-status.config.json` files via local server
- Aggregate data from multiple repositories
- Render 3D graph visualization with Three.js
- Display interactive nodes colored by status

## Links

- [Phase 0 Guide](README.md) - Repository Selection
- [Phase 2 Guide](PHASE2_GUIDE.md) - 3D Visualization (coming next)
- [Project Overview](PROJECT_OVERVIEW.md)

