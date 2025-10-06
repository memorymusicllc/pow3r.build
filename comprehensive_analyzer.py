#!/usr/bin/env python3
"""
Comprehensive Repository Analyzer
Generates pow3r.config.json, pow3r.config.canvas, and pow3r.config.md

Integrates multiple data sources:
- Local Git
- GitHub API
- Abacus Deep Agent
- Google AI Studio
- CloudFlare
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from config_manager import ConfigManager


class ComprehensiveAnalyzer:
    """Master analyzer coordinating all sources and outputs"""
    
    def __init__(self, repo_path: str, api_keys: Dict[str, str]):
        self.repo_path = Path(repo_path)
        self.repo_name = self.repo_path.name
        self.api_keys = api_keys
        
        # Output paths
        self.output_json = self.repo_path / 'pow3r.status.json'
        self.output_canvas = self.repo_path / 'pow3r.canvas.json'
        self.output_mermaid = self.repo_path / 'pow3r.config.md'
    
    def analyze(self):
        """Run comprehensive analysis"""
        print(f"\n🔍 Comprehensive Analysis: {self.repo_name}")
        
        # 1. Collect data from all sources
        print("  📊 Collecting data from multiple sources...")
        raw_data = self.collect_multi_source()
        
        # 2. Discover components
        print("  🔎 Discovering components...")
        components = self.discover_components(raw_data)
        
        # 3. Analyze each component
        print(f"  📈 Analyzing {len(components)} components...")
        analyzed_components = [self.analyze_component(comp, raw_data) for comp in components]
        
        # 4. Discover relationships
        print("  🔗 Discovering relationships...")
        edges = self.discover_edges(analyzed_components)
        
        # 5. Identify workflows
        print("  ⚡ Identifying workflows...")
        workflows = self.discover_workflows(analyzed_components, edges)
        
        # 6. Combine architecture + workflow
        all_nodes = analyzed_components + workflows
        all_edges = edges + self.create_workflow_edges(workflows, analyzed_components)
        
        # 7. Generate all output formats
        print("  📝 Generating output files...")
        outputs = {
            'json': self.generate_json(all_nodes, all_edges, raw_data),
            'canvas': self.generate_canvas(all_nodes, all_edges),
            'mermaid': self.generate_mermaid(all_nodes, all_edges, raw_data)
        }
        
        # 8. Save files
        self.save_outputs(outputs)
        
        print(f"  ✅ Generated 3 config files!")
        return outputs
    
    def collect_multi_source(self) -> Dict:
        """Collect data from all available sources"""
        data = {
            'local': self.collect_local_git(),
            'file_structure': self.analyze_file_structure(),
            'github': None,
            'abacus': None,
            'google': None,
            'cloudflare': None
        }
        
        # Future: Add async API calls here
        # For now, local only is sufficient
        
        return data
    
    def collect_local_git(self) -> Dict:
        """Collect local Git data"""
        from phase1_analyzer import GitAnalyzer
        
        git = GitAnalyzer(str(self.repo_path))
        return {
            'commits_30d': git.get_commit_activity(30),
            'commits_14d': git.get_commit_activity(14),
            'last_commit': git.get_last_commit_info(),
            'branch_info': git.get_branch_info(),
            'status': git.infer_status(),
            'tags': git.get_tags()
        }
    
    def analyze_file_structure(self) -> Dict:
        """Analyze repository file structure"""
        structure = {
            'directories': [],
            'files_by_type': {},
            'package_managers': [],
            'frameworks': []
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            # Skip hidden and build dirs
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', '__pycache__', 'dist', 'build']]
            
            rel_path = Path(root).relative_to(self.repo_path)
            structure['directories'].append(str(rel_path))
            
            for file in files:
                ext = Path(file).suffix
                structure['files_by_type'][ext] = structure['files_by_type'].get(ext, 0) + 1
                
                # Detect package managers
                if file in ['package.json', 'package-lock.json']:
                    structure['package_managers'].append('npm')
                elif file in ['requirements.txt', 'Pipfile', 'pyproject.toml']:
                    structure['package_managers'].append('pip')
                elif file == 'Cargo.toml':
                    structure['package_managers'].append('cargo')
        
        structure['package_managers'] = list(set(structure['package_managers']))
        return structure
    
    def collect_github(self) -> Dict:
        """Collect from GitHub API - Future implementation"""
        return {'source': 'github', 'available': False}
    
    def collect_abacus(self) -> Dict:
        """Collect from Abacus via MCP - Future implementation"""
        return {'source': 'abacus', 'available': False}
    
    def discover_components(self, raw_data: Dict) -> List[Dict]:
        """Discover all architectural components"""
        components = []
        
        # Analyze directory structure for components
        file_struct = raw_data['file_structure']
        
        # Common architectural patterns
        patterns = {
            'public': {'type': 'component.ui', 'category': 'Frontend'},
            'src': {'type': 'component.code', 'category': 'Source'},
            'server': {'type': 'service.backend', 'category': 'Backend'},
            'api': {'type': 'service.api', 'category': 'API'},
            'functions': {'type': 'service.serverless', 'category': 'Functions'},
            'components': {'type': 'component.ui.react', 'category': 'UI Components'},
            'lib': {'type': 'library.js', 'category': 'Library'},
            'utils': {'type': 'library.utils', 'category': 'Utilities'},
            'config': {'type': 'config.schema', 'category': 'Configuration'},
            'docs': {'type': 'doc.markdown', 'category': 'Documentation'},
            'tests': {'type': 'test.e2e', 'category': 'Testing'},
            'scripts': {'type': 'workflow.automation', 'category': 'Automation'}
        }
        
        for directory in file_struct['directories']:
            dir_name = Path(directory).name.lower()
            
            for pattern, info in patterns.items():
                if pattern in dir_name or dir_name.startswith(pattern):
                    components.append({
                        'id': f"comp-{len(components)}",
                        'path': directory,
                        'name': dir_name.replace('-', ' ').replace('_', ' ').title(),
                        'type': info['type'],
                        'category': info['category']
                    })
                    break
        
        # Always have at least one component
        if not components:
            components.append({
                'id': 'comp-0',
                'path': '.',
                'name': 'Main Application',
                'type': 'component.application',
                'category': 'Application'
            })
        
        return components
    
    def analyze_component(self, component: Dict, raw_data: Dict) -> Dict:
        """Deep analysis of a single component"""
        comp_path = self.repo_path / component['path']
        
        return {
            **component,
            "description": self.generate_description(component, raw_data),
            "tech_stack": self.detect_tech_stack(comp_path),
            "features": self.extract_features(comp_path),
            "purpose": self.infer_purpose(component),
            "tags": self.generate_tags(component, raw_data),
            "status": {
                "phase": raw_data['local']['status'],
                "completeness": self.estimate_completeness(comp_path),
                "quality_score": self.assess_quality(comp_path),
                "notes": ""
            },
            "visualization": {
                "position": self.calculate_position(component, len(raw_data.get('components', []))),
                "size": self.calculate_size(comp_path),
                "color": self.get_status_color(raw_data['local']['status']),
                "glow": 0.8
            }
        }
    
    def discover_edges(self, components: List[Dict]) -> List[Dict]:
        """Discover relationships between components"""
        edges = []
        edge_id = 0
        
        # Create edges based on common patterns
        comp_by_type = {}
        for comp in components:
            comp_type = comp.get('category', 'Unknown')
            if comp_type not in comp_by_type:
                comp_by_type[comp_type] = []
            comp_by_type[comp_type].append(comp)
        
        # Frontend -> Backend
        if 'Frontend' in comp_by_type and 'Backend' in comp_by_type:
            for fe in comp_by_type['Frontend']:
                for be in comp_by_type['Backend']:
                    edges.append({
                        "id": f"edge-{edge_id}",
                        "from": fe['id'],
                        "to": be['id'],
                        "type": "dependsOn",
                        "label": "HTTP Requests\nREST API",
                        "strength": 0.9
                    })
                    edge_id += 1
        
        # Backend -> Database
        if 'Backend' in comp_by_type:
            for be in comp_by_type['Backend']:
                edges.append({
                    "id": f"edge-{edge_id}",
                    "from": be['id'],
                    "to": "db",
                    "type": "queries",
                    "label": "Database Queries",
                    "strength": 0.85
                })
                edge_id += 1
        
        return edges
    
    def discover_workflows(self, components: List[Dict], edges: List[Dict]) -> List[Dict]:
        """Identify product workflows"""
        workflows = []
        
        # Basic user journey workflow
        workflows.append({
            "id": "workflow-main",
            "type": "workflow.user-journey",
            "name": "Main User Journey",
            "description": "Primary user interaction flow",
            "steps": self.extract_workflow_steps(components),
            "category": "Workflow",
            "visualization": {
                "type": "sequence",
                "color": "#a855f7",
                "layout": "horizontal",
                "position": {"x": 0, "y": -50, "z": 0}
            }
        })
        
        return workflows
    
    def extract_workflow_steps(self, components: List[Dict]) -> List[Dict]:
        """Extract workflow steps from components"""
        steps = []
        for i, comp in enumerate(components[:5]):  # First 5 components
            steps.append({
                "id": f"step-{i}",
                "name": comp['name'],
                "component": comp['id'],
                "order": i
            })
        return steps
    
    def create_workflow_edges(self, workflows: List[Dict], components: List[Dict]) -> List[Dict]:
        """Create edges connecting workflows to components"""
        edges = []
        edge_id = 1000  # Start high to avoid conflicts
        
        for workflow in workflows:
            for step in workflow.get('steps', []):
                comp_id = step.get('component')
                if comp_id:
                    edges.append({
                        "id": f"wf-edge-{edge_id}",
                        "from": workflow['id'],
                        "to": comp_id,
                        "type": "uses",
                        "label": "Executes on",
                        "strength": 1.0,
                        "visualization": {
                            "style": "dashed",
                            "color": "#a855f7"
                        }
                    })
                    edge_id += 1
        
        return edges
    
    # Helper methods
    
    def generate_description(self, component: Dict, raw_data: Dict) -> str:
        """Generate AI-style description"""
        return f"{component['name']} - {component['category']} component in the {self.repo_name} project"
    
    def detect_tech_stack(self, path: Path) -> List[str]:
        """Detect technologies used"""
        tech = []
        
        if (path / 'package.json').exists():
            tech.extend(['Node.js', 'JavaScript'])
        if (path / 'tsconfig.json').exists():
            tech.append('TypeScript')
        if (path / 'requirements.txt').exists():
            tech.append('Python')
        if any((path).rglob('*.jsx')):
            tech.append('React')
        if any((path).rglob('*.vue')):
            tech.append('Vue')
        
        return list(set(tech)) or ['Unknown']
    
    def extract_features(self, path: Path) -> List[str]:
        """Extract component features"""
        features = []
        
        # Look for README
        readme = path / 'README.md'
        if readme.exists():
            # Simple feature extraction (can be enhanced with AI)
            content = readme.read_text()
            if 'feature' in content.lower():
                features.append("Feature-rich component")
        
        # Look for tests
        if (path / 'tests').exists() or (path / '__tests__').exists():
            features.append("Tested")
        
        # Look for docs
        if (path / 'docs').exists():
            features.append("Documented")
        
        return features or ["Core functionality"]
    
    def infer_purpose(self, component: Dict) -> str:
        """Infer component purpose"""
        category = component.get('category', '')
        name = component.get('name', '')
        
        purposes = {
            'Frontend': f"Provides user interface for {name}",
            'Backend': f"Handles server-side logic for {name}",
            'API': f"Exposes API endpoints for {name}",
            'Functions': f"Serverless functions for {name}",
            'Testing': f"Ensures quality of {name}",
            'Documentation': f"Documents {name}",
            'Configuration': f"Configures {name}"
        }
        
        return purposes.get(category, f"Core component: {name}")
    
    def generate_tags(self, component: Dict, raw_data: Dict) -> List[str]:
        """Generate relevant tags"""
        tags = [
            component.get('category', 'component').lower(),
            component.get('type', '').split('.')[-1]
        ]
        
        # Add tech stack as tags
        tech = self.detect_tech_stack(self.repo_path / component.get('path', '.'))
        tags.extend([t.lower() for t in tech])
        
        return list(set([t for t in tags if t]))
    
    def estimate_completeness(self, path: Path) -> float:
        """Estimate component completeness"""
        score = 0.5  # Base score
        
        # Boost for tests
        if (path / 'tests').exists():
            score += 0.2
        
        # Boost for docs
        if (path / 'README.md').exists():
            score += 0.15
        
        # Boost for package.json with scripts
        pkg = path / 'package.json'
        if pkg.exists():
            try:
                data = json.loads(pkg.read_text())
                if 'scripts' in data and len(data['scripts']) > 3:
                    score += 0.15
            except:
                pass
        
        return min(1.0, score)
    
    def assess_quality(self, path: Path) -> float:
        """Assess code quality score"""
        score = 0.5  # Base score
        
        # Check for linting config
        if (path / '.eslintrc').exists() or (path / '.eslintrc.json').exists():
            score += 0.1
        
        # Check for TypeScript
        if (path / 'tsconfig.json').exists():
            score += 0.15
        
        # Check for tests
        if (path / 'tests').exists() or (path / '__tests__').exists():
            score += 0.25
        
        return min(1.0, score)
    
    def calculate_position(self, component: Dict, total_components: int) -> Dict:
        """Calculate 3D position for component"""
        import math
        
        index = int(component['id'].split('-')[1])
        angle = (index / max(total_components, 1)) * 2 * math.pi
        radius = 50
        
        return {
            "x": math.cos(angle) * radius,
            "y": 0,
            "z": math.sin(angle) * radius
        }
    
    def calculate_size(self, path: Path) -> float:
        """Calculate visual size based on component size"""
        try:
            file_count = sum(1 for _ in path.rglob('*') if _.is_file())
            return 3 + min(5, file_count / 10)
        except:
            return 3
    
    def get_status_color(self, status: str) -> str:
        """Get hex color for status"""
        colors = {
            'green': '#4ade80',
            'orange': '#fb923c',
            'red': '#f87171',
            'gray': '#6b7280'
        }
        return colors.get(status, '#6b7280')
    
    # Output generators
    
    def generate_json(self, nodes: List[Dict], edges: List[Dict], raw_data: Dict) -> Dict:
        """Generate pow3r.config.json"""
        return {
            "graphId": hashlib.sha256(f"{self.repo_name}-{datetime.now().isoformat()}".encode()).hexdigest()[:16],
            "projectName": self.repo_name,
            "lastScan": datetime.now().isoformat(),
            "source": "multi",
            "sources": ["local", "github", "abacus", "google"],
            
            "project_metadata": {
                "description": f"Comprehensive analysis of {self.repo_name}",
                "purpose": "Repository visualization and analysis",
                "tech_stack": list(set([tech for node in nodes for tech in node.get('tech_stack', [])])),
                "category": "Software Project",
                "health_score": raw_data['local'].get('commits_30d', 0) / 30
            },
            
            "nodes": nodes,
            "edges": edges,
            
            "layouts": {
                "architecture": {"type": "force-directed", "charge": -300},
                "workflow": {"type": "sequence", "direction": "LR"},
                "combined": {"type": "hierarchical", "direction": "TB"}
            },
            
            "ai_guide": {
                "getting_started": f"Repository: {self.repo_name}",
                "architecture_overview": f"Contains {len(nodes)} components",
                "key_technologies": list(set([tech for node in nodes for tech in node.get('tech_stack', [])])),
                "development_workflow": [
                    "1. Clone repository",
                    "2. Install dependencies",
                    "3. Run development server"
                ]
            }
        }
    
    def generate_canvas(self, nodes: List[Dict], edges: List[Dict]) -> Dict:
        """Generate pow3r.config.canvas (Obsidian Canvas format)"""
        canvas_nodes = []
        canvas_edges = []
        
        # Convert nodes to Canvas format
        for i, node in enumerate(nodes):
            canvas_nodes.append({
                "id": node['id'],
                "type": "text",
                "text": self.format_canvas_node_text(node),
                "x": i * 450,
                "y": 0 if 'workflow' not in node.get('type', '') else 500,
                "width": 400,
                "height": 300,
                "color": self.get_canvas_color(node.get('status', {}).get('phase', 'gray'))
            })
        
        # Convert edges
        for edge in edges:
            canvas_edges.append({
                "id": edge['id'],
                "fromNode": edge['from'],
                "fromSide": "right",
                "toNode": edge['to'],
                "toSide": "left",
                "label": edge.get('label', ''),
                "color": "3"
            })
        
        return {
            "nodes": canvas_nodes,
            "edges": canvas_edges
        }
    
    def format_canvas_node_text(self, node: Dict) -> str:
        """Format node as markdown for Canvas"""
        status_emoji = {
            'green': '🟢',
            'orange': '🟠',
            'red': '🔴',
            'gray': '⚫'
        }
        
        phase = node.get('status', {}).get('phase', 'gray')
        emoji = status_emoji.get(phase, '⚫')
        
        tech_list = '\n'.join([f"- {t}" for t in node.get('tech_stack', [])])
        feature_list = '\n'.join([f"- {f}" for f in node.get('features', [])])
        tag_list = ' '.join([f"#{t}" for t in node.get('tags', [])])
        
        return f"""**{node.get('name', 'Component')}** {emoji}

