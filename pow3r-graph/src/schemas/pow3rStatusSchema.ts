/**
 * Pow3r Status JSON Schema
 * Defines the structure for pow3r.v3.status.json files
 */

// Status type definitions
export type NodeStatus = 'building' | 'backlogged' | 'blocked' | 'burned' | 'built' | 'broken';
export type LegacyStatus = 'green' | 'orange' | 'red' | 'gray';

export interface NodeStatusInfo {
  state: NodeStatus;
  progress: number; // 0-100
  quality?: {
    qualityScore?: number; // 0-1
    notes?: string;
  };
  legacy?: {
    phase?: LegacyStatus;
    completeness?: number; // 0-1
  };
}

export interface Pow3rStatusNode {
  id: string;
  name: string;
  type: 'component' | 'service' | 'data' | 'workflow' | 'api' | 'test' | 'config' | 'documentation';
  category: string;
  description?: string;
  status: NodeStatus | LegacyStatus | NodeStatusInfo; // Support both new and legacy formats
  fileType?: string;
  tags?: string[];
  metadata?: {
    nodeId?: string;
    category?: string;
    type?: string;
    [key: string]: any;
  };
  stats?: {
    totalCommitsLast30Days?: number;
    totalCommitsLast14Days?: number;
    fileCount?: number;
    sizeMB?: number;
    primaryLanguage?: string;
    workingTreeClean?: boolean;
  };
  quality?: {
    completeness?: number;
    qualityScore?: number;
    notes?: string;
  };
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  timeline?: {
    start: number;
    end: number;
    milestones: Array<{
      date: string;
      event: string;
      description?: string;
    }>;
  };
}

export interface Pow3rStatusEdge {
  id: string;
  from: string;
  to: string;
  type: 'dependsOn' | 'uses' | 'implements' | 'references' | 'queries' | 'entangles' | 'generates' | 'processes';
  label: string;
  strength?: number;
  metadata?: {
    edgeId?: string;
    type?: string;
    [key: string]: any;
  };
}

export interface Pow3rStatusWorkflow {
  id: string;
  type: 'workflow.user-journey' | 'workflow.data-pipeline' | 'workflow.build-process';
  name: string;
  description: string;
  steps: Array<{
    id: string;
    name: string;
    component: string;
    description: string;
  }>;
  category: string;
}

export interface Pow3rStatusConfig {
  projectName: string;
  lastUpdate: string;
  source: 'local' | 'remote';
  repositoryPath?: string;
  branch?: string;
  status: NodeStatus | LegacyStatus | NodeStatusInfo; // Support both new and legacy formats
  stats: {
    totalCommitsLast30Days: number;
    totalCommitsLast14Days: number;
    fileCount: number;
    sizeMB: number;
    primaryLanguage: string;
    workingTreeClean: boolean;
  };
  nodes: Pow3rStatusNode[];
  edges: Pow3rStatusEdge[];
  workflows?: Pow3rStatusWorkflow[];
  metadata: {
    [key: string]: any;
  };
}

// Schema validation
export const validatePow3rStatus = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.projectName) errors.push('Missing projectName');
  if (!data.lastUpdate) errors.push('Missing lastUpdate');
  if (!data.source) errors.push('Missing source');
  if (!data.status) errors.push('Missing status');
  if (!data.stats) errors.push('Missing stats');
  if (!data.nodes) errors.push('Missing nodes');
  if (!data.edges) errors.push('Missing edges');
  if (!data.metadata) errors.push('Missing metadata');
  
  // Validate nodes
  if (data.nodes && Array.isArray(data.nodes)) {
    data.nodes.forEach((node: any, index: number) => {
      if (!node.id) errors.push(`Node ${index}: Missing id`);
      if (!node.name) errors.push(`Node ${index}: Missing name`);
      if (!node.type) errors.push(`Node ${index}: Missing type`);
      if (!node.category) errors.push(`Node ${index}: Missing category`);
      if (!node.status) errors.push(`Node ${index}: Missing status`);
      
      // Validate status values
      const validNewStatuses: NodeStatus[] = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken'];
      const validLegacyStatuses: LegacyStatus[] = ['green', 'orange', 'red', 'gray'];
      const allValidStatuses = [...validNewStatuses, ...validLegacyStatuses];
      
      if (typeof node.status === 'string') {
        if (!allValidStatuses.includes(node.status as any)) {
          errors.push(`Node ${index}: Invalid status '${node.status}'`);
        }
      } else if (typeof node.status === 'object') {
        if (!node.status.state || !validNewStatuses.includes(node.status.state)) {
          errors.push(`Node ${index}: Invalid or missing status.state`);
        }
        if (typeof node.status.progress !== 'number' || node.status.progress < 0 || node.status.progress > 100) {
          errors.push(`Node ${index}: Invalid or missing status.progress (must be 0-100)`);
        }
      }
      
      // Validate type values
      const validTypes = ['component', 'service', 'data', 'workflow', 'api', 'test', 'config', 'documentation'];
      if (!validTypes.includes(node.type)) {
        errors.push(`Node ${index}: Invalid type '${node.type}'`);
      }
    });
  }
  
  // Validate edges
  if (data.edges && Array.isArray(data.edges)) {
    data.edges.forEach((edge: any, index: number) => {
      if (!edge.id) errors.push(`Edge ${index}: Missing id`);
      if (!edge.from) errors.push(`Edge ${index}: Missing from`);
      if (!edge.to) errors.push(`Edge ${index}: Missing to`);
      if (!edge.type) errors.push(`Edge ${index}: Missing type`);
      if (!edge.label) errors.push(`Edge ${index}: Missing label`);
      
      // Validate type values
      const validTypes = ['dependsOn', 'uses', 'implements', 'references', 'queries', 'entangles', 'generates', 'processes'];
      if (!validTypes.includes(edge.type)) {
        errors.push(`Edge ${index}: Invalid type '${edge.type}'`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Schema transformation utilities
export const transformToGraphData = (config: Pow3rStatusConfig) => {
  return {
    nodes: config.nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      category: node.category,
      description: node.description,
      status: node.status,
      fileType: node.fileType,
      tags: node.tags || [],
      metadata: node.metadata || {},
      stats: node.stats,
      quality: node.quality,
      position: node.position,
      timeline: node.timeline
    })),
    edges: config.edges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      label: edge.label,
      strength: edge.strength || 1.0,
      metadata: edge.metadata || {}
    })),
    workflows: config.workflows || [],
    metadata: config.metadata
  };
};

