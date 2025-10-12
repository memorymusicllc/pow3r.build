# Phase 2: 3D Visualization Web Application - Guide

## Overview

Phase 2 provides an interactive 3D visualization of your repository network using Three.js. The visualization displays repositories as 3D nodes, colored by their development status, with real-time interaction capabilities.

## Architecture

### Components

#### 1. **Backend Server** (`server/server.js`)
- Node.js/Express application
- Discovers all `dev-status.config.json` files
- Aggregates repository data
- Serves REST API endpoints
- Caches data for performance

#### 2. **Frontend Visualization** (`public/`)
- Three.js 3D rendering
- Interactive controls (OrbitControls)
- Real-time data display
- Responsive UI panels

### Technology Stack

- **Server**: Node.js 18+, Express.js 4.18
- **3D Engine**: Three.js 0.160
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Styling**: Modern CSS with glassmorphism effects

## Installation

### Prerequisites

- Node.js 18+ installed
- Phase 1 completed (config files generated)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

```bash
cd "/Users/creator/Documents/DEV/Repo to 3D"

# Install dependencies
cd server
npm install

# Start server
npm start
```

## Usage

### Starting the Server

```bash
cd "/Users/creator/Documents/DEV/Repo to 3D/server"
npm start
```

The server will:
1. Scan for all `dev-status.config.json` files
2. Load and cache repository data
3. Start on http://localhost:3000

### Accessing the Visualization

Open your browser and navigate to:
```
http://localhost:3000
```

### Controls

- **Left Mouse Button**: Rotate view
- **Right Mouse Button**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Click Node**: View repository details
- **ESC or Close Button**: Close info panel

## Features

### 1. 3D Repository Network

**Visual Representation:**
- Each repository is rendered as a 3D cube
- Node size reflects file count
- Subtle rotation animation for visual interest

**Status Colors:**
- 🟢 **Green**: Stable repositories
- 🟠 **Orange**: Active development
- 🔴 **Red**: Blocked/stale
- ⚫ **Gray**: Archived

### 2. Interactive Exploration

**Node Interaction:**
- Hover: Highlight effect
- Click: Display detailed information panel

**Information Panel Shows:**
- Repository name and branch
- Development status
- Primary language
- File count and size
- Recent commit activity
- Architectural components

### 3. Statistics Dashboard

Real-time statistics panel displays:
- Total repository count
- Status distribution
- Total architectural nodes
- Aggregate commit activity

### 4. Connection Visualization

Repositories are connected by:
- Shared programming language
- Similar architectural patterns
- Future: Actual dependency relationships

## API Endpoints

### GET `/api/projects`

Get all repository data.

**Query Parameters:**
- `refresh=true` - Force cache refresh

**Response:**
```json
{
  "success": true,
  "count": 30,
  "basePath": "/Users/creator/Documents/DEV",
  "timestamp": "2025-10-02T...",
  "projects": [...]
}
```

### GET `/api/projects/:name`

Get single repository by name.

**Response:**
```json
{
  "success": true,
  "project": {...}
}
```

### GET `/api/stats`

Get aggregate statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 30,
    "byStatus": {...},
    "byLanguage": {...},
    "totalNodes": 50,
    "totalEdges": 20,
    "totalCommits30Days": 100
  }
}
```

### POST `/api/refresh`

Force cache refresh.

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed",
  "count": 30
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-10-02T..."
}
```

## Configuration

### Environment Variables

Create a `.env` file in `server/` directory:

```bash
# Base path for repository scanning
BASE_PATH=/Users/creator/Documents/DEV

# Server port
PORT=3000

# Maximum directory depth for scanning
MAX_DEPTH=10
```

### Custom Base Path

Override the base path when starting:

```bash
BASE_PATH=/path/to/your/repos npm start
```

## Performance

### Caching

- Config files are cached for 1 minute (configurable)
- Reduces disk I/O for repeated requests
- Automatic cache invalidation

### Optimization Tips

1. **Limit Scan Depth**: Set `MAX_DEPTH` to avoid deep directory traversal
2. **Selective Analysis**: Only run Phase 1 on active repositories
3. **Browser Performance**: Close other GPU-intensive applications

### Expected Performance

- **Initial Load**: 2-5 seconds (depends on repository count)
- **Rendering**: 60 FPS with 100+ repositories
- **Memory**: ~200-300 MB (browser)
- **Server Memory**: ~50-100 MB

## Customization

### Changing Node Appearance

Edit `public/app.js` in the `createRepoNode()` method:

```javascript
// Change to spheres
const geometry = new THREE.SphereGeometry(size/2, 32, 32);

// Change glow intensity
emissiveIntensity: 0.5  // Default: 0.3
```

