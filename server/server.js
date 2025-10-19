#!/usr/bin/env node
/**
 * Local Repository Visualization Server
 * Phase 2: 3D Visualization Web Application
 * 
 * This server discovers and serves dev-status.config.json files
 * from analyzed repositories.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const BASE_PATH = process.env.BASE_PATH || path.join(__dirname, '../output/github');
const MAX_DEPTH = parseInt(process.env.MAX_DEPTH || '10', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Cache for config files
let configCache = {
  data: null,
  lastUpdate: null,
  ttl: 60000 // 1 minute cache
};

/**
 * Recursively find all dev-status.config.json files
 */
async function findConfigFiles(dir, depth = 0) {
  if (depth > MAX_DEPTH) return [];
  
  const configs = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden directories and common ignore patterns
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'venv' ||
          entry.name === '__pycache__') {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recurse into subdirectories
        const subConfigs = await findConfigFiles(fullPath, depth + 1);
        configs.push(...subConfigs);
      } else if (entry.name === 'pow3r.v3.status.json' || entry.name === 'dev-status.config.json') {
        // Found a config file!
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const config = JSON.parse(content);
          
          // Support both old and new formats
          const projectName = config.projectName || 
                             (config.assets && config.assets[0] && config.assets[0].metadata && config.assets[0].metadata.title) || 
                             'Unknown Project';
          
          configs.push({
            path: fullPath,
            relativePath: path.relative(BASE_PATH, fullPath),
            configType: entry.name === 'pow3r.v3.status.json' ? 'v3' : 'v1',
            ...config
          });
          console.log(`✓ Loaded: ${projectName} (${entry.name})`);
        } catch (error) {
          console.error(`✗ Error reading ${fullPath}:`, error.message);
        }
      }
    }
  } catch (error) {
    if (error.code !== 'EACCES' && error.code !== 'EPERM') {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }
  
  return configs;
}

/**
 * Get all project configurations with caching
 */
async function getAllProjects(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached data if valid
  if (!forceRefresh && 
      configCache.data && 
      configCache.lastUpdate && 
      (now - configCache.lastUpdate) < configCache.ttl) {
    return configCache.data;
  }
  
  console.log('\n🔍 Scanning for repository configurations...');
  console.log(`Base path: ${BASE_PATH}\n`);
  
  const configs = await findConfigFiles(BASE_PATH);
  
  console.log(`\n✓ Found ${configs.length} repositories\n`);
  
  // Update cache
  configCache = {
    data: configs,
    lastUpdate: now,
    ttl: configCache.ttl
  };
  
  return configs;
}

/**
 * API Routes
 */

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const projects = await getAllProjects(forceRefresh);
    
    res.json({
      success: true,
      count: projects.length,
      basePath: BASE_PATH,
      timestamp: new Date().toISOString(),
      projects: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single project by name
app.get('/api/projects/:name', async (req, res) => {
  try {
    const projects = await getAllProjects();
    const project = projects.find(p => p.projectName === req.params.name);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      project: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const projects = await getAllProjects();
    
    // Calculate statistics
    const stats = {
      total: projects.length,
      byStatus: {
        green: projects.filter(p => p.status === 'green').length,
        orange: projects.filter(p => p.status === 'orange').length,
        red: projects.filter(p => p.status === 'red').length,
        gray: projects.filter(p => p.status === 'gray').length
      },
      byLanguage: {},
      totalNodes: projects.reduce((sum, p) => sum + (p.nodes?.length || 0), 0),
      totalEdges: projects.reduce((sum, p) => sum + (p.edges?.length || 0), 0),
      totalCommits30Days: projects.reduce((sum, p) => sum + (p.stats?.totalCommitsLast30Days || 0), 0),
      totalFiles: projects.reduce((sum, p) => sum + (p.stats?.fileCount || 0), 0),
      totalSizeMB: Math.round(projects.reduce((sum, p) => sum + (p.stats?.sizeMB || 0), 0) * 100) / 100
    };
    
    // Count by language
    projects.forEach(p => {
      const lang = p.stats?.primaryLanguage || 'unknown';
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh cache
app.post('/api/refresh', async (req, res) => {
  try {
    const projects = await getAllProjects(true);
    res.json({
      success: true,
      message: 'Cache refreshed',
      count: projects.length
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * Start Server
 */
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Repository 3D Visualization Server');
  console.log('='.repeat(70));
  console.log(`\n📡 Server running at: http://localhost:${PORT}`);
  console.log(`📂 Base path: ${BASE_PATH}`);
  console.log(`\n🌐 Open in browser: http://localhost:${PORT}`);
  console.log('📊 API Endpoints:');
  console.log(`   GET  /api/projects       - Get all repositories`);
  console.log(`   GET  /api/projects/:name - Get specific repository`);
  console.log(`   GET  /api/stats          - Get statistics`);
  console.log(`   POST /api/refresh        - Refresh cache`);
  console.log(`   GET  /api/health         - Health check`);
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Pre-load configurations
  try {
    await getAllProjects();
  } catch (error) {
    console.error('⚠️  Error pre-loading configurations:', error.message);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  process.exit(0);
});

