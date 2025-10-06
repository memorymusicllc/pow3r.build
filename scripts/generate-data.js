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
      const relativePath = path.relative(BASE_PATH, fullPath);
      
      if (entry.isDirectory()) {
        const subConfigs = await findConfigFiles(fullPath, depth + 1);
        configs.push(...subConfigs);
      } else if (entry.name === 'pow3r.status.json') {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const config = JSON.parse(content);
          
          // Add metadata for the frontend to use
          config.metadata = {
            path: fullPath,
            relativePath: relativePath,
            configType: 'v2', // Standardize to v2
          };

          configs.push(config);
          console.log(`✓ Loaded: ${config.projectName || 'Unknown Project'} (${entry.name})`);
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