// Search utilities
export const searchNodes = (config: Pow3rStatusConfig, query: string): Pow3rStatusNode[] => {
  if (!query.trim()) return config.nodes;
  
  const queryLower = query.toLowerCase();
  
  return config.nodes.filter(node => {
    const searchText = `${node.name} ${node.description || ''} ${node.category} ${node.type}`.toLowerCase();
    return searchText.includes(queryLower);
  });
};

export const filterNodes = (config: Pow3rStatusConfig, filters: { [key: string]: any }): Pow3rStatusNode[] => {
  let nodes = config.nodes;
  
  if (filters.category) {
    nodes = nodes.filter(node => node.category === filters.category);
  }
  
  if (filters.type) {
    nodes = nodes.filter(node => node.type === filters.type);
  }
  
  if (filters.status) {
    nodes = nodes.filter(node => node.status === filters.status);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    nodes = nodes.filter(node => 
      node.tags && node.tags.some(tag => filters.tags.includes(tag))
    );
  }
  
  return nodes;
};

export const getNodeById = (config: Pow3rStatusConfig, id: string): Pow3rStatusNode | undefined => {
  return config.nodes.find(node => node.id === id);
};

export const getNodeByName = (config: Pow3rStatusConfig, name: string): Pow3rStatusNode | undefined => {
  return config.nodes.find(node => node.name === name);
};

export const getNodesByTag = (config: Pow3rStatusConfig, tag: string): Pow3rStatusNode[] => {
  return config.nodes.filter(node => node.tags && node.tags.includes(tag));
};

export const getConnectedNodes = (config: Pow3rStatusConfig, nodeId: string): Pow3rStatusNode[] => {
  const connectedIds = new Set<string>();
  
  config.edges.forEach(edge => {
    if (edge.from === nodeId) {
      connectedIds.add(edge.to);
    }
    if (edge.to === nodeId) {
      connectedIds.add(edge.from);
    }
  });
  
  return config.nodes.filter(node => connectedIds.has(node.id));
};

export const getNodeTimeline = (config: Pow3rStatusConfig, nodeId: string) => {
  const node = getNodeById(config, nodeId);
  return node?.timeline;
};

export const createTimelineTransform = (config: Pow3rStatusConfig, nodeId: string, timeline: number) => {
  const node = getNodeById(config, nodeId);
  if (!node || !node.timeline) return null;
  
  const { start, end, milestones } = node.timeline;
  const currentTime = start + (end - start) * (timeline / 100);
  
  return {
    nodeId,
    currentTime,
    milestones: milestones.filter(milestone => {
      const milestoneTime = new Date(milestone.date).getTime();
      return milestoneTime <= currentTime;
    })
  };
};

// Status conversion utilities
export const convertLegacyToNewStatus = (legacyStatus: LegacyStatus): NodeStatus => {
  const statusMap: Record<LegacyStatus, NodeStatus> = {
    'green': 'built',
    'orange': 'building',
    'red': 'broken',
    'gray': 'backlogged'
  };
  return statusMap[legacyStatus];
};

export const convertNewToLegacyStatus = (newStatus: NodeStatus): LegacyStatus => {
  const statusMap: Record<NodeStatus, LegacyStatus> = {
    'built': 'green',
    'building': 'orange',
    'broken': 'red',
    'backlogged': 'gray',
    'blocked': 'orange',
    'burned': 'gray'
  };
  return statusMap[newStatus];
};

export const normalizeNodeStatus = (status: NodeStatus | LegacyStatus | NodeStatusInfo): NodeStatusInfo => {
  if (typeof status === 'object') {
    return status;
  }
  
  // Check if it's a new status
  const newStatuses: NodeStatus[] = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken'];
  if (newStatuses.includes(status as NodeStatus)) {
    const progress = status === 'built' ? 100 : status === 'building' ? 50 : status === 'backlogged' ? 0 : 0;
    return {
      state: status as NodeStatus,
      progress,
      legacy: {
        phase: convertNewToLegacyStatus(status as NodeStatus)
      }
    };
  }
  
  // It's a legacy status
  return {
    state: convertLegacyToNewStatus(status as LegacyStatus),
    progress: status === 'green' ? 100 : status === 'orange' ? 50 : 0,
    legacy: {
      phase: status as LegacyStatus
    }
  };
};

export const getNodeStatusState = (node: Pow3rStatusNode): NodeStatus => {
  if (typeof node.status === 'object') {
    return node.status.state;
  }
  const newStatuses: NodeStatus[] = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken'];
  if (newStatuses.includes(node.status as NodeStatus)) {
    return node.status as NodeStatus;
  }
  return convertLegacyToNewStatus(node.status as LegacyStatus);
};

export const getNodeProgress = (node: Pow3rStatusNode): number => {
  if (typeof node.status === 'object') {
    return node.status.progress;
  }
  const statusInfo = normalizeNodeStatus(node.status);
  return statusInfo.progress;
};

export default Pow3rStatusConfig;
