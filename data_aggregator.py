#!/usr/bin/env python3
"""
Data Aggregator for Pow3r.build
Collects all power.status.json files and serves them for the 3D visualization
"""

import os
import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import hashlib


class DataAggregator:
    """Aggregates power.status.json files from multiple sources"""
    
    def __init__(self):
        self.sources = {
            'local': './pow3r.status.json',
            'github': './github-repos',
            'workspace': '/workspace'
        }
        
    def collect_all_status_files(self) -> List[Dict]:
        """Collect all power.status.json files from various sources"""
        all_projects = []
        
        # Scan each source directory
        for source_name, source_path in self.sources.items():
            path = Path(source_path)
            if not path.exists():
                continue
                
            # Find all power.status.json files
            status_files = list(path.glob('**/power.status.json'))
            status_files.extend(list(path.glob('**/pow3r.status.json')))
            status_files.extend(list(path.glob('**/pow3r.status.config.json')))
            
            for status_file in status_files:
                try:
                    with open(status_file, 'r') as f:
                        data = json.load(f)
                        
                    # Extract project info
                    project_name = status_file.parent.name
                    if project_name in ['.', 'docs', 'public']:
                        project_name = 'pow3r-build'
                        
                    project = self.format_project_data(
                        project_name, data, source_name, str(status_file)
                    )
                    all_projects.append(project)
                    
                except Exception as e:
                    print(f"⚠️  Error reading {status_file}: {e}")
                    
        return all_projects
    
    def format_project_data(self, name: str, power_status: Dict, 
                           source: str, file_path: str) -> Dict:
        """Format project data for 3D visualization"""
        # Extract nodes and edges
        nodes = []
        edges = []
        
        # Process assets as nodes
        for asset in power_status.get('assets', []):
            node = {
                'id': asset['id'],
                'name': asset['metadata'].get('title', 'Unknown'),
                'type': self.map_asset_type(asset['type']),
                'status': asset['status']['phase'],
                'size': self.calculate_node_size(asset),
                'activity': asset['analytics'].get('activityLast30Days', 0),
                'centrality': asset['analytics'].get('centralityScore', 0.5),
                'metadata': {
                    'description': asset['metadata'].get('description', ''),
                    'tags': asset['metadata'].get('tags', []),
                    'location': asset.get('location', ''),
                    'qualityScore': asset['status'].get('qualityScore', 0.7),
                    'completeness': asset['status'].get('completeness', 0.8),
                    'notes': asset['status'].get('notes', '')
                }
            }
            nodes.append(node)
            
        # Process relationships as edges
        for edge in power_status.get('edges', []):
            edges.append({
                'source': edge['from'],
                'target': edge['to'],
                'type': edge['type'],
                'strength': edge.get('strength', 0.5)
            })
            
        # Calculate project metrics
        total_activity = sum(n['activity'] for n in nodes)
        avg_quality = sum(n['metadata']['qualityScore'] for n in nodes) / len(nodes) if nodes else 0
        
        # Determine project status
        status_counts = {}
        for node in nodes:
            status = node['status']
            status_counts[status] = status_counts.get(status, 0) + 1
            
        project_status = 'green'
        if status_counts.get('red', 0) > 0:
            project_status = 'red'
        elif status_counts.get('orange', 0) > len(nodes) * 0.3:
            project_status = 'orange'
        elif status_counts.get('gray', 0) > len(nodes) * 0.5:
            project_status = 'gray'
            
        return {
            'name': name,
            'description': f"{source.title()} repository with {len(nodes)} components",
            'source': source,
            'filePath': file_path,
            'lastScan': power_status.get('lastScan', datetime.utcnow().isoformat() + 'Z'),
            'status': project_status,
            'metrics': {
                'nodeCount': len(nodes),
                'edgeCount': len(edges),
                'totalActivity': total_activity,
                'avgQuality': round(avg_quality, 2),
                'statusBreakdown': status_counts
            },
            'nodes': nodes,
            'edges': edges
        }
    
    def map_asset_type(self, asset_type: str) -> str:
        """Map power.status asset types to visualization node types"""
        type_mapping = {
            'component.ui.react': 'ui',
            'component.ui.3d': '3d',
            'service.backend': 'service',
            'config.schema': 'config',
            'doc.markdown': 'doc',
            'plugin.obsidian': 'plugin',
            'agent.abacus': 'ai',
            'library.js': 'lib',
            'workflow.ci-cd': 'workflow',
            'test.e2e': 'test',
            'knowledge.particle': 'knowledge'
        }
        return type_mapping.get(asset_type, 'file')
    
    def calculate_node_size(self, asset: Dict) -> float:
        """Calculate node size based on importance metrics"""
        base_size = 8
        
        # Factor in centrality
        centrality = asset['analytics'].get('centralityScore', 0.5)
        size = base_size * (0.5 + centrality)
        
        # Factor in activity
        activity = asset['analytics'].get('activityLast30Days', 0)
        if activity > 10:
            size *= 1.5
        elif activity > 5:
            size *= 1.2
            
        # Factor in connectivity
        connectivity = asset['analytics'].get('connectivity', 0)
        if connectivity > 10:
            size *= 1.3
        elif connectivity > 5:
            size *= 1.1
            
        return round(size, 1)
    
    def generate_visualization_data(self, output_path: str = './public/data.json'):
        """Generate data.json for 3D visualization"""
        print("📊 Aggregating power.status.json files...")
        
        # Collect all projects
        projects = self.collect_all_status_files()
        
        if not projects:
            print("⚠️  No power.status.json files found!")
            return
            
        # Create visualization data structure
        viz_data = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'summary': {
                'totalProjects': len(projects),
                'totalNodes': sum(p['metrics']['nodeCount'] for p in projects),
                'totalEdges': sum(p['metrics']['edgeCount'] for p in projects),
                'sources': list(set(p['source'] for p in projects))
            },
            'projects': projects
        }
        
        # Save to file
        output = Path(output_path)
        output.parent.mkdir(exist_ok=True)
        
        with open(output, 'w') as f:
            json.dump(viz_data, f, indent=2)
            
        print(f"✅ Generated visualization data:")
        print(f"   - Projects: {viz_data['summary']['totalProjects']}")
        print(f"   - Total Nodes: {viz_data['summary']['totalNodes']}")
        print(f"   - Total Edges: {viz_data['summary']['totalEdges']}")
        print(f"   - Output: {output_path}")
        
        return viz_data
    
    def watch_for_changes(self, interval: int = 60):
        """Watch for changes in power.status.json files"""
        import time
        
        print(f"👁️  Watching for changes every {interval} seconds...")
        
        last_data_hash = None
        
        while True:
            try:
                # Generate new data
                data = self.generate_visualization_data()
                
                # Check if data changed
                data_str = json.dumps(data, sort_keys=True)
                data_hash = hashlib.sha256(data_str.encode()).hexdigest()
                
                if data_hash != last_data_hash:
                    print(f"🔄 Data updated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                    last_data_hash = data_hash
                    
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n👋 Stopping watcher...")
                break
            except Exception as e:
                print(f"❌ Error during watch: {e}")
                time.sleep(interval)


def main():
    """CLI interface for data aggregator"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Aggregate power.status.json files for visualization')
    parser.add_argument('--output', default='./public/data.json', 
                       help='Output path for visualization data (default: ./public/data.json)')
    parser.add_argument('--watch', action='store_true', 
                       help='Watch for changes and auto-update')
    parser.add_argument('--interval', type=int, default=60,
                       help='Watch interval in seconds (default: 60)')
    
    args = parser.parse_args()
    
    aggregator = DataAggregator()
    
    if args.watch:
        aggregator.watch_for_changes(args.interval)
    else:
        aggregator.generate_visualization_data(args.output)


if __name__ == '__main__':
    main()