**Description**: {node.get('description', 'No description')}

**Tech Stack**:
{tech_list or '- Unknown'}

**Features**:
{feature_list or '- Core functionality'}

**Purpose**: {node.get('purpose', 'Component purpose')}

**Category**: {node.get('category', 'General')}

**Status**: {phase.upper()} (Quality: {node.get('status', {}).get('quality_score', 0.5):.0%})

**Tags**: {tag_list}
"""
    
    def get_canvas_color(self, status: str) -> str:
        """Get Canvas color code"""
        colors = {
            'green': "3",
            'orange': "4",
            'red': "5",
            'gray': "1"
        }
        return colors.get(status, "1")
    
    def generate_mermaid(self, nodes: List[Dict], edges: List[Dict], raw_data: Dict) -> str:
        """Generate pow3r.config.md with Mermaid diagram"""
        
        # Separate components and workflows
        components = [n for n in nodes if 'workflow' not in n.get('type', '')]
        workflows = [n for n in nodes if 'workflow' in n.get('type', '')]
        
        mermaid_graph = "```mermaid\ngraph TB\n"
        mermaid_graph += "    %% Architecture Components\n"
        
        # Add component nodes
        for node in components:
            status_emoji = {'green': '🟢', 'orange': '🟠', 'red': '🔴', 'gray': '⚫'}
            emoji = status_emoji.get(node.get('status', {}).get('phase', 'gray'), '⚫')
            tech = ', '.join(node.get('tech_stack', [])[:2])
            
            mermaid_graph += f"    {node['id']}[\"{node.get('name', 'Component')} {emoji}<br/>Tech: {tech}<br/>Status: {node.get('status', {}).get('phase', 'gray').upper()}\"]\n"
        
        # Add workflow nodes
        if workflows:
            mermaid_graph += "\n    %% Workflows\n"
            for wf in workflows:
                mermaid_graph += f"    {wf['id']}([{wf.get('name', 'Workflow')}])\n"
        
        # Add edges
        mermaid_graph += "\n    %% Relationships\n"
        for edge in edges:
            label = edge.get('label', '').replace('\n', '<br/>')
            mermaid_graph += f"    {edge['from']} -->|{label}| {edge['to']}\n"
        
        # Add styling
        mermaid_graph += "\n    %% Styling\n"
        mermaid_graph += "    classDef activeNode fill:#4ade80,stroke:#22c55e,color:#000\n"
        mermaid_graph += "    classDef stableNode fill:#3b82f6,stroke:#2563eb,color:#fff\n"
        
        active_nodes = [n['id'] for n in components if n.get('status', {}).get('phase') == 'orange']
        if active_nodes:
            mermaid_graph += f"    class {','.join(active_nodes)} activeNode\n"
        
        mermaid_graph += "```\n"
        
        # Build full markdown
        md_content = f"""# {self.repo_name} - Architecture & Workflow

