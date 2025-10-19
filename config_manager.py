#!/usr/bin/env python3
"""
Config Manager - pow3r.v3.status.json Lifecycle Management
Handles create, read, update, validate operations for config files
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from status_utils import (
    normalize_status, 
    create_status_info, 
    get_status_state, 
    get_status_progress,
    calculate_overall_status
)


class ConfigManager:
    """Manages pow3r.v3.status.json lifecycle"""
    
    CONFIG_FILENAME = 'config/pow3r.v3.status.json'
    
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.config_file = self.repo_path / self.CONFIG_FILENAME
    
    def exists(self) -> bool:
        """Check if config exists"""
        return self.config_file.exists()
    
    def read(self) -> Optional[Dict]:
        """Read existing config"""
        if self.exists():
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError as e:
                print(f"Error reading config: {e}")
                return None
        return None
    
    def create(self, data: Dict) -> bool:
        """Create new config"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error creating config: {e}")
            return False
    
    def update(self, updates: Dict) -> bool:
        """Update existing config (merge with existing)"""
        config = self.read() or {}
        
        # Smart merge - update lastScan, merge assets, edges
        config['lastScan'] = updates.get('lastScan', datetime.now().isoformat())
        
        if 'assets' in updates:
            # Merge assets by ID
            existing_assets = {a['id']: a for a in config.get('assets', [])}
            for asset in updates['assets']:
                existing_assets[asset['id']] = asset
            config['assets'] = list(existing_assets.values())
        
        if 'edges' in updates:
            # Merge edges
            existing_edges = config.get('edges', [])
            config['edges'] = existing_edges + updates['edges']
        
        return self.create(config)
    
    def get_status(self) -> str:
        """Get current status state of primary asset"""
        config = self.read()
        if config and 'assets' in config and len(config['assets']) > 0:
            status = config['assets'][0].get('status', {})
            return get_status_state(status)
        return 'unknown'
    
    def validate(self) -> Tuple[bool, List[str]]:
        """Validate config against schema"""
        config = self.read()
        if not config:
            return False, ["Config file not found or invalid JSON"]
        
        errors = []
        
        # Check required root fields
        required_root = ['graphId', 'lastScan', 'assets', 'edges']
        for field in required_root:
            if field not in config:
                errors.append(f"Missing required root field: {field}")
        
        # Validate assets
        if 'assets' in config:
            for i, asset in enumerate(config['assets']):
                required_asset_fields = ['id', 'type', 'source', 'location', 'metadata', 'status']
                for field in required_asset_fields:
                    if field not in asset:
                        errors.append(f"Asset {i}: Missing required field: {field}")
                
                # Validate status
                if 'status' in asset:
                    status = asset['status']
                    
                    # Support both new and legacy formats
                    if isinstance(status, dict):
                        # New format: requires 'state' and 'progress'
                        if 'state' in status:
                            valid_states = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken']
                            if status['state'] not in valid_states:
                                errors.append(f"Asset {i}: Invalid status.state: {status['state']}")
                            if 'progress' not in status:
                                errors.append(f"Asset {i}: Missing status.progress")
                            elif not isinstance(status['progress'], (int, float)) or status['progress'] < 0 or status['progress'] > 100:
                                errors.append(f"Asset {i}: Invalid status.progress (must be 0-100)")
                        # Legacy format: requires 'phase'
                        elif 'phase' in status:
                            if status['phase'] not in ['green', 'orange', 'red', 'gray']:
                                errors.append(f"Asset {i}: Invalid legacy phase: {status['phase']}")
                        else:
                            errors.append(f"Asset {i}: Status must have 'state' (new format) or 'phase' (legacy format)")
                    elif isinstance(status, str):
                        # String status (either new or legacy)
                        valid_statuses = ['building', 'backlogged', 'blocked', 'burned', 'built', 'broken', 'green', 'orange', 'red', 'gray']
                        if status not in valid_statuses:
                            errors.append(f"Asset {i}: Invalid status string: {status}")
                    else:
                        errors.append(f"Asset {i}: Status must be string or dict")
        
        # Validate edges
        if 'edges' in config:
            for i, edge in enumerate(config['edges']):
                if 'from' not in edge or 'to' not in edge:
                    errors.append(f"Edge {i}: Missing from/to fields")
        
        return len(errors) == 0, errors
    
    def get_analytics(self) -> Dict:
        """Get analytics summary from config"""
        config = self.read()
        if not config:
            return {}
        
        assets = config.get('assets', [])
        edges = config.get('edges', [])
        
        return {
            'total_assets': len(assets),
            'total_edges': len(edges),
            'by_status': self._count_by_status(assets),
            'by_type': self._count_by_type(assets),
            'total_activity': sum(a.get('analytics', {}).get('activityLast30Days', 0) for a in assets),
            'avg_completeness': sum(a.get('status', {}).get('completeness', 0) for a in assets) / len(assets) if assets else 0,
            'avg_quality': sum(a.get('status', {}).get('qualityScore', 0) for a in assets) / len(assets) if assets else 0
        }
    
    def _count_by_status(self, assets: List[Dict]) -> Dict:
        """Count assets by status state (new format)"""
        counts = {
            'building': 0, 
            'backlogged': 0, 
            'blocked': 0, 
            'burned': 0, 
            'built': 0, 
            'broken': 0
        }
        legacy_counts = {'green': 0, 'orange': 0, 'red': 0, 'gray': 0}
        
        for asset in assets:
            status = asset.get('status', {})
            state = get_status_state(status)
            counts[state] = counts.get(state, 0) + 1
            
            # Also maintain legacy count for backward compatibility
            normalized = normalize_status(status)
            if 'legacy' in normalized and 'phase' in normalized['legacy']:
                legacy_phase = normalized['legacy']['phase']
                legacy_counts[legacy_phase] = legacy_counts.get(legacy_phase, 0) + 1
        
        return {
            'new': counts,
            'legacy': legacy_counts
        }
    
    def _count_by_type(self, assets: List[Dict]) -> Dict:
        """Count assets by type"""
        counts = {}
        for asset in assets:
            asset_type = asset.get('type', 'unknown')
            counts[asset_type] = counts.get(asset_type, 0) + 1
        return counts
    
    def migrate_from_old(self, old_config_path: Path) -> bool:
        """Migrate from dev-status.config.json to pow3r.v3.status.json"""
        try:
            with open(old_config_path, 'r') as f:
                old = json.load(f)
            
            new = self._convert_old_schema(old)
            return self.create(new)
        except Exception as e:
            print(f"Error migrating config: {e}")
            return False
    
    def _convert_old_schema(self, old: Dict) -> Dict:
        """Convert old schema to new schema"""
        graph_id = hashlib.sha256(
            f"{old.get('projectName', 'unknown')}-{datetime.now().isoformat()}".encode()
        ).hexdigest()[:16]
        
        new = {
            "graphId": graph_id,
            "lastScan": old.get('lastUpdate', datetime.now().isoformat()),
            "assets": [],
            "edges": []
        }
        
        # Convert nodes to assets
        for node in old.get('nodes', []):
            asset = {
                "id": node.get('id', f"asset-{len(new['assets'])}"),
                "type": self._infer_type_from_old(node),
                "source": old.get('source', 'local'),
                "location": node.get('path', ''),
                "metadata": {
                    "title": node.get('title', 'Untitled'),
                    "description": "",
                    "tags": [],
                    "version": "1.0.0",
                    "authors": [],
                    "createdAt": old.get('lastUpdate', datetime.now().isoformat()),
                    "lastUpdate": old.get('lastUpdate', datetime.now().isoformat())
                },
                "status": {
                    "phase": node.get('status', 'gray'),
                    "completeness": 0.5,
                    "qualityScore": 0.5,
                    "notes": ""
                },
                "dependencies": {
                    "io": {},
                    "universalConfigRef": "v1.0"
                },
                "analytics": {
                    "embedding": [],
                    "connectivity": 0,
                    "centralityScore": 0.5,
                    "activityLast30Days": node.get('totalCommitsLast30Days', 0)
                }
            }
            new['assets'].append(asset)
        
        # Convert edges
        for edge in old.get('edges', []):
            new_edge = {
                "from": edge.get('source', ''),
                "to": edge.get('target', ''),
                "type": "dependsOn",
                "strength": 0.8
            }
            new['edges'].append(new_edge)
        
        return new
    
    def _infer_type_from_old(self, node: Dict) -> str:
        """Infer asset type from old node data"""
        node_type = node.get('type', '').lower()
        path = node.get('path', '').lower()
        
        if 'frontend' in node_type or 'component' in node_type:
            return 'component.ui.react'
        elif 'backend' in node_type or 'service' in node_type or 'api' in node_type:
            return 'service.backend'
        elif 'config' in node_type:
            return 'config.schema'
        elif 'doc' in node_type or '.md' in path:
            return 'doc.markdown'
        elif 'test' in node_type:
            return 'test.e2e'
        else:
            return 'component.generic'


