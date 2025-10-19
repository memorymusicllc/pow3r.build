/**
 * APD Manager - Architectural Progress Diagram Management
 * Project Phoenix Constitution v3.0 (X-FILES Edition)
 * 
 * Manages the Architectural Progress Diagram (APD) which is the World Model
 * of the entire project's state, goals, dependencies, and health.
 * 
 * The APD is a highly detailed and comprehensive architectural diagram
 * written as a node-based diagram with development status and metadata
 * in the nodes and edges, using the pow3r.v{version_number}.status.json format.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

class APDManager {
  constructor() {
    this.name = 'APD Manager';
    this.role = 'Architectural Progress Diagram Management';
    this.version = '3.0';
    this.apdPath = join(process.cwd(), 'config/pow3r.v3.status.json');
    this.apdBackupPath = join(process.cwd(), 'apd-backup.json');
    
    this.agentDirectives = {
      constitutionRef: '.cursor/rules/pow3r.v3.law.md#article-ii',
      requiredTests: [
        {
          description: 'Verify that APD Manager can maintain the World Model accurately',
          testType: 'e2e-playwright',
          expectedOutcome: 'APD accurately reflects project state and progress'
        },
        {
          description: 'Verify that APD Manager can update node and edge metadata',
          testType: 'e2e-playwright',
          expectedOutcome: 'Node and edge metadata is updated correctly'
        }
      ],
      selfHealing: {
        enabled: true,
        monitoredMetrics: ['apdAccuracy', 'nodeCompleteness', 'edgeIntegrity'],
        failureCondition: 'apdAccuracy < 0.9 for 5m',
        repairPrompt: 'APD Manager has failed to maintain accurate World Model. Analyze APD integrity, node completeness, and edge relationships. Repair according to constitutional requirements.'
      }
    };

    this.nodeTypes = [
      'component',
      'service',
      'config',
      'workflow',
      'agent',
      'data',
      'api',
      'ui',
      'test',
      'deployment'
    ];

    this.edgeTypes = [
      'uses',
      'depends_on',
      'implements',
      'extends',
      'configures',
      'tests',
      'deploys',
      'monitors',
      'validates',
      'transforms'
    ];

    this.statusStates = [
      'planned',
      'in_progress',
      'built',
      'tested',
      'deployed',
      'monitored',
      'deprecated',
      'failed'
    ];
  }

  /**
   * Initialize APD Manager
   */
  async initialize() {
    try {
      console.log('🏗️ Initializing APD Manager...');

      // Load or create APD
      await this.loadAPD();

      console.log('✅ APD Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ APD Manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Load or create APD
   */
  async loadAPD() {
    if (existsSync(this.apdPath)) {
      try {
        const apdData = await readFile(this.apdPath, 'utf8');
        this.apd = JSON.parse(apdData);
        console.log('📊 APD loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load APD:', error);
        await this.createDefaultAPD();
      }
    } else {
      await this.createDefaultAPD();
    }
  }

  /**
   * Create default APD structure
   */
  async createDefaultAPD() {
    this.apd = {
      "$schema": "https://config.superbots.link/?t=schema&v=3",
      "sceneId": "A-TEAM_System_v3_APD",
      "version": "3.0.0",
      "nodes": [
        {
          "id": "ateam-system",
          "type": "system.ateam",
          "version": "3.0.0",
          "props": {
            "title": "A-TEAM System",
            "description": "Autonomous Multi-Agent System with Abi Director, Chat Analyzer, Verification Agent, and APD Manager",
            "devStatus": "InProgress",
            "percentComplete": 80,
            "ownerAgent": "Abi Director",
            "priority": 10,
            "blockers": [],
            "currentTask": "Complete remaining agent implementations",
            "nextMilestone": "Full autonomous development lifecycle with all agents operational"
          },
          "agentDirectives": {
            "constitutionArticleRef": "Article I",
            "requiredTests": [
              {
                "description": "Verify that A-TEAM system can execute full autonomous workflow",
                "testType": "e2e-playwright"
              }
            ],
            "selfHealing": {
              "enabled": true,
              "failureCondition": "workflowSuccess < 0.95 for 5m",
              "repairPrompt": "A-TEAM system workflow success rate has dropped. Analyze agent coordination, check constitutional compliance, and repair orchestration mechanisms."
            }
          }
        }
      ],
      "edges": []
    };

    await this.saveAPD();
    console.log('📊 Default APD created');
  }

  /**
   * Save APD to file
   */
  async saveAPD() {
    try {
      // Create backup
      if (existsSync(this.apdPath)) {
        const currentAPD = await readFile(this.apdPath, 'utf8');
        await writeFile(this.apdBackupPath, currentAPD);
      }

      // Save APD
      await writeFile(this.apdPath, JSON.stringify(this.apd, null, 2));
      console.log('💾 APD saved successfully');
    } catch (error) {
      console.error('❌ Failed to save APD:', error);
    }
  }

  /**
   * Add or update a node in the APD
   * @param {Object} nodeData - Node data
   */
  async addNode(nodeData) {
    try {
      const node = {
        id: nodeData.id,
        type: nodeData.type || 'system.component',
        version: nodeData.version || '3.0.0',
        props: {
          title: nodeData.name || nodeData.id,
          description: nodeData.description || '',
          devStatus: this.mapStatusToDevStatus(nodeData.status?.state || 'planned'),
          percentComplete: nodeData.status?.progress || 0,
          ownerAgent: nodeData.ownerAgent || 'A-TEAM System',
          priority: nodeData.priority || 5,
          blockers: nodeData.blockers || [],
          currentTask: nodeData.currentTask || 'In development',
          nextMilestone: nodeData.nextMilestone || 'Complete implementation',
          ...nodeData.props
        },
        agentDirectives: nodeData.agentDirectives || {
          constitutionArticleRef: 'Article I',
          requiredTests: [
            {
              description: `Verify that ${nodeData.name || nodeData.id} functions correctly`,
              testType: 'e2e-playwright'
            }
          ],
          selfHealing: {
            enabled: true,
            failureCondition: 'errorRate > 0.05 for 5m',
            repairPrompt: `${nodeData.name || nodeData.id} has failed. Analyze the error logs and repair according to constitutional requirements.`
          }
        }
      };

      // Check if node already exists
      const existingNodeIndex = this.apd.nodes.findIndex(n => n.id === node.id);
      
      if (existingNodeIndex >= 0) {
        // Update existing node
        this.apd.nodes[existingNodeIndex] = node;
        console.log(`🔄 Node updated: ${node.id}`);
      } else {
        // Add new node
        this.apd.nodes.push(node);
        console.log(`➕ Node added: ${node.id}`);
      }

      await this.saveAPD();
      return node;

    } catch (error) {
      console.error('❌ Failed to add/update node:', error);
      throw error;
    }
  }

  /**
   * Add or update an edge in the APD
   * @param {Object} edgeData - Edge data
   */
  async addEdge(edgeData) {
    try {
      const edge = {
        id: edgeData.id,
        from: edgeData.from,
        to: edgeData.to,
        type: edgeData.type || 'uses',
        label: edgeData.label || '',
        strength: edgeData.strength || 1.0,
        metadata: {
          edgeId: edgeData.id,
          type: edgeData.type || 'uses',
          ...edgeData.metadata
        }
      };

      // Check if edge already exists
      const existingEdgeIndex = this.apd.edges.findIndex(e => e.id === edge.id);
      
      if (existingEdgeIndex >= 0) {
        // Update existing edge
        this.apd.edges[existingEdgeIndex] = edge;
        console.log(`🔄 Edge updated: ${edge.id}`);
      } else {
        // Add new edge
        this.apd.edges.push(edge);
        console.log(`➕ Edge added: ${edge.id}`);
      }

      await this.saveAPD();
      return edge;

    } catch (error) {
      console.error('❌ Failed to add/update edge:', error);
      throw error;
    }
  }

  /**
   * Update node status
   * @param {string} nodeId - Node ID
   * @param {Object} statusUpdate - Status update
   */
  async updateNodeStatus(nodeId, statusUpdate) {
    try {
      const nodeIndex = this.apd.nodes.findIndex(n => n.id === nodeId);
      
      if (nodeIndex >= 0) {
        const node = this.apd.nodes[nodeIndex];
        
        // Update props based on status update
        if (statusUpdate.state) {
          node.props.devStatus = this.mapStatusToDevStatus(statusUpdate.state);
        }
        if (statusUpdate.progress !== undefined) {
          node.props.percentComplete = statusUpdate.progress;
        }
        if (statusUpdate.quality) {
          // Store quality info in props if needed
          node.props.quality = { ...node.props.quality, ...statusUpdate.quality };
        }
        if (statusUpdate.notes) {
          node.props.currentTask = statusUpdate.notes;
        }

        this.apd.nodes[nodeIndex] = node;
        await this.saveAPD();
        
        console.log(`📊 Node status updated: ${nodeId}`);
        return node;
      } else {
        throw new Error(`Node not found: ${nodeId}`);
      }

    } catch (error) {
      console.error('❌ Failed to update node status:', error);
      throw error;
    }
  }

  /**
   * Get node by ID
   * @param {string} nodeId - Node ID
   */
  getNode(nodeId) {
    return this.apd.nodes.find(n => n.id === nodeId);
  }

  /**
   * Get all nodes of a specific type
   * @param {string} type - Node type
   */
  getNodesByType(type) {
    return this.apd.nodes.filter(n => n.type === type);
  }

  /**
   * Get all edges for a node
   * @param {string} nodeId - Node ID
   */
  getNodeEdges(nodeId) {
    return this.apd.edges.filter(e => e.from === nodeId || e.to === nodeId);
  }

  /**
   * Calculate overall project progress
   */
  calculateProjectProgress() {
    if (this.apd.nodes.length === 0) {
      return 0;
    }

    const totalProgress = this.apd.nodes.reduce((sum, node) => sum + (node.props.percentComplete || 0), 0);
    return Math.round(totalProgress / this.apd.nodes.length);
  }

  /**
   * Calculate overall project quality
   */
  calculateProjectQuality() {
    if (this.apd.nodes.length === 0) {
      return 0;
    }

    const totalQuality = this.apd.nodes.reduce((sum, node) => {
      const qualityScore = node.props.quality?.qualityScore || 0;
      return sum + qualityScore;
    }, 0);
    return Math.round((totalQuality / this.apd.nodes.length) * 100) / 100;
  }

  /**
   * Update overall project status
   */
  async updateProjectStatus() {
    const progress = this.calculateProjectProgress();
    const quality = this.calculateProjectQuality();

    // Update the main A-TEAM system node with overall status
    const ateamNodeIndex = this.apd.nodes.findIndex(n => n.id === 'ateam-system');
    if (ateamNodeIndex >= 0) {
      this.apd.nodes[ateamNodeIndex].props.percentComplete = progress;
      this.apd.nodes[ateamNodeIndex].props.quality = {
        overallScore: quality,
        lastCalculated: new Date().toISOString()
      };

      // Determine overall state
      if (progress >= 100) {
        this.apd.nodes[ateamNodeIndex].props.devStatus = 'Completed';
        this.apd.nodes[ateamNodeIndex].props.currentTask = 'System fully operational';
      } else if (progress >= 80) {
        this.apd.nodes[ateamNodeIndex].props.devStatus = 'InProgress';
        this.apd.nodes[ateamNodeIndex].props.currentTask = 'Near completion';
      } else if (progress >= 50) {
        this.apd.nodes[ateamNodeIndex].props.devStatus = 'InProgress';
        this.apd.nodes[ateamNodeIndex].props.currentTask = 'In active development';
      } else {
        this.apd.nodes[ateamNodeIndex].props.devStatus = 'InProgress';
        this.apd.nodes[ateamNodeIndex].props.currentTask = 'Early stage development';
      }
    }

    await this.saveAPD();
    console.log(`📊 Project status updated: ${progress}% progress, ${quality} quality`);
  }

  /**
   * Get APD summary
   */
  getAPDSummary() {
    return {
      sceneId: this.apd.sceneId,
      version: this.apd.version,
      nodeCount: this.apd.nodes.length,
      edgeCount: this.apd.edges.length,
      overallProgress: this.calculateProjectProgress(),
      overallQuality: this.calculateProjectQuality(),
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Export APD to different formats
   * @param {string} format - Export format (json, yaml, dot)
   */
  async exportAPD(format = 'json') {
    try {
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(this.apd, null, 2);
        
        case 'yaml':
          // In a real implementation, you would use a YAML library
          return JSON.stringify(this.apd, null, 2);
        
        case 'dot':
          return this.generateDOTFormat();
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('❌ Failed to export APD:', error);
      throw error;
    }
  }

  /**
   * Generate DOT format for graph visualization
   */
  generateDOTFormat() {
    let dot = 'digraph APD {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=filled];\n\n';

    // Add nodes
    for (const node of this.apd.nodes) {
      const color = this.getNodeColor(node.status.state);
      dot += `  "${node.id}" [label="${node.name}", fillcolor="${color}"];\n`;
    }

    dot += '\n';

    // Add edges
    for (const edge of this.apd.edges) {
      dot += `  "${edge.from}" -> "${edge.to}" [label="${edge.label}"];\n`;
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Map status to devStatus format
   */
  mapStatusToDevStatus(status) {
    const statusMap = {
      'planned': 'NotStarted',
      'in_progress': 'InProgress',
      'built': 'InProgress',
      'tested': 'InProgress',
      'deployed': 'InProgress',
      'monitored': 'InProgress',
      'completed': 'Completed',
      'deprecated': 'Deprecated',
      'failed': 'Blocked'
    };
    return statusMap[status] || 'NotStarted';
  }

  /**
   * Get node color based on status
   */
  getNodeColor(status) {
    const colors = {
      'planned': 'lightgray',
      'in_progress': 'yellow',
      'built': 'lightgreen',
      'tested': 'green',
      'deployed': 'darkgreen',
      'monitored': 'blue',
      'deprecated': 'orange',
      'failed': 'red'
    };
    return colors[status] || 'lightgray';
  }

  /**
   * Get APD Manager status
   */
  getStatus() {
    return {
      agent: 'APD Manager',
      role: 'Architectural Progress Diagram Management',
      version: this.version,
      status: 'active',
      apdPath: this.apdPath,
      nodeCount: this.apd?.nodes?.length || 0,
      edgeCount: this.apd?.edges?.length || 0,
      sceneId: this.apd?.sceneId || 'Unknown',
      constitutionalCompliance: true
    };
  }
}

export default APDManager;
