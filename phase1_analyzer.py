#!/usr/bin/env python3
"""
Local Repository Analysis & Generation Tool (CLI)
Phase 1: Repository Analysis & Data Generation

This module analyzes selected repositories using local Git commands,
determines development status, performs static code analysis,
and generates dev-status.config.json files.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class GitAnalyzer:
    """Analyzes Git repository commit history and status"""
    
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        
    def get_commit_activity(self, days: int = 30) -> int:
        """Get number of commits in the last N days"""
        try:
            since_date = datetime.now() - timedelta(days=days)
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'log', 
                 f'--since={since_date.isoformat()}', '--oneline'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                return len(result.stdout.strip().split('\n')) if result.stdout.strip() else 0
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not get commit activity: {e}{Colors.ENDC}")
        return 0
    
    def get_last_commit_info(self) -> Dict:
        """Get information about the last commit"""
        info = {}
        try:
            # Get last commit date (ISO format)
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'log', '-1', '--format=%cI'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['date'] = result.stdout.strip()
            
            # Get last commit message
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'log', '-1', '--format=%s'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['message'] = result.stdout.strip()
                
            # Get last commit author
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'log', '-1', '--format=%an'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['author'] = result.stdout.strip()
                
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not get commit info: {e}{Colors.ENDC}")
        
        return info
    
    def get_branch_info(self) -> Dict:
        """Get information about branches"""
        info = {'current': 'unknown', 'all': [], 'unmerged_hotfixes': []}
        try:
            # Current branch
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'rev-parse', '--abbrev-ref', 'HEAD'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['current'] = result.stdout.strip()
            
            # All branches
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'branch', '-a'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                branches = [b.strip().replace('* ', '') for b in result.stdout.split('\n') if b.strip()]
                info['all'] = branches
                
                # Check for unmerged hotfix/bugfix branches
                for branch in branches:
                    if 'hotfix/' in branch or 'bugfix/' in branch:
                        info['unmerged_hotfixes'].append(branch)
                        
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not get branch info: {e}{Colors.ENDC}")
        
        return info
    
    def get_working_tree_status(self) -> Dict:
        """Check if working tree is clean"""
        status = {'clean': True, 'modified': 0, 'untracked': 0}
        try:
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'status', '--porcelain'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
                status['clean'] = len(lines) == 0
                status['modified'] = sum(1 for line in lines if line.startswith(' M') or line.startswith('M '))
                status['untracked'] = sum(1 for line in lines if line.startswith('??'))
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not get working tree status: {e}{Colors.ENDC}")
        
        return status
    
    def get_tags(self) -> List[str]:
        """Get list of tags, most recent first"""
        tags = []
        try:
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'tag', '--sort=-creatordate'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                tags = [t.strip() for t in result.stdout.split('\n') if t.strip()]
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not get tags: {e}{Colors.ENDC}")
        
        return tags
    
    def infer_status(self) -> str:
        """
        Infer repository development status based on Git activity
        Returns: 'green' (Stable), 'orange' (Active), 'red' (Blocked/Stale), 'gray' (Archived)
        """
        # Get commit activity
        commits_14_days = self.get_commit_activity(14)
        commits_30_days = self.get_commit_activity(30)
        commits_180_days = self.get_commit_activity(180)
        
        # Get working tree status
        tree_status = self.get_working_tree_status()
        
        # Get branch info
        branch_info = self.get_branch_info()
        
        # Get last commit info
        last_commit = self.get_last_commit_info()
        
        # Get tags
        tags = self.get_tags()
        
        # GRAY (Archived): No commits in 180 days
        if commits_180_days == 0:
            return 'gray'
        
        # RED (Blocked/Stale): Few commits in 30 days OR unmerged hotfix branches
        if commits_30_days <= 2 or len(branch_info['unmerged_hotfixes']) > 0:
            # Unless it's just stable/maintenance
            if not tree_status['clean'] or len(branch_info['unmerged_hotfixes']) > 0:
                return 'red'
        
        # GREEN (Stable): Clean tree + maintenance commits + recent tag
        if tree_status['clean'] and last_commit.get('message'):
            msg = last_commit['message'].lower()
            is_maintenance = any(prefix in msg for prefix in ['docs:', 'doc:', 'refactor:', 'chore:', 'style:', 'test:'])
            has_recent_tag = len(tags) > 0  # Has any tags
            
            if is_maintenance and has_recent_tag and commits_14_days < 5:
                return 'green'
        
        # ORANGE (Active Development): Consistent activity in last 14 days
        if commits_14_days >= 1:
            return 'orange'
        
        # Default to RED if uncertain
        return 'red'


class CodeAnalyzer:
    """Performs static code analysis to identify architecture"""
    
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.language_extensions = {
            'python': ['.py'],
            'javascript': ['.js', '.jsx', '.ts', '.tsx'],
            'java': ['.java'],
            'csharp': ['.cs'],
            'go': ['.go'],
            'rust': ['.rs'],
            'ruby': ['.rb'],
            'php': ['.php'],
            'cpp': ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
        }
        
    def detect_primary_language(self) -> str:
        """Detect the primary programming language"""
        lang_counts = defaultdict(int)
        
        try:
            for dirpath, dirnames, filenames in os.walk(self.repo_path):
                # Skip common non-source directories
                dirnames[:] = [d for d in dirnames if d not in ['.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', 'target']]
                
                for filename in filenames:
                    ext = Path(filename).suffix.lower()
                    for lang, extensions in self.language_extensions.items():
                        if ext in extensions:
                            lang_counts[lang] += 1
                            break
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not detect language: {e}{Colors.ENDC}")
        
        if not lang_counts:
            return 'unknown'
        
        return max(lang_counts.items(), key=lambda x: x[1])[0]
    
    def find_package_files(self) -> List[str]:
        """Find package/dependency management files"""
        package_files = []
        package_patterns = [
            'package.json', 'requirements.txt', 'Pipfile', 'pyproject.toml',
            'pom.xml', 'build.gradle', 'Cargo.toml', 'go.mod', 
            'composer.json', 'Gemfile', '*.csproj', '*.sln'
        ]
        
        try:
            for pattern in package_patterns:
                for file_path in self.repo_path.rglob(pattern):
                    if '.git' not in str(file_path):
                        package_files.append(str(file_path.relative_to(self.repo_path)))
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not find package files: {e}{Colors.ENDC}")
        
        return package_files
    
    def identify_architecture_nodes(self) -> List[Dict]:
        """Identify major architectural components (nodes)"""
        nodes = []
        language = self.detect_primary_language()
        
        # Heuristic: Look for major directories that likely represent components
        try:
            top_level_dirs = [d for d in self.repo_path.iterdir() 
                            if d.is_dir() and d.name not in ['.git', 'node_modules', 'venv', '__pycache__', '.vscode', '.idea']]
            
            # Common architectural patterns
            architectural_patterns = {
                'api': 'API Layer',
                'backend': 'Backend Service',
                'frontend': 'Frontend Application',
                'src': 'Source Code',
                'lib': 'Library',
                'core': 'Core Module',
                'services': 'Services Layer',
                'models': 'Data Models',
                'controllers': 'Controllers',
                'views': 'Views',
                'components': 'Components',
                'utils': 'Utilities',
                'config': 'Configuration',
                'database': 'Database Layer',
                'db': 'Database',
                'middleware': 'Middleware',
                'routes': 'Routes',
                'handlers': 'Handlers',
                'workers': 'Background Workers',
                'tests': 'Test Suite',
                'docs': 'Documentation',
            }
            
            node_id_counter = 1
            
            # Check for monorepo packages (common in JavaScript/TypeScript)
            packages_dir = self.repo_path / 'packages'
            apps_dir = self.repo_path / 'apps'
            
            if packages_dir.exists() and packages_dir.is_dir():
                for package in packages_dir.iterdir():
                    if package.is_dir():
                        nodes.append({
                            'id': f'node-{node_id_counter}',
                            'title': f'Package: {package.name}',
                            'type': 'package',
                            'path': str(package.relative_to(self.repo_path))
                        })
                        node_id_counter += 1
            
            if apps_dir.exists() and apps_dir.is_dir():
                for app in apps_dir.iterdir():
                    if app.is_dir():
                        nodes.append({
                            'id': f'node-{node_id_counter}',
                            'title': f'App: {app.name}',
                            'type': 'application',
                            'path': str(app.relative_to(self.repo_path))
                        })
                        node_id_counter += 1
            
            # Add nodes based on top-level directories
            for directory in top_level_dirs:
                dir_name_lower = directory.name.lower()
                
                # Match against architectural patterns
                for pattern, title_suffix in architectural_patterns.items():
                    if pattern in dir_name_lower:
                        nodes.append({
                            'id': f'node-{node_id_counter}',
                            'title': title_suffix,
                            'type': pattern,
                            'path': str(directory.relative_to(self.repo_path))
                        })
                        node_id_counter += 1
                        break
            
            # If no nodes found, create a generic "Main Application" node
            if not nodes:
                nodes.append({
                    'id': 'node-1',
                    'title': 'Main Application',
                    'type': 'application',
                    'path': '.'
                })
                
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not identify architecture: {e}{Colors.ENDC}")
            # Fallback: single node
            nodes.append({
                'id': 'node-1',
                'title': 'Main Application',
                'type': 'application',
                'path': '.'
            })
        
        return nodes
    
    def identify_architecture_edges(self, nodes: List[Dict]) -> List[Dict]:
        """Identify relationships between architectural components (edges)"""
        edges = []
        
        # Heuristic: Create edges based on common dependency patterns
        # This is simplified; real analysis would parse import statements
        
        try:
            node_by_type = {node['type']: node for node in nodes}
            
            # Common architectural relationships
            relationships = [
                ('frontend', 'api', 'uses'),
                ('frontend', 'backend', 'calls'),
                ('api', 'services', 'delegates to'),
                ('api', 'database', 'queries'),
                ('backend', 'database', 'queries'),
                ('services', 'models', 'uses'),
                ('services', 'database', 'accesses'),
                ('controllers', 'services', 'calls'),
                ('controllers', 'models', 'uses'),
                ('routes', 'controllers', 'routes to'),
                ('routes', 'handlers', 'routes to'),
                ('middleware', 'routes', 'protects'),
                ('workers', 'database', 'updates'),
                ('api', 'core', 'depends on'),
                ('backend', 'core', 'depends on'),
            ]
            
            edge_id_counter = 1
            for source_type, target_type, relationship in relationships:
                if source_type in node_by_type and target_type in node_by_type:
                    edges.append({
                        'id': f'edge-{edge_id_counter}',
                        'source': node_by_type[source_type]['id'],
                        'target': node_by_type[target_type]['id'],
                        'type': relationship
                    })
                    edge_id_counter += 1
                    
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not identify edges: {e}{Colors.ENDC}")
        
        return edges


class ConfigGenerator:
    """Generates dev-status.config.json files"""
    
    @staticmethod
    def generate_config(repo_path: str, repo_info: Dict, status: str, 
                       nodes: List[Dict], edges: List[Dict], 
                       git_stats: Dict) -> Dict:
        """Generate the complete configuration object"""
        
        config = {
            "projectName": repo_info.get('name', Path(repo_path).name),
            "lastUpdate": git_stats.get('lastCommitDate', datetime.now().isoformat()),
            "source": "local",
            "repositoryPath": repo_path,
            "branch": repo_info.get('branch', 'unknown'),
            "status": status,
            "stats": {
                "totalCommitsLast30Days": git_stats.get('commits30Days', 0),
                "totalCommitsLast14Days": git_stats.get('commits14Days', 0),
                "fileCount": repo_info.get('file_count', 0),
                "sizeMB": repo_info.get('size_mb', 0),
                "primaryLanguage": git_stats.get('language', 'unknown'),
                "workingTreeClean": git_stats.get('treeClean', True)
            },
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "generatedAt": datetime.now().isoformat(),
                "generatedBy": "phase1_analyzer",
                "lastCommitMessage": git_stats.get('lastCommitMessage', ''),
                "lastCommitAuthor": git_stats.get('lastCommitAuthor', ''),
                "tags": git_stats.get('tags', [])[:5],  # Only include top 5 tags
                "packageFiles": git_stats.get('packageFiles', [])
            }
        }
        
        return config
    
    @staticmethod
    def save_config(config: Dict, repo_path: str) -> bool:
        """Save configuration to dev-status.config.json in repository root"""
        try:
            output_file = Path(repo_path) / 'dev-status.config.json'
            with open(output_file, 'w') as f:
                json.dump(config, f, indent=2)
            return True
        except Exception as e:
            print(f"{Colors.FAIL}❌ Could not save config: {e}{Colors.ENDC}")
            return False


class RepositoryAnalyzer:
    """Main analyzer that orchestrates the analysis process"""
    
    def __init__(self, repo_info: Dict):
        self.repo_info = repo_info
        self.repo_path = repo_info['path']
        
    def analyze(self) -> Tuple[bool, Optional[Dict]]:
        """Perform complete analysis of repository"""
        print(f"\n{Colors.OKCYAN}📊 Analyzing: {Colors.BOLD}{self.repo_info['name']}{Colors.ENDC}")
        print(f"   Path: {self.repo_path}")
        
        try:
            # Initialize analyzers
            git_analyzer = GitAnalyzer(self.repo_path)
            code_analyzer = CodeAnalyzer(self.repo_path)
            
            # Git analysis
            print(f"   {Colors.OKBLUE}→{Colors.ENDC} Analyzing Git history...")
            commits_30_days = git_analyzer.get_commit_activity(30)
            commits_14_days = git_analyzer.get_commit_activity(14)
            last_commit_info = git_analyzer.get_last_commit_info()
            tree_status = git_analyzer.get_working_tree_status()
            tags = git_analyzer.get_tags()
            status = git_analyzer.infer_status()
            
            # Code analysis
            print(f"   {Colors.OKBLUE}→{Colors.ENDC} Analyzing code structure...")
            language = code_analyzer.detect_primary_language()
            package_files = code_analyzer.find_package_files()
            nodes = code_analyzer.identify_architecture_nodes()
            edges = code_analyzer.identify_architecture_edges(nodes)
            
            # Compile statistics
            git_stats = {
                'commits30Days': commits_30_days,
                'commits14Days': commits_14_days,
                'lastCommitDate': last_commit_info.get('date', ''),
                'lastCommitMessage': last_commit_info.get('message', ''),
                'lastCommitAuthor': last_commit_info.get('author', ''),
                'treeClean': tree_status['clean'],
                'language': language,
                'tags': tags,
                'packageFiles': package_files
            }
            
            # Generate configuration
            print(f"   {Colors.OKBLUE}→{Colors.ENDC} Generating configuration...")
            config = ConfigGenerator.generate_config(
                self.repo_path,
                self.repo_info,
                status,
                nodes,
                edges,
                git_stats
            )
            
            # Save configuration
            print(f"   {Colors.OKBLUE}→{Colors.ENDC} Saving dev-status.config.json...")
            success = ConfigGenerator.save_config(config, self.repo_path)
            
            if success:
                status_colors = {
                    'green': Colors.OKGREEN,
                    'orange': Colors.WARNING,
                    'red': Colors.FAIL,
                    'gray': '\033[90m'
                }
                status_color = status_colors.get(status, Colors.ENDC)
                print(f"   {Colors.OKGREEN}✓{Colors.ENDC} Analysis complete | Status: {status_color}{status.upper()}{Colors.ENDC} | Nodes: {len(nodes)} | Edges: {len(edges)}")
                return True, config
            else:
                print(f"   {Colors.FAIL}✗{Colors.ENDC} Failed to save configuration")
                return False, None
                
        except Exception as e:
            print(f"   {Colors.FAIL}✗{Colors.ENDC} Analysis failed: {e}")
            return False, None


def load_selection_from_json(json_path: str) -> List[Dict]:
    """Load repository selection from JSON file"""
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
            return data.get('repositories', [])
    except Exception as e:
        print(f"{Colors.FAIL}❌ Could not load selection: {e}{Colors.ENDC}")
        return []


def parse_selection_from_markdown(md_path: str, base_path: str) -> List[Dict]:
    """Parse repository selection from markdown file"""
    repositories = []
    
    try:
        with open(md_path, 'r') as f:
            content = f.read()
        
        # Parse selected repository numbers from the last line
        match = re.search(r'➜ Selected repositories: ([\d\s]+)$', content, re.MULTILINE)
        if not match:
            print(f"{Colors.FAIL}❌ Could not find selection in markdown{Colors.ENDC}")
            return []
        
        selected_numbers = [int(n) for n in match.group(1).split()]
        
        # Parse repository entries
        repo_pattern = r'\[([x ])\]\s+(\d+)\.\s+(.+?)\n\s+Path: (.+?)\n\s+Branch: (.+?) \| Files: (\d+) \| Size: ([\d.]+) MB\n\s+Last commit: (.+?)(?:\n\n|\n$)'
        matches = re.finditer(repo_pattern, content, re.MULTILINE)
        
        all_repos = []
        for match in matches:
            checkbox, number, name, path, branch, files, size, last_commit = match.groups()
            all_repos.append({
                'number': int(number),
                'name': name,
                'path': str(Path(base_path) / path),
                'relative_path': path,
                'branch': branch,
                'file_count': int(files),
                'size_mb': float(size),
                'last_commit': last_commit
            })
        
        # Filter selected repositories
        repositories = [repo for repo in all_repos if repo['number'] in selected_numbers]
        
    except Exception as e:
        print(f"{Colors.FAIL}❌ Could not parse markdown: {e}{Colors.ENDC}")
    
    return repositories


def display_analysis_summary(results: List[Tuple[Dict, bool, Optional[Dict]]]):
    """Display summary of analysis results"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}ANALYSIS SUMMARY{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")
    
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]
    
    print(f"Total repositories analyzed: {Colors.BOLD}{len(results)}{Colors.ENDC}")
    print(f"Successful: {Colors.OKGREEN}{len(successful)}{Colors.ENDC}")
    print(f"Failed: {Colors.FAIL}{len(failed)}{Colors.ENDC}\n")
    
    if successful:
        # Count by status
        status_counts = defaultdict(int)
        for repo_info, success, config in successful:
            if config:
                status_counts[config['status']] += 1
        
        print(f"{Colors.OKCYAN}Status Distribution:{Colors.ENDC}")
        print(f"  {Colors.OKGREEN}● Green (Stable):{Colors.ENDC} {status_counts['green']}")
        print(f"  {Colors.WARNING}● Orange (Active):{Colors.ENDC} {status_counts['orange']}")
        print(f"  {Colors.FAIL}● Red (Blocked/Stale):{Colors.ENDC} {status_counts['red']}")
        print(f"  \033[90m● Gray (Archived):{Colors.ENDC} {status_counts['gray']}\n")
    
    if failed:
        print(f"{Colors.FAIL}Failed Repositories:{Colors.ENDC}")
        for repo_info, _, _ in failed:
            print(f"  • {repo_info['name']}")

