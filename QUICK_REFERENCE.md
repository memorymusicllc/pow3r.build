# Quick Reference Card

## Installation
```bash
cd /Users/creator/Documents/DEV/repo-analyzer
chmod +x analyze.py
```

## Basic Usage
```bash
python analyze.py <directory>
```

## Selection Commands

| Command       | Action                       |
| ------------- | ---------------------------- |
| `1 3 5`       | Select repos 1, 3, 5         |
| `1-5`         | Select repos 1 through 5     |
| `1-5 8 10-12` | Select ranges and individual |
| `all`         | Select all repositories      |
| `none`        | Clear all selections         |
| `done`        | Finish and save              |
| `quit`, `q`   | Exit without saving          |

## Examples

### Scan DEV Directory
```bash
python analyze.py ~/Documents/DEV
```

### Scan Specific Folder
```bash
python analyze.py /path/to/projects
```

### Run Demo Test
```bash
./demo_test.sh
python analyze.py /tmp/repo-analyzer-demo
```

## Output

### JSON File Location
```
<scan_directory>/.repo-analyzer/selected_repositories_<timestamp>.json
```

### Console Summary
- Repository count
- Total files
- Total size
- Selected repositories list

## Repository Metadata Collected

- Name
- Path (absolute & relative)
- Current Git branch
- Remote URL
- Last commit date
- File count
- Size (MB)

## Common Workflows

### Recent Projects (Top 10)
```bash
python analyze.py ~/Documents/DEV
# When prompted: 1-10
# Then: done
```

### All Repositories
```bash
python analyze.py ~/Documents/DEV
# When prompted: all
# Then: done
```

### Specific Projects
```bash
python analyze.py ~/Documents/DEV
# When prompted: 5 12 18 23
# Then: done
```

## Troubleshooting

### No repositories found
- Check path is correct
- Ensure directories contain `.git` folders
- Verify read permissions

### Permission denied
```bash
# Try with sudo (use with caution)
sudo python analyze.py /protected/path
```

### Colors not showing
- Use modern terminal (iTerm2, Terminal.app)
- Ensure ANSI color support enabled

## Output Structure

```json
{
  "timestamp": "2025-10-02T10:30:45",
  "total_selected": 3,
  "repositories": [
    {
      "name": "project-name",
      "path": "/full/path",
      "relative_path": "relative/path",
      "branch": "main",
      "remote": "git@github.com:user/repo.git",
      "last_commit": "2025-10-01 14:23:15",
      "file_count": 418,
      "size_mb": 15.3
    }
  ]
}
```

## Tips

- Repositories sorted by last commit (newest first)
- Use ranges for quick selection: `1-20`
- Review count before typing `done`
- Output saved in hidden `.repo-analyzer/` folder
- Can select/deselect multiple times before `done`

## Next Steps

After Phase 0, use output for:
- Phase 1: Deep analysis
- Dependency mapping
- Technology stack visualization
- Project portfolio reports

## Links

- [README.md](README.md) - Full documentation
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - Detailed examples
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Vision and roadmap