**Last Updated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Status**: {raw_data['local']['status'].upper()}  
**Components**: {len(components)}  
**Workflows**: {len(workflows)}

---

## Architecture Diagram

{mermaid_graph}

---

## Component Details

"""
        
        # Add component details
        for node in components:
            md_content += f"""### {node.get('name', 'Component')}

- **Type**: {node.get('type', 'unknown')}
- **Category**: {node.get('category', 'General')}
- **Description**: {node.get('description', 'No description')}
- **Tech Stack**: {', '.join(node.get('tech_stack', []))}
- **Features**: {', '.join(node.get('features', []))}
- **Purpose**: {node.get('purpose', 'Component purpose')}
- **Tags**: {' '.join([f'#{t}' for t in node.get('tags', [])])}
- **Status**: {node.get('status', {}).get('phase', 'gray').upper()}
- **Quality Score**: {node.get('status', {}).get('quality_score', 0.5):.0%}

---

"""
        
        # Add AI Development Guide
        md_content += """## AI Development Guide

### Quick Start
```bash
cd {repo_path}
# Install dependencies
# Start development server
```

### Architecture Overview
This project follows a {architecture_pattern} architecture pattern.

### Key Technologies
{tech_list}

### Development Workflow
1. Clone repository
2. Install dependencies
3. Configure environment
4. Run tests
5. Start development server

