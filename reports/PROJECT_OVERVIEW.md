# Project Overview: Local Repository Analysis & Generation Tool

## Vision

A comprehensive CLI tool that discovers, analyzes, and visualizes local Git repositories to provide insights into project portfolios, dependencies, and code relationships.

## Project Structure

```
Repo to 3D/
├── analyze.py              # Phase 0 - Repository scanner
├── phase1_analyzer.py      # Phase 1 - Analysis engine  
├── run_phase1.py          # Phase 1 - Execution script
├── README.md              # Primary documentation
├── PHASE1_GUIDE.md        # Phase 1 detailed guide
├── PHASE1_RESULTS.md      # Phase 1 analysis results
├── PROJECT_OVERVIEW.md    # This file - project vision
├── USAGE_EXAMPLES.md      # Usage examples
├── QUICK_REFERENCE.md     # Quick command reference
├── TESTING.md             # Testing guide
├── requirements.txt       # Python dependencies
├── demo_test.sh          # Demo test script
└── [Future Phases]
    ├── server/            # Phase 2 - Local web server
    ├── visualization/     # Phase 2 - Three.js app
    └── public/           # Phase 2 - Static assets
```

## Development Phases

### ✅ Phase 0: Repository Selection (COMPLETED)

**Goal**: Interactive discovery and selection of Git repositories

**Features Implemented**:
- ✅ Recursive directory scanning
- ✅ Git repository detection
- ✅ Metadata collection (branch, commits, size)
- ✅ Interactive CLI selection interface
- ✅ Multiple selection modes (range, individual, all)
- ✅ JSON export of selection
- ✅ Color-coded terminal output
- ✅ Error handling and validation

**Deliverables**:
- `analyze.py` - Main script
- `README.md` - Full documentation
- `USAGE_EXAMPLES.md` - Usage guide
- `demo_test.sh` - Testing script

### ✅ Phase 1: Repository Analysis & Data Generation (COMPLETED)

**Goal**: Analyze selected repositories for code structure, Git activity, and development status

**Features Implemented**:
- ✅ Git history analysis (commits, branches, tags)
- ✅ Development status inference (green/orange/red/gray)
- ✅ Programming language detection
- ✅ Package/dependency file discovery
- ✅ Architecture component identification (nodes)
- ✅ Component relationship mapping (edges)
- ✅ Working tree status checking
- ✅ Configuration file generation

**Output**:
- `dev-status.config.json` per repository (30 files generated)
- Complete project metadata
- Architecture mapping
- Status-based color coding
- Git statistics (14-day and 30-day commit counts)

**Deliverables**:
- `phase1_analyzer.py` - Analysis engine
- `run_phase1.py` - Execution script
- `PHASE1_GUIDE.md` - Complete documentation
- `PHASE1_RESULTS.md` - Analysis results

**Implementation**:
```python
# phase1_analyzer.py structure
class GitAnalyzer:
    - get_commit_activity()
    - infer_status()
    - get_branch_info()
    
class CodeAnalyzer:
    - detect_primary_language()
    - identify_architecture_nodes()
    - identify_architecture_edges()
    
class RepositoryAnalyzer:
    - analyze() # Orchestrates full analysis
```

### 🔄 Phase 2: 3D Visualization Web Application (NEXT)

**Goal**: Create interactive 3D visualization of repository network

**Planned Features**:
- Local Node.js/Express web server
- Config file discovery and aggregation
- Three.js 3D graph rendering
- Interactive node exploration
- Status-based color coding
- Real-time data display
- Camera controls and navigation
- Node click for detailed info panel

**Output**:
- Interactive web application
- 3D repository network graph
- Status visualization dashboard
- Node/edge relationship display

**Implementation Approach**:
```javascript
// Server (Node.js + Express)
app.get('/api/projects', async (req, res) => {
    // Discover all dev-status.config.json files
    // Aggregate and return data
});

// Visualization (Three.js)
class RepositoryGraph {
    - createNodes()      // Render repos as 3D objects
    - createEdges()      // Draw connections
    - applyLayout()      // Position algorithm
    - enableInteraction() // Click, hover, zoom
}
```

### 📋 Phase 3: Advanced Features (PLANNED)

**Goal**: Enhance visualization with advanced capabilities

**Planned Features**:
- Dependency graph visualization (parse imports)
- Time-based commit animations
- Contributor network analysis
- Technology stack distribution
- Export to images (PNG, SVG)
- Export to PDF reports
- Integration with GitHub/GitLab APIs
- Real-time repository monitoring

**Output**:
- Enhanced 3D visualizations
- Time-series animations
- Export formats (images, videos)
- Cloud integration dashboard

**Implementation Approach**:
```javascript
// Advanced Features
class TimelineAnimator {
    - animateCommitHistory()
    - playbackControls()
}

class DependencyAnalyzer {
    - parseImports()
    - visualizeDependencies()
}

class Exporter {
    - exportToPNG()
    - exportToSVG()
    - generatePDF()
}
```

## Technology Stack

### Current (Phase 0)
- **Language**: Python 3.7+
- **Dependencies**: None (standard library only)
- **Platform**: macOS, Linux, WSL

