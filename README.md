# Repository to 3D Visualization Tool

A comprehensive system for discovering, analyzing, and visualizing local Git repositories in interactive 3D.

**Status**: ✅ **ALL PHASES COMPLETE**

## Overview

This tool provides a complete workflow to:
- 🔍 **Discover** - Scan directories for Git repositories
- ✅ **Select** - Interactively choose repos to analyze
- 📊 **Analyze** - Deep analysis of Git history and code structure
- 🎨 **Visualize** - Interactive 3D network visualization
- 📈 **Monitor** - Track development status and activity

## Quick Start

```bash
cd "/Users/creator/Documents/DEV/Repo to 3D"

# 1. Select repositories (Phase 0)
python analyze.py /Users/creator/Documents/DEV

# 2. Analyze repositories (Phase 1) 
python run_phase1.py --markdown "selection.md" --base-path "/path"

# 3. Launch 3D visualization (Phase 2)
./start-visualization.sh
```

→ **[See QUICKSTART.md for detailed steps](QUICKSTART.md)**

## Installation

### Requirements
- Python 3.7+
- Git installed and accessible from command line
- Unix-like terminal with ANSI color support (macOS, Linux, or WSL)

### Setup

```bash
cd /Users/creator/Documents/DEV/repo-analyzer
chmod +x analyze.py
```

## Usage

### Basic Usage

```bash
python analyze.py /path/to/root/directory
```

### Examples

```bash
# Scan your entire DEV directory
python analyze.py ~/Documents/DEV

# Scan a specific projects folder
python analyze.py ~/dev/projects

# Use absolute path
python analyze.py /Users/creator/Documents/DEV
```

## Features

### Phase 0: Repository Selection

The tool provides an interactive CLI interface with the following features:

#### 1. Automatic Repository Discovery
- Recursively scans directory trees
- Identifies all directories containing `.git` folders
- Skips hidden directories (except `.git`)
- Handles permission errors gracefully

#### 2. Repository Metadata Collection
For each repository found, the tool gathers:
- **Name**: Repository directory name
- **Path**: Absolute and relative paths
- **Branch**: Current Git branch
- **Remote**: Git remote URL (if configured)
- **Last Commit**: Date of most recent commit
- **File Count**: Total number of files (excluding `.git`)
- **Size**: Total repository size in MB

#### 3. Interactive Selection Interface
Multiple selection methods:
- **Individual**: `1 3 5` - Select specific repositories
- **Range**: `1-10` - Select a range of repositories
- **All**: `all` - Select all repositories
- **None**: `none` - Clear all selections
- **Done**: `done` - Confirm selection and proceed

#### 4. Visual Feedback
- Color-coded terminal output
- Selection indicators (✓)
- Progress messages
- Summary statistics

#### 5. Data Persistence
Saves selection to JSON file:
```json
{
  "timestamp": "2025-10-02T...",
  "total_selected": 5,
  "repositories": [...]
}
```

## Interactive Selection Commands

| Command       | Description                           |
| ------------- | ------------------------------------- |
| `1 3 5`       | Select repositories 1, 3, and 5       |
| `1-5`         | Select repositories 1 through 5       |
| `1-5 8 10-12` | Combine ranges and individual numbers |
| `all`         | Select all repositories               |
| `none`        | Clear all selections                  |
| `done`        | Finish selection and proceed          |
| `quit` or `q` | Exit without saving                   |

## Output

### Console Output
```
🔍 Scanning for Git repositories in: /Users/creator/Documents/DEV
Please wait...

✓ Found 25 repositories

Found 25 Git repositories:

[✓]   1. PowerFlow
      Path: PowerFlow
      Branch: main | Files: 418 | Size: 15.3 MB
      Last commit: 2025-10-01 14:23:15 -0700

[ ]   2. Expunge
      Path: Expunge
      Branch: develop | Files: 479 | Size: 8.7 MB
      Last commit: 2025-09-28 09:45:32 -0700
...
```

### JSON Output
Selection saved to: `.repo-analyzer/selected_repositories_[timestamp].json`

