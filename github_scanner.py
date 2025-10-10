#!/usr/bin/env python3
"""
GitHub Repository Scanner
Scans all GitHub repositories for a user/org and generates pow3r.status.json for each
"""

import os
import json
import requests
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import tempfile
import shutil


class GitHubScanner:
    """Scan GitHub repositories and generate status configs"""
    
    def __init__(self, github_token: str, output_dir: str = './github-status'):
        self.token = github_token
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.headers = {
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        self.base_url = 'https://api.github.com'
    
    def scan_all_repos(self, username: Optional[str] = None, org: Optional[str] = None):
        """Scan all repositories for a user or organization"""
        print(f"\n🔍 Scanning GitHub repositories...")
        
        if org:
            repos = self.get_org_repos(org)
        elif username:
            repos = self.get_user_repos(username)
        else:
            repos = self.get_authenticated_user_repos()
        
        print(f"✓ Found {len(repos)} repositories\n")
        
        results = []
        for idx, repo in enumerate(repos, 1):
            print(f"[{idx}/{len(repos)}] {repo['name']}")
            
            try:
                status = self.analyze_repo(repo)
                self.save_status(repo['name'], status)
                results.append((repo['name'], True, status))
                print(f"  ✓ Generated pow3r.status.json")
            except Exception as e:
                print(f"  ❌ Error: {e}")
                results.append((repo['name'], False, None))
        
        # Generate aggregated config
        self.generate_aggregated_config(results)
        
        return results
    
    def get_authenticated_user_repos(self) -> List[Dict]:
        """Get all repos for authenticated user"""
        repos = []
        page = 1
        
        while True:
            response = requests.get(
                f"{self.base_url}/user/repos",
                headers=self.headers,
                params={'page': page, 'per_page': 100}
            )
            response.raise_for_status()
            
            page_repos = response.json()
            if not page_repos:
                break
            
            repos.extend(page_repos)
            page += 1
        
        return repos
    
    def get_user_repos(self, username: str) -> List[Dict]:
        """Get all public repos for a specific user"""
        repos = []
        page = 1
        
        while True:
            response = requests.get(
                f"{self.base_url}/users/{username}/repos",
                headers=self.headers,
                params={'page': page, 'per_page': 100}
            )
            response.raise_for_status()
            
            page_repos = response.json()
            if not page_repos:
                break
            
            repos.extend(page_repos)
            page += 1
        
        return repos
    
    def get_org_repos(self, org: str) -> List[Dict]:
        """Get all repos for an organization"""
        repos = []
        page = 1
        
        while True:
            response = requests.get(
                f"{self.base_url}/orgs/{org}/repos",
                headers=self.headers,
                params={'page': page, 'per_page': 100}
            )
            response.raise_for_status()
            
            page_repos = response.json()
            if not page_repos:
                break
            
            repos.extend(page_repos)
            page += 1
        
        return repos
    
    def analyze_repo(self, repo: Dict) -> Dict:
        """Analyze a single repository and generate status"""
        
        # Get additional data
        commits = self.get_recent_commits(repo['full_name'])
        languages = self.get_languages(repo['full_name'])
        contributors = self.get_contributors(repo['full_name'])
        branches = self.get_branches(repo['full_name'])
        
        # Infer dev status
        status = self.infer_status(repo, commits)
        
        # Discover components
        components = self.discover_components(repo, languages)
        
        # Create status config
        config = {
            "graphId": hashlib.sha256(f"{repo['full_name']}-{datetime.now().isoformat()}".encode()).hexdigest()[:16],
            "projectName": repo['name'],
            "lastScan": datetime.now().isoformat(),
            "source": "github",
            "repositoryPath": repo['html_url'],
            "branch": repo['default_branch'],
            "status": status,
            
            "stats": {
                "totalCommitsLast30Days": len([c for c in commits if self.is_recent(c['commit']['author']['date'], 30)]),
                "totalCommitsLast14Days": len([c for c in commits if self.is_recent(c['commit']['author']['date'], 14)]),
                "stars": repo['stargazers_count'],
                "forks": repo['forks_count'],
                "watchers": repo['watchers_count'],
                "openIssues": repo['open_issues_count'],
                "primaryLanguage": repo['language'] or 'Unknown',
                "languages": languages,
                "contributors": len(contributors),
                "branches": len(branches)
            },
            
            "metadata": {
                "version": "2.0",
                "configType": "v2",
                "created": repo['created_at'],
                "updated": repo['updated_at'],
                "pushed": repo['pushed_at'],
                "description": repo['description'] or f"{repo['name']} repository",
                "homepage": repo['homepage'],
                "topics": repo['topics'] if 'topics' in repo else [],
                "license": repo['license']['name'] if repo['license'] else None,
                "visibility": 'public' if not repo['private'] else 'private',
                "archived": repo['archived'],
                "disabled": repo['disabled']
            },
            
            "nodes": components['nodes'],
            "edges": components['edges']
        }
        
        return config
    
    def get_recent_commits(self, repo_full_name: str, max_commits: int = 100) -> List[Dict]:
        """Get recent commits from GitHub API"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{repo_full_name}/commits",
                headers=self.headers,
                params={'per_page': max_commits}
            )
            response.raise_for_status()
            return response.json()
        except:
            return []
    
    def get_languages(self, repo_full_name: str) -> Dict:
        """Get language statistics"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{repo_full_name}/languages",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except:
            return {}
    
    def get_contributors(self, repo_full_name: str) -> List[Dict]:
        """Get contributors"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{repo_full_name}/contributors",
                headers=self.headers,
                params={'per_page': 100}
            )
            response.raise_for_status()
            return response.json()
        except:
            return []
    
    def get_branches(self, repo_full_name: str) -> List[Dict]:
        """Get branches"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{repo_full_name}/branches",
                headers=self.headers,
                params={'per_page': 100}
            )
            response.raise_for_status()
            return response.json()
        except:
            return []
    
    def get_repo_contents(self, repo_full_name: str, path: str = '') -> List[Dict]:
        """Get repository contents"""
        try:
            response = requests.get(
                f"{self.base_url}/repos/{repo_full_name}/contents/{path}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except:
            return []
    
    def is_recent(self, date_str: str, days: int) -> bool:
        """Check if date is within the last N days"""
        try:
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return (datetime.now(date.tzinfo) - date).days <= days
        except:
            return False
    
    def infer_status(self, repo: Dict, commits: List[Dict]) -> str:
        """Infer development status (green/orange/red/gray)"""
        
        # Archived or disabled = gray
        if repo['archived'] or repo['disabled']:
            return 'gray'
        
        # Check recent activity
        recent_commits = [c for c in commits if self.is_recent(c['commit']['author']['date'], 30)]
        
        if not recent_commits:
            # No commits in 30 days
            if self.is_recent(repo['pushed_at'], 90):
                return 'orange'  # Some recent activity
            else:
                return 'gray'  # Stale
        
        # Check commit frequency
        commits_14d = len([c for c in commits if self.is_recent(c['commit']['author']['date'], 14)])
        
        if commits_14d >= 5:
            return 'green'  # Active development
        elif commits_14d >= 2:
            return 'orange'  # Moderate activity
        elif repo['open_issues_count'] > 10:
            return 'red'  # Has issues but low activity
        else:
            return 'orange'  # Maintained
    
    def discover_components(self, repo: Dict, languages: Dict) -> Dict:
        """Discover architectural components from repo structure"""
        
        # Get root contents
        contents = self.get_repo_contents(repo['full_name'])
        
        nodes = []
        edges = []
        
        # Detect project type and structure
        has_package_json = any(f['name'] == 'package.json' for f in contents if f['type'] == 'file')
        has_requirements = any(f['name'] == 'requirements.txt' for f in contents if f['type'] == 'file')
        has_cargo = any(f['name'] == 'Cargo.toml' for f in contents if f['type'] == 'file')
        has_go_mod = any(f['name'] == 'go.mod' for f in contents if f['type'] == 'file')
        
        # Main repository node
        nodes.append({
            "id": f"{repo['name']}-main",
            "name": repo['name'],
            "type": "service.repository",
            "category": "Repository",
            "description": repo['description'] or f"{repo['name']} repository",
            "status": self.infer_status(repo, self.get_recent_commits(repo['full_name'])),
            "tags": repo['topics'] if 'topics' in repo else [],
            "metadata": {
                "nodeId": f"{repo['name']}-main",
                "category": "Repository",
                "type": "service",
                "language": repo['language']
            },
            "position": {"x": 0, "y": 0, "z": 0}
        })
        
        # Discover components from directory structure
        component_patterns = {
            'src': {'type': 'component.source', 'category': 'Source'},
            'public': {'type': 'component.ui', 'category': 'Frontend'},
            'server': {'type': 'service.backend', 'category': 'Backend'},
            'api': {'type': 'service.api', 'category': 'API'},
            'functions': {'type': 'service.serverless', 'category': 'Functions'},
            'components': {'type': 'component.ui.react', 'category': 'UI'},
            'lib': {'type': 'library.js', 'category': 'Library'},
            'docs': {'type': 'doc.markdown', 'category': 'Documentation'},
            'tests': {'type': 'test.e2e', 'category': 'Testing'}
        }
        
        edge_id = 0
        for item in contents:
            if item['type'] == 'dir' and item['name'] in component_patterns:
                pattern = component_patterns[item['name']]
                node_id = f"{repo['name']}-{item['name']}"
                
                nodes.append({
                    "id": node_id,
                    "name": item['name'].title(),
                    "type": pattern['type'],
                    "category": pattern['category'],
                    "description": f"{pattern['category']} component",
                    "status": self.infer_status(repo, self.get_recent_commits(repo['full_name'])),
                    "tags": [item['name']],
                    "metadata": {
                        "nodeId": node_id,
                        "category": pattern['category'],
                        "type": pattern['type']
                    },
                    "position": {"x": (edge_id - 2) * 50, "y": 0, "z": 0}
                })
                
                # Create edge from main to component
                edges.append({
                    "id": f"edge-{edge_id}",
                    "from": f"{repo['name']}-main",
                    "to": node_id,
                    "type": "contains",
                    "label": "Contains",
                    "strength": 1.0,
                    "metadata": {
                        "edgeId": f"edge-{edge_id}",
                        "type": "contains"
                    }
                })
                edge_id += 1
        
        return {
            "nodes": nodes,
            "edges": edges
        }
    
    def save_status(self, repo_name: str, status: Dict):
        """Save status to file"""
        output_file = self.output_dir / f"{repo_name}.pow3r.status.json"
        
        with open(output_file, 'w') as f:
            json.dump(status, f, indent=2)
    
    def generate_aggregated_config(self, results: List):
        """Generate aggregated config from all repos"""
        successful = [r for r in results if r[1]]
        
        aggregated = {
            "graphId": hashlib.sha256(f"aggregated-{datetime.now().isoformat()}".encode()).hexdigest()[:16],
            "projectName": "All GitHub Repositories",
            "lastScan": datetime.now().isoformat(),
            "source": "github-aggregated",
            "totalRepositories": len(results),
            "successfulScans": len(successful),
            "failedScans": len(results) - len(successful),
            
            "nodes": [],
            "edges": [],
            
            "metadata": {
                "version": "2.0",
                "configType": "aggregated",
                "created": datetime.now().isoformat(),
                "description": "Aggregated status from all GitHub repositories"
            }
        }
        
        # Aggregate all nodes and edges
        for repo_name, success, status in successful:
            if status:
                # Add all nodes with repo prefix
                for node in status.get('nodes', []):
                    aggregated['nodes'].append(node)
                
                # Add all edges
                for edge in status.get('edges', []):
                    aggregated['edges'].append(edge)
        
        # Save aggregated config
        output_file = self.output_dir / "aggregated.pow3r.status.json"
        with open(output_file, 'w') as f:
            json.dump(aggregated, f, indent=2)
        
        print(f"\n✨ Generated aggregated config: {output_file}")
        print(f"   Total nodes: {len(aggregated['nodes'])}")
        print(f"   Total edges: {len(aggregated['edges'])}")


def main():
    import sys
    
    # Get GitHub token from environment or argument
    token = os.environ.get('GITHUB_TOKEN')
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]
    
    if not token:
        print("❌ GitHub token required")
        print("Usage: python github_scanner.py [token]")
        print("Or set GITHUB_TOKEN environment variable")
        sys.exit(1)
    
    # Get target (user or org)
    username = os.environ.get('GITHUB_USERNAME')
    org = os.environ.get('GITHUB_ORG')
    
    # Create scanner
    scanner = GitHubScanner(token)
    
    # Scan repositories
    results = scanner.scan_all_repos(username=username, org=org)
    
    # Print summary
    print("\n" + "=" * 70)
    print("📊 SCAN COMPLETE")
    print("=" * 70)
    print(f"Total: {len(results)}")
    print(f"✅ Successful: {len([r for r in results if r[1]])}")
    print(f"❌ Failed: {len([r for r in results if not r[1]])}")
    print(f"\n📁 Output directory: {scanner.output_dir}")
    print("=" * 70)


if __name__ == '__main__':
    main()