### Future Phases
- **Analysis**: GitPython, PyYAML, TOML
- **Visualization**: NetworkX, Matplotlib, D3.js
- **Reporting**: Jinja2, Markdown, WeasyPrint
- **Web Dashboard**: Flask/FastAPI (optional)

## Use Cases

### 1. Portfolio Management
**Scenario**: Developer with 50+ local projects
**Usage**: Scan, select active projects, visualize technology distribution
**Benefit**: Understand project landscape, identify outdated dependencies

### 2. Code Audit
**Scenario**: Technical due diligence for acquisition
**Usage**: Analyze target company's repositories, generate reports
**Benefit**: Comprehensive code quality and architecture assessment

### 3. Team Onboarding
**Scenario**: New developer joining team with multiple repositories
**Usage**: Map repository relationships, identify core projects
**Benefit**: Faster onboarding with visual project map

### 4. Tech Stack Analysis
**Scenario**: Planning technology migration or standardization
**Usage**: Identify all projects using specific technologies
**Benefit**: Migration planning and impact assessment

### 5. Dependency Management
**Scenario**: Security vulnerability in common library
**Usage**: Find all projects depending on vulnerable library
**Benefit**: Rapid response to security issues

## Design Principles

### 1. Zero External Dependencies (Phase 0)
- Uses only Python standard library
- No setup or installation complexity
- Works out-of-the-box

### 2. Progressive Enhancement
- Each phase builds on previous
- Can stop at any phase
- Modular architecture

### 3. User-Friendly CLI
- Clear, colorful output
- Intuitive commands
- Helpful error messages

### 4. Efficient Scanning
- Fast directory traversal
- Graceful error handling
- Respects system permissions

### 5. Data Portability
- JSON-based outputs
- Standard file formats
- Easy integration with other tools

## Performance Considerations

### Optimization Strategies
- **Scanning**: Use `os.walk()` with early termination
- **Git Operations**: Single subprocess calls with timeouts
- **Memory**: Stream large files, limit repository metadata
- **Parallelization**: Future: analyze multiple repos in parallel

### Scalability
- **Small portfolios** (< 10 repos): Instant
- **Medium portfolios** (10-50 repos): < 10 seconds
- **Large portfolios** (50-200 repos): < 1 minute
- **Very large portfolios** (200+ repos): Few minutes

## Security Considerations

### Safe by Design
- No code execution from analyzed repositories
- Read-only operations
- Respects file permissions
- Timeout on Git operations
- No external network calls (Phase 0)

### Future Considerations
- Scan for secrets/credentials (Phase 1)
- License compliance checking (Phase 1)
- Vulnerability scanning integration (Phase 2)

## Extensibility

### Plugin Architecture (Future)
```python
# Custom analyzers
class CustomAnalyzer(BaseAnalyzer):
    def analyze(self, repo_path):
        # Custom analysis logic
        pass

# Register plugin
analyzer.register_plugin(CustomAnalyzer())
```

### Configuration File (Future)
```yaml
# .repo-analyzer.yml
ignore_patterns:
  - "*/node_modules/*"
  - "*/venv/*"

analysis:
  enabled_modules:
    - dependencies
    - metrics
    - security
  
output:
  format: json
  destination: ./reports
```

## Roadmap

### Q4 2025
- ✅ Phase 0: Repository Selection (Complete - Oct 2)
- ✅ Phase 1: Analysis & Data Generation (Complete - Oct 2)
- 🔄 Phase 2: 3D Visualization (In Progress)

### Q1 2026
- 📋 Phase 3: Advanced Features
- 🚀 v1.0 Release

### Q2 2026
- 🔌 Plugin System
- 📊 Web Dashboard
- 🤖 AI-powered insights
- 📈 Trend analysis

### Future
- Cloud integration (GitHub, GitLab API)
- Team collaboration features
- CI/CD integration
- Real-time monitoring

## Contributing

### How to Contribute
1. Fork the repository
2. Create feature branch
3. Implement with tests
4. Update documentation
5. Submit pull request

### Code Style
- Follow PEP 8
- Type hints preferred
- Docstrings for all functions
- Comprehensive error handling

### Testing
```bash
# Run demo test
./demo_test.sh

# Run unit tests (future)
python -m pytest tests/

# Run integration tests (future)
python -m pytest tests/integration/
```

## License

See parent directory LICENSE file.

## Acknowledgments

Built with Python 3 and the standard library. Inspired by tools like:
- `ghorg` - GitHub organization cloner
- `cloc` - Code line counter
- `tokei` - Code statistics
- `gource` - Repository visualization

## Contact & Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Consult the documentation
- Check usage examples

## Links

- [Main README](README.md) - Installation and basic usage
- [Phase 1 Guide](PHASE1_GUIDE.md) - Detailed Phase 1 documentation
- [Phase 1 Results](PHASE1_RESULTS.md) - Analysis results
- [Usage Examples](USAGE_EXAMPLES.md) - Detailed examples and workflows
- [Quick Reference](QUICK_REFERENCE.md) - Command cheat sheet

