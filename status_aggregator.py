#!/usr/bin/env python3
"""
Status Aggregator
Collects all pow3r.v3.status.json files and creates a unified config for 3D visualization
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict


class StatusAggregator:
    """Aggregate multiple pow3r.v3.status.json files into one config"""
    
    def __init__(self, status_dirs: List[str], output_file: str = './public/pow3r.v3.status.json'):
        self.status_dirs = [Path(d) for d in status_dirs]
        self.output_file = Path(output_file)
        self.all_configs = []
    
    def aggregate(self):
        """Aggregate all status files"""
        print(f"\n📊 Aggregating status files...")
        
        # Load all status files
        for status_dir in self.status_dirs:
            if not status_dir.exists():
                print(f"⚠️  Directory not found: {status_dir}")
                continue
            
            print(f"\n📂 Scanning: {status_dir}")
            status_files = list(status_dir.glob('*.pow3r.v3.status.json'))
            
            for status_file in status_files:
                try:
                    with open(status_file, 'r') as f:
                        config = json.load(f)
                        self.all_configs.append({
                            'file': status_file.name,
                            'config': config
                        })
                        print(f"  ✓ Loaded: {status_file.name}")
                except Exception as e:
                    print(f"  ❌ Error loading {status_file.name}: {e}")
        
        print(f"\n✓ Loaded {len(self.all_configs)} configurations")
        
        # Create unified config
        unified = self.create_unified_config()
        
        # Save to output
        self.save_config(unified)
        
        return unified
    
    def create_unified_config(self) -> Dict:
        """Create unified configuration from all configs"""
        
        all_nodes = []
        all_edges = []
        node_positions = {}
        
        # Track statistics
        total_commits = 0
        status_counts = {'green': 0, 'orange': 0, 'red': 0, 'gray': 0}
        
        # Process each config
        for idx, item in enumerate(self.all_configs):
            config = item['config']
            project_name = config.get('projectName', f'Project-{idx}')
            
            # Position projects in a grid
            grid_size = int(len(self.all_configs) ** 0.5) + 1
            x = (idx % grid_size) * 200 - (grid_size * 100)
            z = (idx // grid_size) * 200 - (grid_size * 100)
            
            # Create project node
            project_node = {
                "id": f"project-{idx}",
                "name": project_name,
                "type": "service.repository",
                "category": "Repository",
                "description": config.get('metadata', {}).get('description', f"{project_name} repository"),
                "status": config.get('status', 'gray'),
                "fileType": "service.repository",
                "tags": config.get('metadata', {}).get('topics', []),
                "metadata": {
                    "nodeId": f"project-{idx}",
                    "category": "Repository",
                    "type": "service",
                    "source": config.get('source', 'unknown'),
                    "repositoryPath": config.get('repositoryPath', ''),
                    "branch": config.get('branch', 'main')
                },
                "stats": config.get('stats', {}),
                "position": {
                    "x": x,
                    "y": 0,
                    "z": z
                }
            }
            
            all_nodes.append(project_node)
            node_positions[project_name] = (x, z)
            
            # Track stats
            status = config.get('status', 'gray')
            status_counts[status] = status_counts.get(status, 0) + 1
            
            stats = config.get('stats', {})
            total_commits += stats.get('totalCommitsLast30Days', 0)
            
            # Add component nodes from this config
            for node in config.get('nodes', []):
                # Offset component positions relative to project
                pos = node.get('position', {'x': 0, 'y': 0, 'z': 0})
                node['position'] = {
                    'x': x + pos['x'] * 0.3,
                    'y': pos.get('y', 0),
                    'z': z + pos['z'] * 0.3
                }
                
                # Prefix node ID to avoid conflicts
                original_id = node['id']
                node['id'] = f"{project_name}-{original_id}"
                
                # Update parent reference
                node['metadata']['parent'] = f"project-{idx}"
                
                all_nodes.append(node)
            
            # Add edges from this config
            for edge in config.get('edges', []):
                # Prefix edge IDs and node references
                edge['id'] = f"{project_name}-{edge['id']}"
                edge['from'] = f"{project_name}-{edge['from']}"
                edge['to'] = f"{project_name}-{edge['to']}"
                
                all_edges.append(edge)
        
        # Create inter-project edges based on shared topics/languages
        inter_edges = self.create_inter_project_edges(all_nodes)
        all_edges.extend(inter_edges)
        
        # Create unified config
        unified = {
            "graphId": hashlib.sha256(f"unified-{datetime.now().isoformat()}".encode()).hexdigest()[:16],
            "projectName": "Unified Repository Network",
            "lastUpdate": datetime.now().isoformat(),
            "source": "aggregated",
            "totalProjects": len(self.all_configs),
            
            "stats": {
                "totalNodes": len(all_nodes),
                "totalEdges": len(all_edges),
                "totalCommitsLast30Days": total_commits,
                "statusCounts": status_counts
            },
            
            "nodes": all_nodes,
            "edges": all_edges,
            
            "metadata": {
                "version": "2.0",
                "configType": "unified",
                "created": datetime.now().isoformat(),
                "description": "Unified visualization of all repositories",
                "sources": [c['file'] for c in self.all_configs]
            }
        }
        
        return unified
    
    def create_inter_project_edges(self, nodes: List[Dict]) -> List[Dict]:
        """Create edges between related projects based on topics/languages"""
        edges = []
        edge_id = 0
        
        # Get all project nodes
        projects = [n for n in nodes if n['type'] == 'service.repository']
        
        # Create edges based on shared topics
        for i, proj1 in enumerate(projects):
            tags1 = set(proj1.get('tags', []))
            lang1 = proj1.get('metadata', {}).get('language', '')
            
            for proj2 in projects[i+1:]:
                tags2 = set(proj2.get('tags', []))
                lang2 = proj2.get('metadata', {}).get('language', '')
                
                # Shared topics
                shared_topics = tags1 & tags2
                
                if shared_topics:
                    edges.append({
                        "id": f"inter-edge-{edge_id}",
                        "from": proj1['id'],
                        "to": proj2['id'],
                        "type": "relatedTo",
                        "label": f"Shared: {', '.join(list(shared_topics)[:2])}",
                        "strength": 0.3,
                        "metadata": {
                            "edgeId": f"inter-edge-{edge_id}",
                            "type": "relatedTo",
                            "reason": "shared_topics"
                        }
                    })
                    edge_id += 1
                
                # Same language
                if lang1 and lang2 and lang1 == lang2 and not shared_topics:
                    edges.append({
                        "id": f"inter-edge-{edge_id}",
                        "from": proj1['id'],
                        "to": proj2['id'],
                        "type": "relatedTo",
                        "label": f"Same language: {lang1}",
                        "strength": 0.2,
                        "metadata": {
                            "edgeId": f"inter-edge-{edge_id}",
                            "type": "relatedTo",
                            "reason": "same_language"
                        }
                    })
                    edge_id += 1
        
        return edges
    
    def save_config(self, config: Dict):
        """Save unified config to file"""
        # Ensure output directory exists
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.output_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"\n✨ Unified config saved: {self.output_file}")
        print(f"   Total nodes: {len(config['nodes'])}")
        print(f"   Total edges: {len(config['edges'])}")
        print(f"   Total projects: {config['totalProjects']}")
        print(f"\n📊 Status distribution:")
        for status, count in config['stats']['statusCounts'].items():
            print(f"   {status}: {count}")


def main():
    import sys
    
    # Default directories to scan
    default_dirs = [
        './github-status',      # From GitHub scanner
        './local-status',       # From local analyzer
        '.'                     # Current directory
    ]
    
    # Allow custom directories from command line
    if len(sys.argv) > 1:
        dirs = sys.argv[1:]
    else:
        dirs = default_dirs
    
    # Output file
    output = './public/pow3r.v3.status.json'
    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        if idx + 1 < len(sys.argv):
            output = sys.argv[idx + 1]
            dirs = [d for d in dirs if d not in ['--output', output]]
    
    print("\n" + "=" * 70)
    print("🔗 Status Aggregator")
    print("=" * 70)
    print(f"Scanning directories:")
    for d in dirs:
        print(f"  - {d}")
    print(f"Output: {output}")
    print("=" * 70)
    
    # Create aggregator
    aggregator = StatusAggregator(dirs, output)
    
    # Aggregate all configs
    unified = aggregator.aggregate()
    
    print("\n" + "=" * 70)
    print("✅ AGGREGATION COMPLETE")
    print("=" * 70)
    print(f"\nThe unified config has been generated at: {output}")
    print("You can now view it in the 3D visualization!")
    print("\n" + "=" * 70 + "\n")


if __name__ == '__main__':
    main()
