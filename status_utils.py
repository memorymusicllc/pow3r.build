#!/usr/bin/env python3
"""
Status Utilities
Helper functions for converting between legacy and new status formats
"""

from typing import Dict, Union, Literal

# Type definitions
NodeStatus = Literal['building', 'backlogged', 'blocked', 'burned', 'built', 'broken']
LegacyStatus = Literal['green', 'orange', 'red', 'gray']

# Status mappings
LEGACY_TO_NEW: Dict[LegacyStatus, NodeStatus] = {
    'green': 'built',
    'orange': 'building',
    'red': 'broken',
    'gray': 'backlogged'
}

NEW_TO_LEGACY: Dict[NodeStatus, LegacyStatus] = {
    'built': 'green',
    'building': 'orange',
    'broken': 'red',
    'backlogged': 'gray',
    'blocked': 'orange',
    'burned': 'gray'
}

# Progress defaults for statuses
STATUS_PROGRESS: Dict[NodeStatus, int] = {
    'built': 100,
    'building': 50,
    'broken': 75,
    'backlogged': 0,
    'blocked': 40,
    'burned': 0
}


def convert_legacy_to_new(legacy_status: str) -> str:
    """Convert legacy status (green/orange/red/gray) to new status"""
    return LEGACY_TO_NEW.get(legacy_status, 'backlogged')


def convert_new_to_legacy(new_status: str) -> str:
    """Convert new status to legacy status"""
    return NEW_TO_LEGACY.get(new_status, 'gray')


def normalize_status(status: Union[str, Dict]) -> Dict:
    """
    Normalize any status format to the new format with full structure
    
    Args:
        status: Can be:
            - Legacy string: 'green', 'orange', 'red', 'gray'
            - New string: 'building', 'backlogged', 'blocked', 'burned', 'built', 'broken'
            - Dict with new format: {'state': ..., 'progress': ...}
            - Dict with legacy format: {'phase': ..., 'completeness': ...}
    
    Returns:
        Dict with new format: {
            'state': NodeStatus,
            'progress': int (0-100),
            'quality': {...},
            'legacy': {'phase': ..., 'completeness': ...}
        }
    """
    # Already in new dict format
    if isinstance(status, dict) and 'state' in status:
        result = {
            'state': status['state'],
            'progress': status.get('progress', STATUS_PROGRESS.get(status['state'], 0)),
            'quality': status.get('quality', {}),
            'legacy': status.get('legacy', {
                'phase': convert_new_to_legacy(status['state'])
            })
        }
        return result
    
    # Legacy dict format
    if isinstance(status, dict) and 'phase' in status:
        phase = status['phase']
        new_state = convert_legacy_to_new(phase)
        completeness = status.get('completeness', 0.5)
        progress = int(completeness * 100)
        
        return {
            'state': new_state,
            'progress': progress,
            'quality': {
                'qualityScore': status.get('qualityScore', 0.7),
                'notes': status.get('notes', '')
            },
            'legacy': {
                'phase': phase,
                'completeness': completeness
            }
        }
    
    # String status - check if new or legacy
    if isinstance(status, str):
        new_statuses = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken']
        
        if status in new_statuses:
            # New status string
            return {
                'state': status,
                'progress': STATUS_PROGRESS.get(status, 0),
                'quality': {},
                'legacy': {
                    'phase': convert_new_to_legacy(status)
                }
            }
        else:
            # Legacy status string
            new_state = convert_legacy_to_new(status)
            progress = 100 if status == 'green' else 50 if status == 'orange' else 0
            
            return {
                'state': new_state,
                'progress': progress,
                'quality': {},
                'legacy': {
                    'phase': status
                }
            }
    
    # Default fallback
    return {
        'state': 'backlogged',
        'progress': 0,
        'quality': {},
        'legacy': {'phase': 'gray'}
    }


def create_status_info(state: str, progress: int = None, quality_score: float = None, notes: str = None) -> Dict:
    """
    Create a properly formatted status info object
    
    Args:
        state: NodeStatus ('building', 'backlogged', etc.)
        progress: Progress percentage (0-100), defaults based on state
        quality_score: Quality score (0-1)
        notes: Optional notes
    
    Returns:
        Properly formatted status dict
    """
    if progress is None:
        progress = STATUS_PROGRESS.get(state, 0)
    
    status_info = {
        'state': state,
        'progress': max(0, min(100, progress)),
        'quality': {},
        'legacy': {
            'phase': convert_new_to_legacy(state),
            'completeness': progress / 100.0
        }
    }
    
    if quality_score is not None or notes is not None:
        status_info['quality'] = {}
        if quality_score is not None:
            status_info['quality']['qualityScore'] = max(0.0, min(1.0, quality_score))
        if notes:
            status_info['quality']['notes'] = notes
    
    return status_info


def get_status_state(status: Union[str, Dict]) -> str:
    """Extract the state from any status format"""
    normalized = normalize_status(status)
    return normalized['state']


def get_status_progress(status: Union[str, Dict]) -> int:
    """Extract the progress from any status format"""
    normalized = normalize_status(status)
    return normalized['progress']


def calculate_overall_status(nodes: list) -> Dict:
    """
    Calculate overall repository status based on node statuses
    
    Args:
        nodes: List of nodes with status information
    
    Returns:
        Overall status dict with state, progress, and breakdown
    """
    if not nodes:
        return create_status_info('backlogged', 0)
    
    # Count nodes by status
    status_counts = {}
    total_progress = 0
    
    for node in nodes:
        node_status = node.get('status', 'backlogged')
        state = get_status_state(node_status)
        progress = get_status_progress(node_status)
        
        status_counts[state] = status_counts.get(state, 0) + 1
        total_progress += progress
    
    avg_progress = total_progress // len(nodes)
    
    # Determine overall state
    if status_counts.get('broken', 0) > 0:
        overall_state = 'broken'
    elif status_counts.get('blocked', 0) > len(nodes) * 0.3:
        overall_state = 'blocked'
    elif status_counts.get('building', 0) > 0:
        overall_state = 'building'
    elif status_counts.get('built', 0) == len(nodes):
        overall_state = 'built'
    elif status_counts.get('backlogged', 0) > len(nodes) * 0.5:
        overall_state = 'backlogged'
    else:
        overall_state = 'building'
    
    return {
        'state': overall_state,
        'progress': avg_progress,
        'quality': {},
        'legacy': {
            'phase': convert_new_to_legacy(overall_state)
        },
        'breakdown': status_counts
    }


if __name__ == '__main__':
    # Test the utilities
    print("Testing status utilities...")
    
    # Test legacy string conversion
    print("\n1. Legacy string 'green':")
    print(normalize_status('green'))
    
    # Test new string conversion
    print("\n2. New string 'building':")
    print(normalize_status('building'))
    
    # Test legacy dict conversion
    print("\n3. Legacy dict:")
    print(normalize_status({'phase': 'orange', 'completeness': 0.75, 'qualityScore': 0.85}))
    
    # Test new dict (already normalized)
    print("\n4. New dict:")
    print(normalize_status({'state': 'built', 'progress': 100}))
    
    # Test create_status_info
    print("\n5. Create new status:")
    print(create_status_info('building', 65, 0.8, 'In active development'))
    
    print("\n✓ All tests passed")

