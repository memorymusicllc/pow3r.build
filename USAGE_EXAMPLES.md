# Usage Examples

## Quick Start

### Example 1: Scan Your DEV Directory

```bash
cd /Users/creator/Documents/DEV/repo-analyzer
python analyze.py /Users/creator/Documents/DEV
```

**What happens:**
1. Script scans all subdirectories
2. Finds repositories like PowerFlow, Expunge, RAG, etc.
3. Displays interactive list
4. You select repositories you want to analyze
5. Saves selection to JSON file

### Example 2: Select Specific Projects

```bash
python analyze.py ~/Documents/DEV
```

**When prompted:**
```
➜ Select repositories: 1 5 8
✓ Currently selected: 3 repositories

➜ Select repositories: done
```

**Result:** Repositories #1, #5, and #8 are selected

### Example 3: Select a Range

```bash
python analyze.py ~/Documents/DEV
```

**When prompted:**
```
➜ Select repositories: 1-10
✓ Currently selected: 10 repositories

➜ Select repositories: 15
✓ Currently selected: 11 repositories

➜ Select repositories: done
```

**Result:** Repositories #1-10 and #15 are selected

### Example 4: Select All Repositories

```bash
python analyze.py ~/Documents/DEV
```

**When prompted:**
```
➜ Select repositories: all
✓ Selected all 25 repositories

➜ Select repositories: done
```

**Result:** All 25 repositories selected

### Example 5: Complex Selection

```bash
python analyze.py ~/Documents/DEV
```

**When prompted:**
```
➜ Select repositories: 1-5 8 12-15
✓ Currently selected: 10 repositories

➜ Select repositories: done
```

**Result:** Repositories #1-5, #8, and #12-15 are selected

## Sample Output

### Repository List Display

```
Found 25 Git repositories:

[ ]   1. PowerFlow
      Path: PowerFlow
      Branch: main | Files: 418 | Size: 15.3 MB
      Last commit: 2025-10-01 14:23:15 -0700

[ ]   2. Expunge
      Path: Expunge
      Branch: develop | Files: 479 | Size: 8.7 MB
      Last commit: 2025-09-28 09:45:32 -0700

[ ]   3. RAG
      Path: RAG
      Branch: main | Files: 114 | Size: 3.2 MB
      Last commit: 2025-09-25 16:12:08 -0700
```

### After Selection

```
✓   1. PowerFlow (selected)
✓   5. RAG (selected)
✓   8. Expunge (selected)
```

### Summary Output

```
==================================================================
SELECTION SUMMARY
==================================================================

Total repositories selected: 3
Total files: 1,011
Total size: 27.2 MB

Selected repositories:
  1. PowerFlow (PowerFlow)
  2. RAG (RAG)
  3. Expunge (Expunge)

✓ Saved selection to: /Users/creator/Documents/DEV/.repo-analyzer/selected_repositories_20251002_103045.json

✓ Repository selection complete!
Ready to proceed to Phase 1: Analysis
```

## Common Workflows

### Workflow 1: Analyze Recent Projects

1. Run the scanner
2. Repositories are sorted by last commit (newest first)
3. Select top 10: `1-10`
4. Proceed with analysis

### Workflow 2: Analyze Specific Technology Stack

1. Run the scanner
2. Manually identify repositories by name (e.g., React projects)
3. Select by number: `1 4 7 12 15`
4. Proceed with analysis

### Workflow 3: Full Portfolio Analysis

1. Run the scanner
2. Select all: `all`
3. Review large-scale metrics
4. Generate comprehensive visualization

### Workflow 4: Iterative Selection

1. Start with broad selection: `1-20`
2. Review, then clear: `none`
3. Make refined selection: `3 5 8-12`
4. Finalize: `done`

## Tips

1. **Sorted by Recency**: Repositories are listed with most recently updated first
2. **Quick Exit**: Press `Ctrl+C` or type `quit` to exit anytime
3. **Review Before Done**: Check your selection count before typing `done`
4. **Output Location**: Selection saved in `.repo-analyzer/` subfolder
5. **JSON Output**: Can be used programmatically for Phase 1

## Error Scenarios

### No Git Repositories Found

```bash
python analyze.py ~/empty-folder

# Output:
No Git repositories found in: /Users/creator/empty-folder
```

### Permission Denied

```bash
python analyze.py /protected-directory

# Output:
⚠️  Permission denied: [Errno 13] Permission denied: '/protected-directory/...'
✓ Found 0 repositories
```

### Invalid Path

```bash
python analyze.py /nonexistent

# Output:
❌ Error: Directory does not exist: /nonexistent
```

## Next Steps

After Phase 0 completion, you'll have:

1. **JSON file** with repository metadata
2. **List of selected repositories** for analysis
3. **Ready to proceed** to Phase 1: Deep Analysis

Use the JSON output to:
- Feed into Phase 1 analysis scripts
- Generate dependency graphs
- Create architecture diagrams
- Build knowledge graphs
- Export to visualization tools

