#!/usr/bin/env node
/**
 * Generate embedded data for Cloudflare Pages deployment
 * Scans for pow3r.status.json files and embeds them in the build
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const BASE_PATH = process.env.BASE_PATH || '/Users/creator/Documents/DEV';
const OUTPUT_FILE = path.join(__dirname, '../public/data.json');
const MAX_DEPTH = 10;

async function findConfigFiles(dir, depth = 0) {
  if (depth > MAX_DEPTH) return [];
  
  const configs = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === 'venv' ||
          entry.name === '__pycache__') {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subConfigs = await findConfigFiles(fullPath, depth + 1);
        configs.push(...subConfigs);
      } else if (entry.name === 'pow3r.config.json' || entry.name === 'pow3r.status.json' || entry.name === 'dev-status.config.json') {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const config = JSON.parse(content);
          
          // Determine config type and extract project name
          let configType = 'v1';
          let projectName = 'Unknown Project';
          
          if (entry.name === 'pow3r.config.json') {
            configType = 'v3-comprehensive';
            projectName = config.projectName || config.graphId || 'Unknown';
          } else if (entry.name === 'pow3r.status.json') {
            configType = 'v2';
            projectName = (config.assets && config.assets[0] && config.assets[0].metadata && config.assets[0].metadata.title) || 
                         config.projectName || 'Unknown';
          } else {
            configType = 'v1';
            projectName = config.projectName || 'Unknown';
          }
          
          // Get nodes/assets
          const nodes = config.nodes || config.assets || [];
          
          configs.push({
            path: fullPath,
            relativePath: path.relative(BASE_PATH, fullPath),
            configType: configType,
            projectName: projectName,
            nodeCount: nodes.length,
            ...config
          });
          
          console.log(`✓ Loaded: ${projectName} (${entry.name}, ${nodes.length} nodes)`);
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

async function generateDataFile() {
  console.log('\n🔍 Scanning for repository configurations...');
  console.log(`Base path: ${BASE_PATH}\n`);
  
  const configs = await findConfigFiles(BASE_PATH);
  
  console.log(`\n✓ Found ${configs.length} repositories\n`);
  
  const data = {
    success: true,
    count: configs.length,
    basePath: BASE_PATH,
    timestamp: new Date().toISOString(),
    generatedBy: 'generate-data.js',
    projects: configs
  };
  
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
  
  console.log(`✅ Generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total repositories: ${configs.length}\n`);
  
  return configs.length;
}

// Run if called directly
if (require.main === module) {
  generateDataFile()
    .then(count => {
      console.log(`🎉 Data generation complete! (${count} projects)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { generateDataFile };