def migrate_all_configs(root_path: str):
    """Migrate all old configs to new format"""
    root = Path(root_path)
    count = 0
    
    print(f"🔄 Migrating configs in: {root}")
    
    for old_config in root.rglob('dev-status.config.json'):
        repo_path = old_config.parent
        print(f"  📁 {repo_path.name}...")
        
        mgr = ConfigManager(str(repo_path))
        if mgr.migrate_from_old(old_config):
            print(f"    ✓ Migrated")
            # Optionally remove old file
            # old_config.unlink()
            count += 1
        else:
            print(f"    ✗ Failed")
    
    print(f"\n✅ Migrated {count} configs")
    return count


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        # Migration mode
        if sys.argv[1] == 'migrate':
            root = sys.argv[2] if len(sys.argv) > 2 else '.'
            migrate_all_configs(root)
        else:
            # Test mode
            test_path = sys.argv[1]
            mgr = ConfigManager(test_path)
            
            if mgr.exists():
                print(f"✓ Config exists")
                print(f"Status: {mgr.get_status()}")
                
                valid, errors = mgr.validate()
                if valid:
                    print("✓ Valid")
                else:
                    print(f"✗ Validation errors:")
                    for error in errors:
                        print(f"  - {error}")
                
                analytics = mgr.get_analytics()
                print(f"\nAnalytics:")
                for key, value in analytics.items():
                    print(f"  {key}: {value}")
            else:
                print("✗ Config does not exist")

