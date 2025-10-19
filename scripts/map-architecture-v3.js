#!/usr/bin/env node

/**
 * Architecture Mapping Script - v3 Status Schema
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * This script maps the entire ecosystem architecture using the v3 status schema.
 * It processes all repositories, components, services, and agents to create
 * a comprehensive Architectural Progress Diagram (APD).
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

class ArchitectureMapper {
  constructor() {
    this.rootPath = process.cwd();
    this.configPath = join(this.rootPath, 'config');
    this.outputPath = join(this.configPath, 'pow3r.v3.mapped-architecture.json');
    this.architecture = {
      "$schema": "https://config.superbots.link/?t=schema&v=3",
      "sceneId": "Pow3r_Mapped_Ecosystem_v3_APD",
      "version": "3.0.0",
      "nodes": [],
      "edges": []
    };
    
    this.nodeTypes = {
      'system': 'system',
      'agent': 'agent',
      'app': 'app',
      'component': 'component',
      'service': 'service',
      'config': 'config',
      'test': 'test',
      'script': 'script',
      'api': 'api'
    };
    
    this.priorityMap = {
      'system': 10,
      'agent': 9,
      'app': 8,
      'service': 7,
      'component': 6,
      'api': 5,
      'config': 4,
      'test': 3,
      'script': 2
    };
  }

  /**
   * Main mapping function
   */
  async mapArchitecture() {
    console.log('🗺️ Starting Architecture Mapping with v3 Status Schema...');
    
    try {
      // Map core system components
      await this.mapSystemComponents();
      
      // Map agents
      await this.mapAgents();
      
      // Map applications
      await this.mapApplications();
      
      // Map components
      await this.mapComponents();
      
      // Map services
      await this.mapServices();
      
      // Map configuration files
      await this.mapConfigurations();
      
      // Map testing infrastructure
      await this.mapTesting();
      
      // Map scripts and utilities
      await this.mapScripts();
      
      // Create relationships (edges)
      await this.createRelationships();
      
      // Save the mapped architecture
      await this.saveArchitecture();
      
      console.log('✅ Architecture mapping completed successfully');
      console.log(`📊 Total nodes: ${this.architecture.nodes.length}`);
      console.log(`🔗 Total edges: ${this.architecture.edges.length}`);
      
    } catch (error) {
      console.error('❌ Architecture mapping failed:', error);
      throw error;
    }
  }

  /**
   * Map system components
   */
  async mapSystemComponents() {
    console.log('🏗️ Mapping system components...');
    
    const systemComponents = [
      {
        id: 'pillar-config',
        type: 'system.pillar',
        title: 'pow3r.config',
        description: 'The central nervous system. A Cloudflare-hosted API that serves versioned schema files, validation rules, and this World Model to all agents and applications.',
        devStatus: 'InProgress',
        percentComplete: 60,
        ownerAgent: 'Bridge',
        priority: 10,
        blockers: [],
        currentTask: 'Implement the \'/api/x-files/create\' endpoint.',
        nextMilestone: 'Achieve 100% test coverage for all API endpoints, including schema validation and X-FILES dossier ingestion.'
      },
      {
        id: 'pillar-status',
        type: 'system.pillar',
        title: 'pow3r.status',
        description: 'The cognitive core. The single source of truth that manages the URVS Knowledge Graph, tracks all assets, and orchestrates agent actions based on this World Model.',
        devStatus: 'InProgress',
        percentComplete: 40,
        ownerAgent: 'Architect',
        priority: 9,
        blockers: ['pillar-config'],
        currentTask: 'Implement \'CaseFile\' node creation logic.',
        nextMilestone: 'Fully implement the \'CaseFile\' node creation and the notification trigger that activates Prometheus upon a new CaseFile submission.'
      },
      {
        id: 'pillar-x-files',
        type: 'system.pillar',
        title: 'X-FILES Protocol',
        description: 'The sensory and nervous system. An in-situ component and service that captures bugs and feature requests with perfect context, creating a \'CaseFile\' to trigger the autonomous healing and development loop.',
        devStatus: 'InProgress',
        percentComplete: 30,
        ownerAgent: 'Component Agent',
        priority: 8,
        blockers: ['pillar-config', 'pillar-status'],
        currentTask: 'Implement X-FILES UI components and API integration.',
        nextMilestone: 'Build the `XFilesUI` React component and the backend API endpoint for dossier submission.'
      },
      {
        id: 'pillar-components',
        type: 'system.pillar',
        title: 'pow3r.components',
        description: 'The self-healing, unbound component library. All UI and functional components are generated, tested, and maintained based on their individual pow3r.v3.component.json files.',
        devStatus: 'InProgress',
        percentComplete: 25,
        ownerAgent: 'Luminos',
        priority: 7,
        blockers: ['pillar-config', 'pillar-status'],
        currentTask: 'Implement schema-driven component generation.',
        nextMilestone: 'Rebuild the first primitive component (Button) using the full, schema-driven Phoenix workflow.'
      }
    ];

    for (const component of systemComponents) {
      await this.addNode(component);
    }
  }

  /**
   * Map agents
   */
  async mapAgents() {
    console.log('🤖 Mapping agents...');
    
    const agentsPath = join(this.rootPath, 'agents');
    if (!existsSync(agentsPath)) return;

    const agentFiles = await this.getFilesByExtension(agentsPath, ['.js']);
    
    for (const file of agentFiles) {
      const fileName = basename(file, '.js');
      if (fileName.includes('agent') || fileName.includes('Agent')) {
        const agentType = this.determineAgentType(fileName);
        const agentInfo = await this.analyzeAgentFile(file);
        
        await this.addNode({
          id: fileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          type: `agent.${agentType}`,
          title: agentInfo.name || fileName,
          description: agentInfo.description || `Agent for ${agentType} operations`,
          devStatus: agentInfo.status || 'InProgress',
          percentComplete: agentInfo.completeness || 80,
          ownerAgent: 'A-TEAM System',
          priority: this.priorityMap.agent,
          blockers: agentInfo.blockers || [],
          currentTask: agentInfo.currentTask || 'Operational',
          nextMilestone: agentInfo.nextMilestone || 'Complete implementation'
        });
      }
    }
  }

  /**
   * Map applications
   */
  async mapApplications() {
    console.log('📱 Mapping applications...');
    
    const appComponents = [
      {
        id: 'pow3r-build-app',
        type: 'app.frontend',
        title: 'Pow3r Build App',
        description: 'Main application with 3D visualization, particle space theme, and X-FILES integration.',
        devStatus: 'InProgress',
        percentComplete: 80,
        ownerAgent: 'Developer Agent',
        priority: 8,
        blockers: ['pillar-components', 'pillar-x-files'],
        currentTask: 'Integrating components and implementing X-FILES system.',
        nextMilestone: 'Complete component integration with full X-FILES functionality.'
      }
    ];

    for (const app of appComponents) {
      await this.addNode(app);
    }
  }

  /**
   * Map components
   */
  async mapComponents() {
    console.log('🧩 Mapping components...');
    
    const componentDirs = ['pow3r-search-ui', 'pow3r-graph'];
    
    for (const dir of componentDirs) {
      const componentPath = join(this.rootPath, dir);
      if (existsSync(componentPath)) {
        const componentInfo = await this.analyzeComponent(dir);
        await this.addNode(componentInfo);
      }
    }
  }

  /**
   * Map services
   */
  async mapServices() {
    console.log('⚙️ Mapping services...');
    
    const services = [
      {
        id: 'cloudflare-functions',
        type: 'service.api',
        title: 'CloudFlare Functions',
        description: 'Serverless API functions for data aggregation, deployment, and webhook handling.',
        devStatus: 'InProgress',
        percentComplete: 70,
        ownerAgent: 'Deployer Agent',
        priority: 8,
        blockers: ['pillar-config'],
        currentTask: 'Implementing X-FILES API endpoints and data aggregation.',
        nextMilestone: 'Complete API coverage with full X-FILES integration.'
      },
      {
        id: 'github-integration',
        type: 'service.integration',
        title: 'GitHub Integration',
        description: 'GitHub webhook handling, repository scanning, and automated deployment triggers.',
        devStatus: 'InProgress',
        percentComplete: 60,
        ownerAgent: 'Repo Manager Agent',
        priority: 6,
        blockers: ['cloudflare-functions'],
        currentTask: 'Implementing webhook processing and repository analysis.',
        nextMilestone: 'Complete GitHub integration with automated deployment pipeline.'
      }
    ];

    for (const service of services) {
      await this.addNode(service);
    }
  }

  /**
   * Map configurations
   */
  async mapConfigurations() {
    console.log('⚙️ Mapping configurations...');
    
    const configFiles = await this.getFilesByExtension(this.configPath, ['.json']);
    
    for (const file of configFiles) {
      const fileName = basename(file, '.json');
      if (fileName.includes('pow3r.v3')) {
        const configType = fileName.split('.').pop();
        await this.addNode({
          id: `config-${configType}`,
          type: 'config.schema',
          title: `pow3r.v3.${configType}`,
          description: `Configuration schema for ${configType} operations`,
          devStatus: 'Completed',
          percentComplete: 100,
          ownerAgent: 'Architect Agent',
          priority: 4,
          blockers: [],
          currentTask: 'Operational',
          nextMilestone: 'Enhanced schema validation'
        });
      }
    }
  }

  /**
   * Map testing infrastructure
   */
  async mapTesting() {
    console.log('🧪 Mapping testing infrastructure...');
    
    const testingComponents = [
      {
        id: 'e2e-testing',
        type: 'system.testing',
        title: 'E2E Testing Suite',
        description: 'Playwright-based end-to-end testing for all components and workflows.',
        devStatus: 'InProgress',
        percentComplete: 75,
        ownerAgent: 'Tester Agent',
        priority: 7,
        blockers: ['pillar-components'],
        currentTask: 'Implementing comprehensive test coverage for all components.',
        nextMilestone: '100% test coverage with automated test generation from schemas.'
      }
    ];

    for (const testing of testingComponents) {
      await this.addNode(testing);
    }
  }

  /**
   * Map scripts and utilities
   */
  async mapScripts() {
    console.log('📜 Mapping scripts and utilities...');
    
    const scriptsPath = join(this.rootPath, 'scripts');
    if (!existsSync(scriptsPath)) return;

    const scriptFiles = await this.getFilesByExtension(scriptsPath, ['.js', '.py', '.sh']);
    
    for (const file of scriptFiles) {
      const fileName = basename(file);
      const scriptType = extname(file).substring(1);
      
      await this.addNode({
        id: `script-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        type: 'script.utility',
        title: fileName,
        description: `Utility script for ${scriptType} operations`,
        devStatus: 'Completed',
        percentComplete: 90,
        ownerAgent: 'Developer Agent',
        priority: 2,
        blockers: [],
        currentTask: 'Operational',
        nextMilestone: 'Enhanced automation'
      });
    }
  }

  /**
   * Create relationships between nodes
   */
  async createRelationships() {
    console.log('🔗 Creating relationships...');
    
    const relationships = [
      // System pillar relationships
      { from: 'pillar-status', to: 'pillar-config', type: 'isServedBy', label: 'State is Distributed Via API' },
      { from: 'pillar-components', to: 'pillar-config', type: 'isConfiguredBy', label: 'Consumes Schemas & Configs' },
      { from: 'pillar-x-files', to: 'pillar-config', type: 'sendsTo', label: 'Submits Dossiers Via API' },
      { from: 'pillar-x-files', to: 'pillar-status', type: 'createsIn', label: 'Generates CaseFiles in Graph' },
      { from: 'pillar-components', to: 'pillar-x-files', type: 'integrates', label: 'Embeds Reporting UI' },
      { from: 'pillar-status', to: 'pillar-components', type: 'governs', label: 'State Determines Component Behavior' },
      { from: 'pillar-status', to: 'pillar-x-files', type: 'governs', label: 'State Determines Triage Logic' },
      
      // A-TEAM system relationships
      { from: 'ateam-system', to: 'pillar-config', type: 'uses', label: 'Consumes Schema Definitions' },
      { from: 'ateam-system', to: 'pillar-status', type: 'updates', label: 'Updates World Model' },
      
      // Agent relationships
      { from: 'abi-director-agent', to: 'ateam-system', type: 'directs', label: 'Provides Goal Scoring' },
      { from: 'chat-analyzer-agent', to: 'ateam-system', type: 'analyzes', label: 'Tracks User Requests' },
      { from: 'verification-agent', to: 'ateam-system', type: 'verifies', label: 'Ensures Code Quality' },
      { from: 'apd-manager', to: 'ateam-system', type: 'manages', label: 'Manages World Model' },
      { from: 'guardian-agent', to: 'ateam-system', type: 'enforces', label: 'Constitutional Compliance' },
      { from: 'architect-agent', to: 'ateam-system', type: 'plans', label: 'Creates Implementation Plans' },
      
      // Application relationships
      { from: 'pow3r-build-app', to: 'pow3r-search-ui', type: 'uses', label: 'Integrates Search Component' },
      { from: 'pow3r-build-app', to: 'pow3r-graph', type: 'uses', label: 'Integrates Graph Component' },
      
      // Component relationships
      { from: 'pow3r-search-ui', to: 'pillar-x-files', type: 'integrates', label: 'X-FILES Integration' },
      { from: 'pow3r-graph', to: 'pillar-x-files', type: 'integrates', label: 'X-FILES Integration' },
      { from: 'pow3r-build-app', to: 'pillar-x-files', type: 'integrates', label: 'X-FILES Integration' },
      
      // Service relationships
      { from: 'cloudflare-functions', to: 'pillar-config', type: 'serves', label: 'Serves API Endpoints' },
      { from: 'cloudflare-functions', to: 'pillar-x-files', type: 'processes', label: 'Processes CaseFiles' },
      { from: 'github-integration', to: 'cloudflare-functions', type: 'triggers', label: 'Triggers Deployments' },
      { from: 'github-integration', to: 'pillar-status', type: 'updates', label: 'Updates Repository Status' },
      
      // Testing relationships
      { from: 'e2e-testing', to: 'pow3r-build-app', type: 'tests', label: 'Tests Application' },
      { from: 'e2e-testing', to: 'pow3r-search-ui', type: 'tests', label: 'Tests Components' },
      { from: 'e2e-testing', to: 'pow3r-graph', type: 'tests', label: 'Tests Components' }
    ];

    for (const rel of relationships) {
      await this.addEdge(rel);
    }
  }

  /**
   * Add a node to the architecture
   */
  async addNode(nodeData) {
    const node = {
      id: nodeData.id,
      type: nodeData.type,
      version: '3.0.0',
      props: {
        title: nodeData.title,
        description: nodeData.description,
        devStatus: nodeData.devStatus,
        percentComplete: nodeData.percentComplete,
        ownerAgent: nodeData.ownerAgent,
        priority: nodeData.priority,
        blockers: nodeData.blockers,
        currentTask: nodeData.currentTask,
        nextMilestone: nodeData.nextMilestone
      },
      agentDirectives: {
        constitutionArticleRef: 'Article I',
        requiredTests: [
          {
            description: `Verify that ${nodeData.title} functions correctly`,
            testType: 'e2e-playwright'
          }
        ],
        selfHealing: {
          enabled: true,
          failureCondition: 'errorRate > 0.05 for 5m',
          repairPrompt: `${nodeData.title} has failed. Analyze the error logs and repair according to constitutional requirements.`
        }
      }
    };

    this.architecture.nodes.push(node);
  }

  /**
   * Add an edge to the architecture
   */
  async addEdge(edgeData) {
    const edge = {
      from: { nodeId: edgeData.from },
      to: { nodeId: edgeData.to },
      type: edgeData.type,
      label: edgeData.label
    };

    this.architecture.edges.push(edge);
  }

  /**
   * Get files by extension
   */
  async getFilesByExtension(dir, extensions) {
    const files = [];
    
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getFilesByExtension(fullPath, extensions);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Determine agent type from filename
   */
  determineAgentType(fileName) {
    if (fileName.includes('director')) return 'director';
    if (fileName.includes('analyzer')) return 'analyzer';
    if (fileName.includes('verification')) return 'verification';
    if (fileName.includes('guardian')) return 'guardian';
    if (fileName.includes('architect')) return 'architect';
    if (fileName.includes('developer')) return 'developer';
    if (fileName.includes('tester')) return 'tester';
    if (fileName.includes('deployer')) return 'deployer';
    return 'general';
  }

  /**
   * Analyze agent file
   */
  async analyzeAgentFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      
      // Extract agent information from file content
      const nameMatch = content.match(/class\s+(\w+)/);
      const name = nameMatch ? nameMatch[1] : basename(filePath, '.js');
      
      const descriptionMatch = content.match(/\/\*\*([^*]+)\*\//s);
      const description = descriptionMatch ? descriptionMatch[1].trim() : `Agent for ${name}`;
      
      return {
        name,
        description,
        status: 'InProgress',
        completeness: 80,
        blockers: [],
        currentTask: 'Operational',
        nextMilestone: 'Complete implementation'
      };
    } catch (error) {
      return {
        name: basename(filePath, '.js'),
        description: `Agent for ${basename(filePath, '.js')}`,
        status: 'InProgress',
        completeness: 80,
        blockers: [],
        currentTask: 'Operational',
        nextMilestone: 'Complete implementation'
      };
    }
  }

  /**
   * Analyze component directory
   */
  async analyzeComponent(componentName) {
    const componentMap = {
      'pow3r-search-ui': {
        title: 'Pow3r Search UI',
        description: 'TRON-style Advanced Search UI with particle space theme and X-FILES integration.',
        devStatus: 'Completed',
        percentComplete: 95,
        ownerAgent: 'Component Agent',
        priority: 6,
        blockers: [],
        currentTask: 'Production ready with minor optimizations needed.',
        nextMilestone: 'Advanced search features with AI-powered suggestions.'
      },
      'pow3r-graph': {
        title: 'Pow3r Graph',
        description: '2D/3D graph transformations with Timeline 3D and Transform3r.',
        devStatus: 'InProgress',
        percentComplete: 90,
        ownerAgent: 'Component Agent',
        priority: 6,
        blockers: [],
        currentTask: 'Core functionality complete, optimizing performance.',
        nextMilestone: 'Advanced 3D interactions with real-time data binding.'
      }
    };

    return {
      id: componentName,
      type: 'component.ui',
      ...componentMap[componentName] || {
        title: componentName,
        description: `Component: ${componentName}`,
        devStatus: 'InProgress',
        percentComplete: 50,
        ownerAgent: 'Component Agent',
        priority: 6,
        blockers: [],
        currentTask: 'In development',
        nextMilestone: 'Complete implementation'
      }
    };
  }

  /**
   * Save the mapped architecture
   */
  async saveArchitecture() {
    await writeFile(this.outputPath, JSON.stringify(this.architecture, null, 2));
    console.log(`💾 Architecture saved to: ${this.outputPath}`);
  }
}

// Main execution
async function main() {
  const mapper = new ArchitectureMapper();
  await mapper.mapArchitecture();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Architecture mapping failed:', error);
    process.exit(1);
  });
}

export default ArchitectureMapper;
