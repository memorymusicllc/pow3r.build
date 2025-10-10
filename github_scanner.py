#!/usr/bin/env python3
"""
GitHub Repository Scanner
Scans GitHub repositories and generates power.status.json files
with architecture and development status for each node
"""

import os
import json
import hashlib
import requests
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import base64
import re


class GitHubScanner:
    """Scans GitHub repositories and generates power.status.json"""
    
    def __init__(self, token: str, org: str = None):
        self.token = token
        self.org = org
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        })
        self.base_url = 'https://api.github.com'
        
    def scan_organization(self, output_dir: str = './github-repos') -> Dict:
        """Scan all repositories in an organization"""
        if not self.org:
            raise ValueError("Organization not specified")
            
        print(f"🔍 Scanning GitHub organization: {self.org}")
        
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Get all repositories
        repos = self.get_repositories()
        print(f"📦 Found {len(repos)} repositories")
        
        results = {
            'organization': self.org,
            'scan_timestamp': datetime.utcnow().isoformat() + 'Z',
            'repositories': []
        }
        
        for repo in repos:
            print(f"\n📊 Analyzing: {repo['name']}")
            power_status = self.analyze_repository(repo)
            
            # Save individual power.status.json
            repo_dir = output_path / repo['name']
            repo_dir.mkdir(exist_ok=True)
            
            with open(repo_dir / 'power.status.json', 'w') as f:
                json.dump(power_status, f, indent=2)
            
            results['repositories'].append({
                'name': repo['name'],
                'path': str(repo_dir / 'power.status.json'),
                'node_count': len(power_status.get('assets', [])),
                'edge_count': len(power_status.get('edges', []))
            })
            
        # Save summary
        with open(output_path / 'scan_summary.json', 'w') as f:
            json.dump(results, f, indent=2)
            
        print(f"\n✅ Scan complete! Generated {len(results['repositories'])} power.status.json files")
        return results
    
    def scan_repository(self, repo_name: str, output_dir: str = './github-repos') -> Dict:
        """Scan a single repository"""
        print(f"🔍 Scanning GitHub repository: {repo_name}")
        
        # Parse owner/repo format
        if '/' in repo_name:
            owner, name = repo_name.split('/')
        else:
            owner = self.org
            name = repo_name
            
        if not owner:
            raise ValueError("Repository owner not specified")
            
        # Get repository info
        repo = self.get_repository(owner, name)
        
        # Create output directory
        output_path = Path(output_dir) / name
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Analyze repository
        power_status = self.analyze_repository(repo)
        
        # Save power.status.json
        with open(output_path / 'power.status.json', 'w') as f:
            json.dump(power_status, f, indent=2)
            
        print(f"✅ Generated power.status.json for {name}")
        return power_status
    
    def get_repositories(self) -> List[Dict]:
        """Get all repositories for the organization"""
        repos = []
        page = 1
        
        while True:
            response = self.session.get(
                f"{self.base_url}/orgs/{self.org}/repos",
                params={'page': page, 'per_page': 100}
            )
            response.raise_for_status()
            
            batch = response.json()
            if not batch:
                break
                
            repos.extend(batch)
            page += 1
            
        return repos
    
    def get_repository(self, owner: str, name: str) -> Dict:
        """Get single repository info"""
        response = self.session.get(f"{self.base_url}/repos/{owner}/{name}")
        response.raise_for_status()
        return response.json()
    
    def analyze_repository(self, repo: Dict) -> Dict:
        """Analyze repository and generate power.status.json structure"""
        owner = repo['owner']['login']
        name = repo['name']
        
        # Initialize power.status structure
        power_status = {
            "graphId": f"github-{owner}-{name}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "lastScan": datetime.utcnow().isoformat() + 'Z',
            "assets": [],
            "edges": []
        }
        
        # Analyze repository structure
        file_tree = self.get_file_tree(owner, name)
        
        # Analyze commits for activity
        commits = self.get_recent_commits(owner, name)
        
        # Analyze issues and PRs for status
        issues = self.get_issues(owner, name)
        prs = self.get_pull_requests(owner, name)
        
        # Get contributors
        contributors = self.get_contributors(owner, name)
        
        # Build assets from file tree
        assets = self.build_assets_from_tree(
            file_tree, repo, commits, issues, prs, contributors
        )
        
        # Discover relationships
        edges = self.discover_relationships(assets)
        
        power_status['assets'] = assets
        power_status['edges'] = edges
        
        return power_status
    
    def get_file_tree(self, owner: str, name: str) -> Dict:
        """Get repository file tree"""
        response = self.session.get(
            f"{self.base_url}/repos/{owner}/{name}/git/trees/HEAD",
            params={'recursive': 1}
        )
        
        if response.status_code == 404:
            return {'tree': []}
            
        response.raise_for_status()
        return response.json()
    
    def get_recent_commits(self, owner: str, name: str) -> List[Dict]:
        """Get commits from last 30 days"""
        since = (datetime.utcnow() - timedelta(days=30)).isoformat() + 'Z'
        
        response = self.session.get(
            f"{self.base_url}/repos/{owner}/{name}/commits",
            params={'since': since, 'per_page': 100}
        )
        
        if response.status_code == 404:
            return []
            
        response.raise_for_status()
        return response.json()
    
    def get_issues(self, owner: str, name: str) -> List[Dict]:
        """Get open issues"""
        response = self.session.get(
            f"{self.base_url}/repos/{owner}/{name}/issues",
            params={'state': 'open', 'per_page': 100}
        )
        
        if response.status_code == 404:
            return []
            
        response.raise_for_status()
        return response.json()
    
    def get_pull_requests(self, owner: str, name: str) -> List[Dict]:
        """Get open pull requests"""
        response = self.session.get(
            f"{self.base_url}/repos/{owner}/{name}/pulls",
            params={'state': 'open', 'per_page': 100}
        )
        
        if response.status_code == 404:
            return []
            
        response.raise_for_status()
        return response.json()
    
    def get_contributors(self, owner: str, name: str) -> List[Dict]:
        """Get repository contributors"""
        response = self.session.get(
            f"{self.base_url}/repos/{owner}/{name}/contributors",
            params={'per_page': 100}
        )
        
        if response.status_code == 404:
            return []
            
        response.raise_for_status()
        return response.json()
    
    def build_assets_from_tree(self, file_tree: Dict, repo: Dict, 
                               commits: List[Dict], issues: List[Dict],
                               prs: List[Dict], contributors: List[Dict]) -> List[Dict]:
        """Build asset nodes from repository data"""
        assets = []
        
        # Repository root node
        repo_id = self.generate_id(f"repo-{repo['full_name']}")
        assets.append({
            "id": repo_id,
            "type": "service.backend",
            "source": "github",
            "location": repo['html_url'],
            "metadata": {
                "title": repo['name'],
                "description": repo['description'] or f"GitHub repository: {repo['name']}",
                "tags": self.extract_tags(repo),
                "version": "1.0.0",
                "authors": [c['login'] for c in contributors[:5]],
                "createdAt": repo['created_at'],
                "lastUpdate": repo['updated_at']
            },
            "status": {
                "phase": self.determine_repo_status(repo, commits, issues, prs),
                "completeness": self.calculate_completeness(repo, file_tree),
                "qualityScore": self.calculate_quality_score(repo, issues, prs),
                "notes": self.generate_status_notes(repo, commits, issues, prs)
            },
            "dependencies": {
                "io": {
                    "inputs": [],
                    "outputs": []
                },
                "universalConfigRef": "github-v1"
            },
            "analytics": {
                "embedding": [],  # Would need AI service for embeddings
                "connectivity": 0,  # Will be calculated after edges
                "centralityScore": 0.8,  # Repository is central
                "activityLast30Days": len(commits)
            }
        })
        
        # Process file tree
        for item in file_tree.get('tree', []):
            if item['type'] != 'blob':
                continue
                
            asset = self.create_asset_from_file(item, repo, repo_id, commits)
            if asset:
                assets.append(asset)
        
        return assets
    
    def create_asset_from_file(self, file_item: Dict, repo: Dict, 
                               repo_id: str, commits: List[Dict]) -> Optional[Dict]:
        """Create asset node from file"""
        path = file_item['path']
        
        # Determine file type
        file_type = self.determine_file_type(path)
        if not file_type:
            return None
            
        # Check if file was recently modified
        recent_changes = self.count_file_changes(path, commits)
        
        asset_id = self.generate_id(f"{repo['full_name']}-{path}")
        
        return {
            "id": asset_id,
            "type": file_type,
            "source": "github",
            "location": f"{repo['html_url']}/blob/{repo['default_branch']}/{path}",
            "metadata": {
                "title": Path(path).name,
                "description": f"File: {path}",
                "tags": self.extract_file_tags(path),
                "version": "1.0.0",
                "authors": [],
                "createdAt": repo['created_at'],
                "lastUpdate": repo['updated_at']
            },
            "status": {
                "phase": self.determine_file_status(recent_changes),
                "completeness": 0.8,
                "qualityScore": 0.7,
                "notes": f"Modified {recent_changes} times in last 30 days"
            },
            "dependencies": {
                "io": {
                    "inputs": [],
                    "outputs": []
                },
                "universalConfigRef": "github-v1"
            },
            "analytics": {
                "embedding": [],
                "connectivity": 1,  # Connected to repo
                "centralityScore": 0.3,
                "activityLast30Days": recent_changes
            }
        }
    
    def determine_file_type(self, path: str) -> Optional[str]:
        """Determine asset type from file path"""
        path_lower = path.lower()
        
        # UI Components
        if any(x in path_lower for x in ['.tsx', '.jsx', 'component']):
            if '3d' in path_lower or 'three' in path_lower:
                return "component.ui.3d"
            return "component.ui.react"
            
        # Backend services
        if any(x in path_lower for x in ['api/', 'server', 'backend', '.py', 'worker']):
            return "service.backend"
            
        # Configuration
        if any(x in path_lower for x in ['config', '.json', '.yaml', '.toml']):
            return "config.schema"
            
        # Documentation
        if any(x in path_lower for x in ['.md', 'readme', 'docs/']):
            return "doc.markdown"
            
        # Tests
        if any(x in path_lower for x in ['test', 'spec', '.test.', '.spec.']):
            return "test.e2e"
            
        # CI/CD
        if any(x in path_lower for x in ['.github/workflows', '.gitlab-ci', 'jenkinsfile']):
            return "workflow.ci-cd"
            
        # Libraries
        if path_lower.endswith('.js') or path_lower.endswith('.ts'):
            return "library.js"
            
        return None
    
    def determine_repo_status(self, repo: Dict, commits: List[Dict], 
                             issues: List[Dict], prs: List[Dict]) -> str:
        """Determine repository development status"""
        # Check recent activity
        if not commits:
            return "gray"  # No recent activity
            
        # Check for critical issues
        critical_issues = [i for i in issues if any(
            label['name'].lower() in ['bug', 'critical', 'blocker'] 
            for label in i.get('labels', [])
        )]
        
        if critical_issues:
            return "red"  # Has critical issues
            
        # Check for many open PRs
        if len(prs) > 10:
            return "orange"  # Many pending changes
            
        # Active development
        if len(commits) > 20:
            return "green"  # Very active
            
        return "green"  # Normal activity
    
    def determine_file_status(self, recent_changes: int) -> str:
        """Determine file status based on activity"""
        if recent_changes == 0:
            return "gray"
        elif recent_changes > 10:
            return "orange"  # Heavily modified
        elif recent_changes > 5:
            return "green"   # Active development
        else:
            return "green"   # Stable
    
    def calculate_completeness(self, repo: Dict, file_tree: Dict) -> float:
        """Calculate repository completeness score"""
        score = 0.5  # Base score
        
        # Has description
        if repo.get('description'):
            score += 0.1
            
        # Has README
        files = [f['path'].lower() for f in file_tree.get('tree', [])]
        if any('readme' in f for f in files):
            score += 0.1
            
        # Has documentation
        if any('docs/' in f or '.md' in f for f in files):
            score += 0.1
            
        # Has tests
        if any('test' in f for f in files):
            score += 0.1
            
        # Has CI/CD
        if any('.github/workflows' in f or 'ci' in f for f in files):
            score += 0.1
            
        return min(score, 1.0)
    
    def calculate_quality_score(self, repo: Dict, issues: List[Dict], prs: List[Dict]) -> float:
        """Calculate quality score based on issues and PRs"""
        score = 0.8  # Base score
        
        # Deduct for bugs
        bug_count = len([i for i in issues if any(
            label['name'].lower() in ['bug', 'defect'] 
            for label in i.get('labels', [])
        )])
        score -= (bug_count * 0.05)
        
        # Deduct for old PRs
        old_prs = len([p for p in prs if self.is_old_pr(p)])
        score -= (old_prs * 0.03)
        
        return max(score, 0.0)
    
    def is_old_pr(self, pr: Dict) -> bool:
        """Check if PR is older than 30 days"""
        created = datetime.fromisoformat(pr['created_at'].replace('Z', '+00:00'))
        return (datetime.now(created.tzinfo) - created).days > 30
    
    def generate_status_notes(self, repo: Dict, commits: List[Dict], 
                            issues: List[Dict], prs: List[Dict]) -> str:
        """Generate AI-style status notes"""
        notes = []
        
        if len(commits) > 30:
            notes.append("High development activity")
        elif len(commits) == 0:
            notes.append("No recent commits")
            
        bug_count = len([i for i in issues if any(
            label['name'].lower() in ['bug', 'defect'] 
            for label in i.get('labels', [])
        )])
        if bug_count > 0:
            notes.append(f"{bug_count} open bugs")
            
        if len(prs) > 5:
            notes.append(f"{len(prs)} pending pull requests")
            
        if repo.get('archived'):
            notes.append("Repository is archived")
            
        return ". ".join(notes) if notes else "Repository appears healthy"
    
    def extract_tags(self, repo: Dict) -> List[str]:
        """Extract tags from repository"""
        tags = []
        
        # Language
        if repo.get('language'):
            tags.append(repo['language'].lower())
            
        # Topics
        tags.extend(repo.get('topics', []))
        
        # From description
        if repo.get('description'):
            # Extract keywords
            keywords = re.findall(r'\b\w+\b', repo['description'].lower())
            tech_keywords = ['react', 'vue', 'angular', 'node', 'python', 
                           'api', 'frontend', 'backend', 'database', 'cli']
            tags.extend([k for k in keywords if k in tech_keywords])
            
        return list(set(tags))
    
    def extract_file_tags(self, path: str) -> List[str]:
        """Extract tags from file path"""
        tags = []
        path_lower = path.lower()
        
        # Technology tags
        if '.js' in path_lower or '.ts' in path_lower:
            tags.append('javascript')
        if '.py' in path_lower:
            tags.append('python')
        if '.tsx' in path_lower or '.jsx' in path_lower:
            tags.append('react')
        if 'test' in path_lower:
            tags.append('testing')
            
        # Component type
        parts = path_lower.split('/')
        if 'components' in parts:
            tags.append('component')
        if 'api' in parts:
            tags.append('api')
        if 'utils' in parts or 'helpers' in parts:
            tags.append('utility')
            
        return tags
    
    def count_file_changes(self, file_path: str, commits: List[Dict]) -> int:
        """Count how many times a file was changed in commits"""
        count = 0
        
        for commit in commits:
            # Get commit details
            if 'files' not in commit:
                # Need to fetch commit details
                continue
                
            for file in commit.get('files', []):
                if file['filename'] == file_path:
                    count += 1
                    
        return count
    
    def discover_relationships(self, assets: List[Dict]) -> List[Dict]:
        """Discover relationships between assets"""
        edges = []
        
        # Create asset lookup
        asset_map = {a['id']: a for a in assets}
        
        # Find repository node
        repo_nodes = [a for a in assets if a['type'] == 'service.backend' 
                     and 'repo-' in a['id']]
        
        if not repo_nodes:
            return edges
            
        repo_id = repo_nodes[0]['id']
        
        # Connect all files to repository
        for asset in assets:
            if asset['id'] != repo_id:
                edges.append({
                    "from": asset['id'],
                    "to": repo_id,
                    "type": "partOf",
                    "strength": 1.0
                })
                
        # Find relationships between files
        for i, asset1 in enumerate(assets):
            for asset2 in assets[i+1:]:
                relationship = self.find_file_relationship(asset1, asset2)
                if relationship:
                    edges.append(relationship)
                    
        # Update connectivity scores
        for asset in assets:
            asset['analytics']['connectivity'] = sum(
                1 for e in edges 
                if e['from'] == asset['id'] or e['to'] == asset['id']
            )
            
        return edges
    
    def find_file_relationship(self, asset1: Dict, asset2: Dict) -> Optional[Dict]:
        """Find relationship between two file assets"""
        # Skip if one is the repo node
        if 'repo-' in asset1['id'] or 'repo-' in asset2['id']:
            return None
            
        # Check for test relationship
        path1 = asset1['location'].split('/')[-1]
        path2 = asset2['location'].split('/')[-1]
        
        if 'test' in asset1['type'] and path1.replace('.test', '').replace('.spec', '') in path2:
            return {
                "from": asset1['id'],
                "to": asset2['id'],
                "type": "references",
                "strength": 0.9
            }
            
        # Check for similar names (might be related)
        if self.similar_names(path1, path2):
            return {
                "from": asset1['id'],
                "to": asset2['id'],
                "type": "relatedTo",
                "strength": 0.6
            }
            
        return None
    
    def similar_names(self, name1: str, name2: str) -> bool:
        """Check if two file names are similar"""
        # Remove extensions
        base1 = Path(name1).stem.lower()
        base2 = Path(name2).stem.lower()
        
        # Check for common patterns
        if base1 in base2 or base2 in base1:
            return True
            
        # Check for related suffixes
        related_suffixes = [
            ('component', 'styles'),
            ('component', 'test'),
            ('service', 'types'),
            ('api', 'types')
        ]
        
        for suffix1, suffix2 in related_suffixes:
            if (suffix1 in base1 and suffix2 in base2) or \
               (suffix2 in base1 and suffix1 in base2):
                return True
                
        return False
    
    def generate_id(self, content: str) -> str:
        """Generate unique ID for content"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]


def main():
    """CLI interface for GitHub scanner"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scan GitHub repositories and generate power.status.json')
    parser.add_argument('--token', required=True, help='GitHub personal access token')
    parser.add_argument('--org', help='GitHub organization to scan')
    parser.add_argument('--repo', help='Specific repository to scan (format: owner/repo or just repo if org is set)')
    parser.add_argument('--output', default='./github-repos', help='Output directory (default: ./github-repos)')
    
    args = parser.parse_args()
    
    if not args.org and not args.repo:
        parser.error('Either --org or --repo must be specified')
    
    scanner = GitHubScanner(token=args.token, org=args.org)
    
    if args.repo:
        # Scan single repository
        scanner.scan_repository(args.repo, args.output)
    else:
        # Scan entire organization
        scanner.scan_organization(args.output)


if __name__ == '__main__':
    main()