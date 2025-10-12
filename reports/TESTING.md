# Testing Guide

## Automated Demo Test

The `demo_test.sh` script creates a test environment with sample repositories.

### Run Demo Test

```bash
cd /Users/creator/Documents/DEV/repo-analyzer
./demo_test.sh
```

This creates 5 test repositories in `/tmp/repo-analyzer-demo/`:
- project-alpha
- project-beta
- project-gamma
- tool-delta
- app-epsilon

Each test repository includes:
- Initialized Git repository
- README.md file
- JavaScript source files
- Two commits (initial + update)

### Test the Analyzer

```bash
python analyze.py /tmp/repo-analyzer-demo
```

### Expected Output

```
🔍 Scanning for Git repositories in: /tmp/repo-analyzer-demo
Please wait...

✓ Found 5 repositories

Found 5 Git repositories:

[ ]   1. app-epsilon
      Path: app-epsilon
      Branch: master | Files: 3 | Size: 0.01 MB
      Last commit: 2025-10-02 ...

[ ]   2. project-alpha
      Path: project-alpha
      Branch: master | Files: 3 | Size: 0.01 MB
      Last commit: 2025-10-02 ...
...
```

### Test Selection Commands

Try these commands when prompted:

#### Test 1: Select Range
```
➜ Select repositories: 1-3
✓ Currently selected: 3 repositories
➜ Select repositories: done
```

#### Test 2: Select All
```
➜ Select repositories: all
✓ Selected all 5 repositories
➜ Select repositories: done
```

#### Test 3: Select Specific
```
➜ Select repositories: 1 3 5
✓ Currently selected: 3 repositories
➜ Select repositories: done
```

#### Test 4: Complex Selection
```
➜ Select repositories: 1-2
✓ Currently selected: 2 repositories
➜ Select repositories: 5
✓ Currently selected: 3 repositories
➜ Select repositories: done
```

#### Test 5: Clear and Reselect
```
➜ Select repositories: all
✓ Selected all 5 repositories
➜ Select repositories: none
Cleared all selections
➜ Select repositories: 1 3
✓ Currently selected: 2 repositories
➜ Select repositories: done
```

### Verify Output

Check that JSON file was created:
```bash
ls -la /tmp/repo-analyzer-demo/.repo-analyzer/
cat /tmp/repo-analyzer-demo/.repo-analyzer/selected_repositories_*.json
```

Expected JSON structure:
```json
{
  "timestamp": "2025-10-02T...",
  "total_selected": 3,
  "repositories": [
    {
      "name": "project-alpha",
      "path": "/tmp/repo-analyzer-demo/project-alpha",
      "relative_path": "project-alpha",
      "branch": "master",
      "remote": "none",
      "last_commit": "2025-10-02 ...",
      "file_count": 3,
      "size_mb": 0.01
    }
  ]
}
```

### Cleanup Test Environment

```bash
rm -rf /tmp/repo-analyzer-demo
```

## Manual Testing

### Test with Real Repositories

```bash
# Test with a subset of your projects
python analyze.py ~/Documents/DEV/PowerFlow
python analyze.py ~/Documents/DEV/RAG
```

### Test Edge Cases

#### Empty Directory
```bash
mkdir /tmp/empty-test
python analyze.py /tmp/empty-test
# Expected: No Git repositories found
```

#### Non-existent Directory
```bash
python analyze.py /nonexistent
# Expected: Error message about directory not existing
```

#### No Arguments
```bash
python analyze.py
# Expected: Usage message with example
```

#### Permission Issues
```bash
python analyze.py /root
# Expected: Permission denied warnings, continues scanning
```

## Integration Testing

### Test Output Format

Verify JSON is valid:
```bash
python analyze.py /tmp/repo-analyzer-demo
# Select some repos and finish

# Validate JSON
python -m json.tool /tmp/repo-analyzer-demo/.repo-analyzer/selected_repositories_*.json
```

### Test Metadata Accuracy

1. Create test repo with known properties
2. Run analyzer
3. Verify output matches expected values

```bash
# Create test repo
mkdir -p /tmp/test-repo
cd /tmp/test-repo
git init
echo "test" > test.txt
git add .
git commit -m "Test commit"

# Run analyzer
cd /Users/creator/Documents/DEV/repo-analyzer
python analyze.py /tmp/test-repo

# Verify metadata in output JSON
```

## Performance Testing

### Small Scale (< 10 repos)
```bash
time python analyze.py /tmp/repo-analyzer-demo
# Expected: < 1 second
```

### Medium Scale (10-50 repos)
```bash
time python analyze.py ~/Documents/DEV
# Expected: < 10 seconds
```

### Large Scale (50+ repos)
```bash
# Create test environment with many repos
for i in {1..100}; do
  mkdir -p /tmp/large-test/repo-$i
  cd /tmp/large-test/repo-$i
  git init
  echo "test" > README.md
  git add .
  git commit -m "Initial"
done

time python analyze.py /tmp/large-test
# Expected: < 1 minute
```

## Unit Testing (Future)

### Test Structure
```python
# tests/test_scanner.py
import unittest
from analyze import RepositoryScanner

class TestRepositoryScanner(unittest.TestCase):
    def test_scan_finds_repos(self):
        scanner = RepositoryScanner('/tmp/repo-analyzer-demo')
        repos = scanner.scan()
        self.assertEqual(len(repos), 5)
    
    def test_scan_empty_directory(self):
        scanner = RepositoryScanner('/tmp/empty')
        repos = scanner.scan()
        self.assertEqual(len(repos), 0)
```

### Run Tests
```bash
python -m pytest tests/
python -m pytest tests/ -v --cov
```

## Continuous Integration (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Run tests
        run: |
          ./demo_test.sh
          python analyze.py /tmp/repo-analyzer-demo
```

## Test Coverage Checklist

- [x] Basic execution (no args)
- [x] Help message
- [x] Valid directory scanning
- [x] Repository detection
- [x] Metadata extraction
- [x] Interactive selection
- [x] Range selection (1-5)
- [x] Individual selection (1 3 5)
- [x] All selection
- [x] Clear selection (none)
- [x] JSON export
- [x] Output validation
- [ ] Unit tests (pending Phase 1)
- [ ] Integration tests (pending Phase 1)
- [ ] Performance benchmarks (pending Phase 1)

## Known Issues

None currently identified.

## Reporting Issues

When reporting issues, include:
1. Operating system and version
2. Python version (`python --version`)
3. Git version (`git --version`)
4. Full command executed
5. Complete error output
6. Directory structure (if relevant)

Example:
```
OS: macOS 14.0
Python: 3.11.5
Git: 2.42.0

Command: python analyze.py ~/test
Error: [paste error output]
```