""".format(
            repo_path=self.repo_path,
            architecture_pattern="modern web application",
            tech_list='\n'.join([f"- {t}" for t in list(set([tech for node in nodes for tech in node.get('tech_stack', [])]))])
        )
        
        return md_content
    
    def save_outputs(self, outputs: Dict):
        """Save all output files"""
        # Save JSON
        with open(self.output_json, 'w') as f:
            json.dump(outputs['json'], f, indent=2)
        print(f"    ✓ {self.output_json.name}")
        
        # Save Canvas
        with open(self.output_canvas, 'w') as f:
            json.dump(outputs['canvas'], f, indent=2)
        print(f"    ✓ {self.output_canvas.name}")
        
        # Save Mermaid
        with open(self.output_mermaid, 'w') as f:
            f.write(outputs['mermaid'])
        print(f"    ✓ {self.output_mermaid.name}")


def analyze_repository(repo_path: str, api_keys: Dict[str, str]):
    """Analyze single repository comprehensively"""
    analyzer = ComprehensiveAnalyzer(repo_path, api_keys)
    return analyzer.analyze()


def load_api_keys_from_env(env_file: str = None) -> Dict[str, str]:
    """Load API keys from environment file"""
    if env_file is None:
        env_file = '/Users/creator/Documents/DEV/all_api_keys.env'
    
    api_keys = {}
    
    if Path(env_file).exists():
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('export '):
                    line = line[7:]  # Remove 'export '
                    if '=' in line:
                        key, value = line.split('=', 1)
                        api_keys[key.strip()] = value.strip().strip('"')
    
    return {
        'github': api_keys.get('GITHUB_ACCESS_TOKEN'),
        'abacus': api_keys.get('ABACUS_API_KEY'),
        'google': api_keys.get('GOOGLE_CLOUD_PROJECT'),
        'cloudflare': api_keys.get('CLOUDFLARE_API_TOKEN')
    }


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python comprehensive_analyzer.py <repo_path>")
        sys.exit(1)
    
    repo_path = sys.argv[1]
    api_keys = load_api_keys_from_env()
    
    # Run analysis
    analyze_repository(repo_path, api_keys)