```json
{
  "timestamp": "2025-10-02T10:30:45.123456",
  "total_selected": 3,
  "repositories": [
    {
      "name": "PowerFlow",
      "path": "/Users/creator/Documents/DEV/PowerFlow",
      "relative_path": "PowerFlow",
      "branch": "main",
      "remote": "git@github.com:user/powerflow.git",
      "last_commit": "2025-10-01 14:23:15 -0700",
      "file_count": 418,
      "size_mb": 15.3
    }
  ]
}
```

## Architecture

### Core Components

1. **RepositoryScanner**: Discovers and analyzes repositories
   - `scan()`: Recursively walks directory tree
   - `_analyze_repository()`: Gathers metadata for each repo
   - `_get_git_info()`: Extracts Git branch and remote
   - `_get_last_commit_date()`: Gets last commit timestamp
   - `_get_file_stats()`: Calculates file counts and sizes

2. **InteractiveSelector**: Handles user interaction
   - `display_repositories()`: Shows formatted repository list
   - `interactive_select()`: Runs selection loop
   - `_parse_selection()`: Parses user input (ranges, lists)

3. **Output Functions**:
   - `save_selection()`: Persists selection to JSON
   - `display_summary()`: Shows selection statistics

### Design Principles

- **No External Dependencies**: Uses only Python standard library
- **Graceful Error Handling**: Continues on permission errors
- **User-Friendly Output**: Color-coded, formatted terminal output
- **Fast Scanning**: Efficient directory traversal
- **Cross-Platform**: Works on macOS, Linux, WSL

## Error Handling

The tool handles common errors gracefully:

- **Permission Denied**: Skips directories without access
- **Invalid Path**: Validates directory existence
- **Git Errors**: Falls back to "unknown" for missing Git info
- **Keyboard Interrupt**: Clean exit on Ctrl+C

## Project Phases

This tool is divided into distinct phases:

### Phase 0: Repository Selection ✅ COMPLETE
- Interactive CLI for repository discovery
- Metadata collection (branch, files, size, commits)
- Selection and filtering
- Output to JSON

### Phase 1: Repository Analysis & Data Generation ✅ COMPLETE
- Git history analysis (commits, branches, tags)
- Development status inference (green/orange/red/gray)
- Code structure analysis (language, architecture)
- Component identification (nodes and edges)
- Configuration generation (`dev-status.config.json`)

**→ [See Phase 1 Guide](PHASE1_GUIDE.md) for detailed documentation**

### Phase 2: 3D Visualization Web Application ✅ COMPLETE
- Local web server (Node.js/Express)
- Three.js 3D graph visualization
- Interactive node exploration with click details
- Status-based color coding (green/orange/red/gray)
- Real-time statistics dashboard
- Smooth camera controls (rotate, pan, zoom)
- RESTful API with caching
- Responsive glassmorphism UI

**→ [See Phase 2 Guide](PHASE2_GUIDE.md) for detailed documentation**

### Phase 3: Advanced Features 📋 FUTURE
- Actual dependency graph parsing
- Time-based commit animations
- Multiple layout algorithms
- Export to image/video formats
- GitHub/GitLab API integration
- Real-time monitoring
- Team collaboration features

## Troubleshooting

### Permission Errors
```bash
# If you encounter permission errors, try:
sudo python analyze.py /path/to/directory
```

### Git Not Found
```bash
# Ensure Git is installed:
git --version

# Install Git if needed:
# macOS: brew install git
# Linux: sudo apt-get install git
```

### ANSI Colors Not Displaying
```bash
# Some terminals don't support ANSI colors
# Try using a modern terminal like iTerm2, Terminal.app, or Windows Terminal
```

## Contributing

To extend this tool:

1. Add new analysis methods to `RepositoryScanner`
2. Enhance metadata collection in `_analyze_repository()`
3. Add new selection features to `InteractiveSelector`
4. Implement Phase 1 analysis functions

## License

See parent directory LICENSE file.

## Links

- [Parent README](../README.md)
- Project: Part of the Local Repository Analysis & Generation Tool suite

