# Quick Start Guide

Get your repository visualization running in 3 commands!

## Prerequisites

- Python 3.7+
- Node.js 18+
- Git

## Installation

Already installed! No setup required.

## Usage

### Step 1: Select Repositories (Phase 0)

```bash
cd "/Users/creator/Documents/DEV/Repo to 3D"
python analyze.py /Users/creator/Documents/DEV
```

Follow the interactive prompts to select repositories.

### Step 2: Analyze Repositories (Phase 1)

```bash
python run_phase1.py --markdown "local-repos-to-map-script-output-selection-list.md" --base-path "/Users/creator/Documents/DEV"
```

Wait ~90 seconds for analysis to complete.

### Step 3: Launch Visualization (Phase 2)

```bash
./start-visualization.sh
```

Your browser will automatically open to `http://localhost:3000`!

## Controls

- **Left Mouse**: Rotate view
- **Right Mouse**: Pan camera  
- **Scroll**: Zoom in/out
- **Click Node**: View details
- **ESC**: Close info panel

## What You'll See

- **🟢 Green**: Stable repositories
- **🟠 Orange**: Active development (5 repos)
- **🔴 Red**: Blocked/stale (13 repos)
- **⚫ Gray**: Archived (12 repos)

## Troubleshooting

### Server won't start?

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Use different port
PORT=3001 ./start-visualization.sh
```

### No repositories showing?

```bash
# Verify config files exist
find /Users/creator/Documents/DEV -name "dev-status.config.json"

# Should show 30 files
```

### Visualization not loading?

1. Check browser console (F12)
2. Verify server is running
3. Try Chrome or Firefox

## Next Steps

- Explore the 3D visualization
- Click repositories for detailed info
- Check the stats panel
- Read [PHASE2_GUIDE.md](PHASE2_GUIDE.md) for advanced features

## Full Documentation

- [README.md](README.md) - Complete guide
- [PHASE1_GUIDE.md](PHASE1_GUIDE.md) - Analysis details
- [PHASE2_GUIDE.md](PHASE2_GUIDE.md) - Visualization details
- [COMPLETE.md](COMPLETE.md) - Project summary

---

**That's it! Enjoy your 3D repository visualization! 🚀**