### Layout Algorithm

Current: Circular layout
Future options: Force-directed, hierarchical, cluster-based

Modify in `createVisualization()` method.

### Color Scheme

Update `statusColors` in the constructor:

```javascript
this.statusColors = {
    green: 0x00ff00,    // Custom green
    orange: 0xff8800,   // Custom orange
    red: 0xff0000,      // Custom red
    gray: 0x808080      // Custom gray
};
```

## Troubleshooting

### Server Won't Start

**Issue**: Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Use different port
```bash
PORT=3001 npm start
```

### No Repositories Found

**Issue**: Server finds 0 repositories

**Check:**
1. Phase 1 completed successfully
2. `dev-status.config.json` files exist
3. BASE_PATH is correct
4. File permissions allow reading

```bash
# Verify config files exist
find /Users/creator/Documents/DEV -name "dev-status.config.json"
```

### Visualization Not Loading

**Issue**: Blank screen or loading forever

**Solutions:**
1. Check browser console for errors (F12)
2. Verify server is running
3. Check network tab for failed requests
4. Try different browser

### Performance Issues

**Issue**: Low frame rate, laggy interaction

**Solutions:**
1. Reduce repository count
2. Close other tabs/applications
3. Update graphics drivers
4. Try different browser
5. Reduce browser zoom level

## Browser Compatibility

### Supported Browsers

✅ **Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Limited Support:**
- Older browsers without WebGL 2.0
- Mobile browsers (limited interaction)

### Required Features

- WebGL 2.0
- ES6 Modules
- CSS Grid
- Flexbox
- Backdrop Filter (for glassmorphism)

## Development

### Running in Development Mode

```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Project Structure

```
Repo to 3D/
├── server/
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   └── node_modules/       # Installed packages
├── public/
│   ├── index.html          # Main HTML
│   └── app.js              # Three.js app
└── [Phase 1 files]
```

### Adding Features

**New API Endpoint:**

Edit `server/server.js`:
```javascript
app.get('/api/my-endpoint', async (req, res) => {
    // Your logic
    res.json({ success: true, data: ... });
});
```

**New Visualization Feature:**

Edit `public/app.js`:
```javascript
// Add to RepositoryVisualization class
myNewFeature() {
    // Your visualization logic
}

// Call in init() or animate()
this.myNewFeature();
```

## Advanced Usage

### Filtering Repositories

Add filter controls to UI and modify data loading:

```javascript
async loadRepositories(filter = 'all') {
    const response = await fetch('/api/projects');
    const data = await response.json();
    
    if (filter !== 'all') {
        this.repositories = data.projects.filter(p => 
            p.status === filter
        );
    } else {
        this.repositories = data.projects;
    }
}
```

### Custom Layouts

Implement force-directed layout:

```javascript
// Install: npm install d3-force
import * as d3 from 'd3-force';

createForceLayout() {
    const simulation = d3.forceSimulation(this.repositories)
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(0, 0))
        .force('collision', d3.forceCollide(10));
    
    simulation.on('tick', () => {
        this.repositories.forEach(repo => {
            const mesh = this.repoMeshes.get(repo.projectName);
            mesh.position.x = repo.x;
            mesh.position.z = repo.z;
        });
    });
}
```

### Export Screenshot

Add screenshot functionality:

```javascript
takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'repository-visualization.png';
    link.href = dataURL;
    link.click();
}
```

## Security Considerations

### Local Development

- Server only binds to localhost
- No external access by default
- Read-only file operations

### Production Deployment

⚠️ **Not recommended for production**

This tool is designed for local development use. If deploying:
- Add authentication
- Implement rate limiting
- Sanitize file paths
- Use HTTPS
- Restrict CORS

## Next Steps

### Phase 3 Enhancements

Future improvements:
- Dependency graph parsing (actual imports)
- Time-based animations (commit history)
- Multiple layout algorithms
- Export to image/video
- GitHub/GitLab integration
- Real-time monitoring
- Team collaboration features

## Links

- [Phase 0 Guide](README.md) - Repository selection
- [Phase 1 Guide](PHASE1_GUIDE.md) - Repository analysis
- [Project Overview](PROJECT_OVERVIEW.md) - Overall project info
- [Three.js Documentation](https://threejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## Credits

**Technologies:**
- Three.js - 3D rendering engine
- Express.js - Web server framework
- OrbitControls - Camera controls

**Inspiration:**
- GitHub's dependency graph
- Gource - Repository visualization
- CodeCity - Software visualization

---

**Phase 2 Status**: ✅ **COMPLETE**  
**Ready to Explore**: Start the server and visualize your repositories!

