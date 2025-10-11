/**
 * Status Utilities for CloudFlare Workers
 * Helper functions for converting between legacy and new status formats
 */

// Status mappings
const LEGACY_TO_NEW = {
  'green': 'built',
  'orange': 'building',
  'red': 'broken',
  'gray': 'backlogged'
};

const NEW_TO_LEGACY = {
  'built': 'green',
  'building': 'orange',
  'broken': 'red',
  'backlogged': 'gray',
  'blocked': 'orange',
  'burned': 'gray'
};

// Progress defaults for statuses
const STATUS_PROGRESS = {
  'built': 100,
  'building': 50,
  'broken': 75,
  'backlogged': 0,
  'blocked': 40,
  'burned': 0
};

/**
 * Convert legacy status to new status
 */
export function convertLegacyToNew(legacyStatus) {
  return LEGACY_TO_NEW[legacyStatus] || 'backlogged';
}

/**
 * Convert new status to legacy status
 */
export function convertNewToLegacy(newStatus) {
  return NEW_TO_LEGACY[newStatus] || 'gray';
}

/**
 * Normalize any status format to the new format
 */
export function normalizeStatus(status) {
  // Already in new dict format
  if (typeof status === 'object' && status.state) {
    return {
      state: status.state,
      progress: status.progress !== undefined ? status.progress : STATUS_PROGRESS[status.state] || 0,
      quality: status.quality || {},
      legacy: status.legacy || {
        phase: convertNewToLegacy(status.state)
      }
    };
  }
  
  // Legacy dict format
  if (typeof status === 'object' && status.phase) {
    const newState = convertLegacyToNew(status.phase);
    const completeness = status.completeness !== undefined ? status.completeness : 0.5;
    const progress = Math.round(completeness * 100);
    
    return {
      state: newState,
      progress,
      quality: {
        qualityScore: status.qualityScore || 0.7,
        notes: status.notes || ''
      },
      legacy: {
        phase: status.phase,
        completeness
      }
    };
  }
  
  // String status
  if (typeof status === 'string') {
    const newStatuses = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken'];
    
    if (newStatuses.includes(status)) {
      // New status string
      return {
        state: status,
        progress: STATUS_PROGRESS[status] || 0,
        quality: {},
        legacy: {
          phase: convertNewToLegacy(status)
        }
      };
    } else {
      // Legacy status string
      const newState = convertLegacyToNew(status);
      const progress = status === 'green' ? 100 : status === 'orange' ? 50 : 0;
      
      return {
        state: newState,
        progress,
        quality: {},
        legacy: {
          phase: status
        }
      };
    }
  }
  
  // Default fallback
  return {
    state: 'backlogged',
    progress: 0,
    quality: {},
    legacy: { phase: 'gray' }
  };
}

/**
 * Create a properly formatted status info object
 */
export function createStatusInfo(state, progress = null, qualityScore = null, notes = null) {
  if (progress === null) {
    progress = STATUS_PROGRESS[state] || 0;
  }
  
  const statusInfo = {
    state,
    progress: Math.max(0, Math.min(100, progress)),
    quality: {},
    legacy: {
      phase: convertNewToLegacy(state),
      completeness: progress / 100.0
    }
  };
  
  if (qualityScore !== null || notes !== null) {
    statusInfo.quality = {};
    if (qualityScore !== null) {
      statusInfo.quality.qualityScore = Math.max(0.0, Math.min(1.0, qualityScore));
    }
    if (notes) {
      statusInfo.quality.notes = notes;
    }
  }
  
  return statusInfo;
}

/**
 * Extract the state from any status format
 */
export function getStatusState(status) {
  const normalized = normalizeStatus(status);
  return normalized.state;
}

/**
 * Extract the progress from any status format
 */
export function getStatusProgress(status) {
  const normalized = normalizeStatus(status);
  return normalized.progress;
}

/**
 * Calculate overall repository status based on node statuses
 */
export function calculateOverallStatus(nodes) {
  if (!nodes || nodes.length === 0) {
    return createStatusInfo('backlogged', 0);
  }
  
  // Count nodes by status
  const statusCounts = {};
  let totalProgress = 0;
  
  for (const node of nodes) {
    const nodeStatus = node.status || 'backlogged';
    const state = getStatusState(nodeStatus);
    const progress = getStatusProgress(nodeStatus);
    
    statusCounts[state] = (statusCounts[state] || 0) + 1;
    totalProgress += progress;
  }
  
  const avgProgress = Math.round(totalProgress / nodes.length);
  
  // Determine overall state
  let overallState;
  if (statusCounts.broken > 0) {
    overallState = 'broken';
  } else if (statusCounts.blocked > nodes.length * 0.3) {
    overallState = 'blocked';
  } else if (statusCounts.building > 0) {
    overallState = 'building';
  } else if (statusCounts.built === nodes.length) {
    overallState = 'built';
  } else if (statusCounts.backlogged > nodes.length * 0.5) {
    overallState = 'backlogged';
  } else {
    overallState = 'building';
  }
  
  return {
    state: overallState,
    progress: avgProgress,
    quality: {},
    legacy: {
      phase: convertNewToLegacy(overallState)
    },
    breakdown: statusCounts
  };
}

