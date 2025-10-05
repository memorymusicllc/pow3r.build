#!/usr/bin/env python3
"""
Architecture Review Workflow
Deep repository analysis to create comprehensive architecture diagrams

This workflow:
1. Reads all code files and documentation
2. Parses package dependencies
3. Identifies API endpoints and data models
4. Maps data flow and component relationships
5. Analyzes tech stack and frameworks
6. Generates detailed component descriptions
7. Creates meaningful relationship labels
8. Produces three output formats (JSON, Canvas, Mermaid)
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime
import hashlib


class ArchitectureReviewWorkflow:
    """Comprehensive repository architecture analysis workflow"""
    
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.repo_name = self.repo_path.name
        
        # Analysis results
        self.components = []
        self.relationships = []
        self.tech_stack = set()
        self.apis = []
        self.data_models = []
        self.workflows = []
        
        print(f"\n{'='*70}")
        print(f"🔍 Architecture Review Workflow: {self.repo_name}")
        print(f"{'='*70}\n")
    
    def run_workflow(self) -> Dict:
        """Execute complete analysis workflow"""
        
        # Step 1: Read README and documentation
        print("📖 Step 1: Reading documentation...")
        docs = self.read_documentation()
        
        # Step 2: Analyze package dependencies
        print("📦 Step 2: Analyzing dependencies...")
        dependencies = self.analyze_dependencies()
        
        # Step 3: Scan code structure
        print("🏗️  Step 3: Scanning code structure...")
        code_structure = self.scan_code_structure()
        
        # Step 4: Identify components
        print("🔍 Step 4: Identifying components...")
        self.identify_components(code_structure, dependencies)
        
        # Step 5: Discover APIs and endpoints
        print("🌐 Step 5: Discovering APIs...")
        self.discover_apis(code_structure)
        
        # Step 6: Find data models
        print("💾 Step 6: Finding data models...")
        self.find_data_models(code_structure)
        
        # Step 7: Map relationships
        print("🔗 Step 7: Mapping relationships...")
        self.map_relationships(dependencies, code_structure)
        
        # Step 8: Identify workflows
        print("⚡ Step 8: Identifying workflows...")
        self.identify_workflows(code_structure)
        
        # Step 9: Enhance with AI descriptions
        print("🤖 Step 9: Generating descriptions...")
        self.enhance_with_descriptions(docs)
        
        # Step 10: Generate outputs
        print("📝 Step 10: Generating outputs...")
        outputs = self.generate_all_outputs()
        
        print(f"\n✅ Workflow complete!")
        print(f"   Components: {len(self.components)}")
        print(f"   Relationships: {len(self.relationships)}")
        print(f"   APIs: {len(self.apis)}")
        print(f"   Tech Stack: {len(self.tech_stack)}")
        
        return outputs
    
    def read_documentation(self) -> Dict:
        """Read README and other documentation"""
        docs = {
            'readme': None,
            'description': None,
            'features': [],
            'purpose': None
        }
        
        # Read README
        readme_files = ['README.md', 'README', 'readme.md']
        for name in readme_files:
            readme_path = self.repo_path / name
            if readme_path.exists():
                try:
                    content = readme_path.read_text(encoding='utf-8', errors='ignore')
                    docs['readme'] = content
                    
                    # Extract description (first paragraph)
                    lines = [l.strip() for l in content.split('\n') if l.strip() and not l.startswith('#')]
                    if lines:
                        docs['description'] = lines[0][:200]
                    
                    # Extract features (look for bullet points)
                    feature_section = False
                    for line in content.split('\n'):
                        if 'feature' in line.lower() and line.startswith('#'):
                            feature_section = True
                        elif feature_section and (line.startswith('- ') or line.startswith('* ')):
                            docs['features'].append(line[2:].strip())
                        elif line.startswith('#'):
                            feature_section = False
                    
                    print(f"  ✓ README found: {len(content)} chars")
                    break
                except Exception as e:
                    print(f"  ⚠️  Error reading README: {e}")
        
        return docs
    
    def analyze_dependencies(self) -> Dict:
        """Analyze package dependencies"""
        deps = {
            'runtime': [],
            'dev': [],
            'frameworks': [],
            'languages': []
        }
        
        # package.json (Node.js/JavaScript)
        pkg = self.repo_path / 'package.json'
        if pkg.exists():
            try:
                data = json.loads(pkg.read_text())
                deps['runtime'] = list(data.get('dependencies', {}).keys())
                deps['dev'] = list(data.get('devDependencies', {}).keys())
                
                # Identify frameworks
                if 'react' in deps['runtime'] or 'react' in deps['dev']:
                    deps['frameworks'].append('React')
                    self.tech_stack.add('React')
                if 'vue' in deps['runtime']:
                    deps['frameworks'].append('Vue')
                    self.tech_stack.add('Vue')
                if 'express' in deps['runtime']:
                    deps['frameworks'].append('Express')
                    self.tech_stack.add('Express')
                if 'next' in deps['runtime']:
                    deps['frameworks'].append('Next.js')
                    self.tech_stack.add('Next.js')
                
                deps['languages'].append('JavaScript')
                if 'typescript' in deps['dev']:
                    deps['languages'].append('TypeScript')
                    self.tech_stack.add('TypeScript')
                
                print(f"  ✓ package.json: {len(deps['runtime'])} dependencies")
            except Exception as e:
                print(f"  ⚠️  Error parsing package.json: {e}")
        
        # requirements.txt (Python)
        req = self.repo_path / 'requirements.txt'
        if req.exists():
            try:
                content = req.read_text()
                for line in content.split('\n'):
                    if line.strip() and not line.startswith('#'):
                        dep = line.split('==')[0].split('>=')[0].strip()
                        deps['runtime'].append(dep)
                
                deps['languages'].append('Python')
                self.tech_stack.add('Python')
                
                # Identify Python frameworks
                if any('flask' in d.lower() for d in deps['runtime']):
                    deps['frameworks'].append('Flask')
                    self.tech_stack.add('Flask')
                if any('django' in d.lower() for d in deps['runtime']):
                    deps['frameworks'].append('Django')
                    self.tech_stack.add('Django')
                if any('fastapi' in d.lower() for d in deps['runtime']):
                    deps['frameworks'].append('FastAPI')
                    self.tech_stack.add('FastAPI')
                
                print(f"  ✓ requirements.txt: {len(deps['runtime'])} dependencies")
            except Exception as e:
                print(f"  ⚠️  Error parsing requirements.txt: {e}")
        
        return deps
    
    def scan_code_structure(self) -> Dict:
        """Scan and analyze code structure"""
        structure = {
            'directories': {},
            'files': [],
            'api_endpoints': [],
            'models': [],
            'components': [],
            'services': [],
            'configs': []
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            # Skip common excludes
            dirs[:] = [d for d in dirs if d not in [
                '.git', 'node_modules', 'venv', '__pycache__', 
                'dist', 'build', '.next', '.cache'
            ]]
            
            rel_path = Path(root).relative_to(self.repo_path)
            
            for file in files:
                file_path = Path(root) / file
                rel_file = file_path.relative_to(self.repo_path)
                
                # Categorize files
                if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    structure['files'].append(str(rel_file))
                    self.tech_stack.add('JavaScript')
                    
                    # Look for API endpoints
                    if 'api' in str(rel_file).lower() or 'route' in str(rel_file).lower():
                        endpoints = self.extract_api_endpoints(file_path)
                        structure['api_endpoints'].extend(endpoints)
                    
                    # Look for components
                    if 'component' in str(rel_file).lower() or file_path.parent.name == 'components':
                        structure['components'].append(str(rel_file))
                
                elif file.endswith('.py'):
                    structure['files'].append(str(rel_file))
                    self.tech_stack.add('Python')
                    
                    # Look for models
                    if 'model' in file.lower():
                        structure['models'].append(str(rel_file))
                
                elif file in ['package.json', 'tsconfig.json', 'vite.config.js', 'webpack.config.js']:
                    structure['configs'].append(str(rel_file))
        
        print(f"  ✓ Scanned: {len(structure['files'])} code files")
        return structure
    
    def extract_api_endpoints(self, file_path: Path) -> List[Dict]:
        """Extract API endpoints from code"""
        endpoints = []
        
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            
            # Look for Express routes
            route_patterns = [
                r"router\.(get|post|put|delete|patch)\(['\"]([^'\"]+)['\"]",
                r"app\.(get|post|put|delete|patch)\(['\"]([^'\"]+)['\"]",
                r"@(Get|Post|Put|Delete|Patch)\(['\"]([^'\"]+)['\"]",  # Decorators
            ]
            
            for pattern in route_patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    method = match.group(1).upper()
                    path = match.group(2)
                    endpoints.append({
                        'method': method,
                        'path': path,
                        'file': str(file_path.name)
                    })
        
        except Exception as e:
            pass
        
        return endpoints
    
    def identify_components(self, code_structure: Dict, dependencies: Dict):
        """Identify architectural components from code structure"""
        
        # Frontend components
        if code_structure['components']:
            self.components.append({
                'id': f'comp-frontend-{len(self.components)}',
                'name': 'Frontend UI Components',
                'type': 'component.ui',
                'category': 'Frontend',
                'description': f'React/Vue UI components ({len(code_structure["components"])} files)',
                'tech_stack': dependencies['frameworks'] + dependencies['languages'],
                'files': code_structure['components'][:5],
                'features': ['User interface', 'Interactive components', 'Responsive design'],
                'purpose': 'Provide user interface and interaction layer'
            })
        
        # API/Backend services
        if code_structure['api_endpoints']:
            unique_methods = set(ep['method'] for ep in code_structure['api_endpoints'])
            self.components.append({
                'id': f'comp-api-{len(self.components)}',
                'name': 'API Service',
                'type': 'service.backend',
                'category': 'Backend',
                'description': f'REST API with {len(code_structure["api_endpoints"])} endpoints',
                'tech_stack': list(self.tech_stack),
                'files': list(set(ep['file'] for ep in code_structure['api_endpoints']))[:5],
                'features': [f'{m} endpoints' for m in unique_methods],
                'purpose': 'Expose API endpoints for data access',
                'api_endpoints': code_structure['api_endpoints'][:10]
            })
        
        # Data models
        if code_structure['models']:
            self.components.append({
                'id': f'comp-models-{len(self.components)}',
                'name': 'Data Models',
                'type': 'data.models',
                'category': 'Data Layer',
                'description': f'Data models and schemas ({len(code_structure["models"])} files)',
                'tech_stack': dependencies['languages'],
                'files': code_structure['models'][:5],
                'features': ['Data validation', 'Schema definitions', 'ORM integration'],
                'purpose': 'Define data structures and business logic'
            })
        
        # Configuration
        if code_structure['configs']:
            self.components.append({
                'id': f'comp-config-{len(self.components)}',
                'name': 'Configuration',
                'type': 'config.schema',
                'category': 'Configuration',
                'description': f'Build and runtime configuration ({len(code_structure["configs"])} files)',
                'tech_stack': ['Config'],
                'files': code_structure['configs'],
                'features': ['Environment config', 'Build config', 'Runtime settings'],
                'purpose': 'Configure application behavior and build process'
            })
        
        # Check for specific directories
        special_dirs = {
            'public': {'type': 'component.static', 'category': 'Static Assets', 'purpose': 'Serve static files'},
            'server': {'type': 'service.backend', 'category': 'Backend', 'purpose': 'Backend server logic'},
            'functions': {'type': 'service.serverless', 'category': 'Functions', 'purpose': 'Serverless functions'},
            'database': {'type': 'data.database', 'category': 'Data', 'purpose': 'Database layer'},
            'middleware': {'type': 'service.middleware', 'category': 'Middleware', 'purpose': 'Request processing'},
            'utils': {'type': 'library.utils', 'category': 'Utilities', 'purpose': 'Utility functions'},
            'lib': {'type': 'library.shared', 'category': 'Library', 'purpose': 'Shared libraries'},
            'docs': {'type': 'doc.markdown', 'category': 'Documentation', 'purpose': 'Project documentation'},
            'tests': {'type': 'test.suite', 'category': 'Testing', 'purpose': 'Test suite'},
            'scripts': {'type': 'workflow.automation', 'category': 'Automation', 'purpose': 'Build and automation scripts'}
        }
        
        for dir_name, info in special_dirs.items():
            dir_path = self.repo_path / dir_name
            if dir_path.exists() and dir_path.is_dir():
                file_count = sum(1 for _ in dir_path.rglob('*') if _.is_file())
                
                # Check if not already added
                if not any(c['name'].lower() == dir_name for c in self.components):
                    self.components.append({
                        'id': f'comp-{dir_name}-{len(self.components)}',
                        'name': dir_name.title(),
                        'type': info['type'],
                        'category': info['category'],
                        'description': f'{info["category"]} - {file_count} files',
                        'tech_stack': list(self.tech_stack),
                        'files': [str(f.relative_to(self.repo_path)) for f in list(dir_path.rglob('*'))[:5] if f.is_file()],
                        'features': [f'{file_count} files'],
                        'purpose': info['purpose']
                    })
        
        # If no components found, create generic one
        if not self.components:
            self.components.append({
                'id': 'comp-main-0',
                'name': 'Main Application',
                'type': 'component.application',
                'category': 'Application',
                'description': f'Primary application code for {self.repo_name}',
                'tech_stack': list(self.tech_stack) or ['Unknown'],
                'files': [],
                'features': ['Core functionality'],
                'purpose': 'Main application logic'
            })
        
        print(f"  ✓ Identified {len(self.components)} components")
        return self.components
    
    def discover_apis(self, code_structure: Dict):
        """Discover API endpoints and external services"""
        
        self.apis = code_structure.get('api_endpoints', [])
        
        # Look for fetch/axios calls to external APIs
        for file_path in [self.repo_path / f for f in code_structure.get('files', [])[:50]]:
            if not file_path.exists():
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                
                # Look for API calls
                fetch_pattern = r"fetch\(['\"]([^'\"]+)['\"]"
                axios_pattern = r"axios\.(get|post|put|delete)\(['\"]([^'\"]+)['\"]"
                
                for pattern in [fetch_pattern, axios_pattern]:
                    matches = re.finditer(pattern, content)
                    for match in matches:
                        url = match.group(1) if len(match.groups()) == 1 else match.group(2)
                        if url.startswith('http') or url.startswith('/api'):
                            self.apis.append({
                                'endpoint': url,
                                'file': str(file_path.name)
                            })
            except:
                pass
        
        print(f"  ✓ Found {len(self.apis)} API references")
    
    def find_data_models(self, code_structure: Dict):
        """Find data models and schemas"""
        
        self.data_models = code_structure.get('models', [])
        
        # Look for TypeScript interfaces/types
        for file_path in [self.repo_path / f for f in code_structure.get('files', [])[:50]]:
            if not file_path.exists() or not str(file_path).endswith(('.ts', '.tsx')):
                continue
            
            try:
                content = file_path.read_text(encoding='utf-8', errors='ignore')
                
                # Find interfaces
                interface_pattern = r"interface\s+(\w+)\s*\{"
                matches = re.finditer(interface_pattern, content)
                for match in matches:
                    self.data_models.append({
                        'name': match.group(1),
                        'type': 'interface',
                        'file': str(file_path.name)
                    })
            except:
                pass
        
        print(f"  ✓ Found {len(self.data_models)} data models")
    
    def map_relationships(self, dependencies: Dict, code_structure: Dict):
        """Map relationships between components"""
        
        # Create relationship matrix
        comp_by_category = {}
        for comp in self.components:
            cat = comp['category']
            if cat not in comp_by_category:
                comp_by_category[cat] = []
            comp_by_category[cat].append(comp)
        
        # Frontend -> Backend
        if 'Frontend' in comp_by_category and 'Backend' in comp_by_category:
            for fe in comp_by_category['Frontend']:
                for be in comp_by_category['Backend']:
                    self.relationships.append({
                        'from': fe['id'],
                        'to': be['id'],
                        'type': 'dependsOn',
                        'label': 'HTTP Requests\nREST API',
                        'description': 'Frontend consumes backend API endpoints',
                        'strength': 0.9
                    })
        
        # Backend -> Data
        if 'Backend' in comp_by_category and 'Data Layer' in comp_by_category:
            for be in comp_by_category['Backend']:
                for data in comp_by_category['Data Layer']:
                    self.relationships.append({
                        'from': be['id'],
                        'to': data['id'],
                        'type': 'uses',
                        'label': 'Uses Models',
                        'description': 'Backend uses data models for business logic',
                        'strength': 0.85
                    })
        
        # Functions -> Backend
        if 'Functions' in comp_by_category and 'Backend' in comp_by_category:
            for fn in comp_by_category['Functions']:
                for be in comp_by_category['Backend']:
                    self.relationships.append({
                        'from': fn['id'],
                        'to': be['id'],
                        'type': 'implements',
                        'label': 'Implements',
                        'description': 'Serverless functions implement backend logic',
                        'strength': 0.8
                    })
        
        print(f"  ✓ Mapped {len(self.relationships)} relationships")
    
    def identify_workflows(self, code_structure: Dict):
        """Identify product and development workflows"""
        
        # User workflow (if frontend exists)
        has_frontend = any(c['category'] == 'Frontend' for c in self.components)
        has_backend = any(c['category'] == 'Backend' for c in self.components)
        
        if has_frontend and has_backend:
            frontend_id = next(c['id'] for c in self.components if c['category'] == 'Frontend')
            backend_id = next(c['id'] for c in self.components if c['category'] == 'Backend')
            
            self.workflows.append({
                'id': 'workflow-user-main',
                'type': 'workflow.user-journey',
                'name': 'Main User Journey',
                'description': 'Primary user interaction flow through the application',
                'steps': [
                    {'id': 'step-1', 'name': 'User Access', 'component': frontend_id, 'description': 'User opens application'},
                    {'id': 'step-2', 'name': 'UI Interaction', 'component': frontend_id, 'description': 'User interacts with interface'},
                    {'id': 'step-3', 'name': 'API Request', 'component': backend_id, 'description': 'Frontend calls backend API'},
                    {'id': 'step-4', 'name': 'Process & Respond', 'component': backend_id, 'description': 'Backend processes and returns data'},
                    {'id': 'step-5', 'name': 'Display Results', 'component': frontend_id, 'description': 'Frontend renders results'}
                ],
                'category': 'User Journey'
            })
        
        print(f"  ✓ Identified {len(self.workflows)} workflows")
    
    def enhance_with_descriptions(self, docs: Dict):
        """Enhance components with better descriptions from docs"""
        
        readme_desc = docs.get('description', '')
        
        for comp in self.components:
            # Enhance description if generic
            if 'files' in comp['description'] and readme_desc:
                comp['description'] = f"{comp['name']} - {readme_desc[:100]}"
            
            # Add tags
            comp['tags'] = [
                comp['category'].lower().replace(' ', '-'),
                comp['type'].split('.')[-1]
            ] + [t.lower() for t in comp.get('tech_stack', [])]
            comp['tags'] = list(set(comp['tags']))[:10]
            
            # Calculate quality score
            has_tests = any('test' in f.lower() for f in comp.get('files', []))
            has_docs = 'doc' in comp['type'].lower()
            has_config = len(comp.get('files', [])) > 0
            
            quality = 0.5
            if has_tests: quality += 0.2
            if has_docs: quality += 0.15
            if has_config: quality += 0.15
            
            comp['status'] = {
                'phase': 'orange',  # Default - will be updated from Git
                'completeness': min(0.95, 0.5 + len(comp.get('files', [])) * 0.05),
                'qualityScore': min(1.0, quality),
                'notes': f"Contains {len(comp.get('files', []))} files"
            }
        
        print(f"  ✓ Enhanced {len(self.components)} components with AI descriptions")
    
    def generate_all_outputs(self) -> Dict:
        """Generate all three output formats"""
        from comprehensive_analyzer import ComprehensiveAnalyzer
        
        # Prepare data in format expected by generators
        api_keys = {}  # Placeholder
        analyzer = ComprehensiveAnalyzer(str(self.repo_path), api_keys)
        
        # Use our discovered components and relationships
        raw_data = {
            'local': {
                'status': 'orange',
                'commits_30d': 0
            },
            'file_structure': {'directories': []}
        }
        
        # Generate outputs
        outputs = {
            'json': analyzer.generate_json(self.components + self.workflows, self.relationships, raw_data),
            'canvas': analyzer.generate_canvas(self.components + self.workflows, self.relationships),
            'mermaid': analyzer.generate_mermaid(self.components + self.workflows, self.relationships, raw_data)
        }
        
        # Save files
        analyzer.save_outputs(outputs)
        
        return outputs


def run_architecture_review(repo_path: str):
    """Run complete architecture review workflow on a repository"""
    workflow = ArchitectureReviewWorkflow(repo_path)
    return workflow.run_workflow()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python architecture_review_workflow.py <repo_path>")
        sys.exit(1)
    
    repo_path = sys.argv[1]
    outputs = run_architecture_review(repo_path)
    
    print(f"\n✅ Generated:")
    print(f"  - pow3r.config.json")
    print(f"  - pow3r.config.canvas")
    print(f"  - pow3r.config.md")
