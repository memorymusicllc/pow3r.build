#!/usr/bin/env python3
"""
Local Repository Analysis & Generation Tool (CLI)
Phase 0: Local Repository Selection

This tool scans for Git repositories in a directory tree and allows
interactive selection of repositories for analysis.

Usage:
    python analyze.py ~/dev/projects
    python analyze.py /Users/creator/Documents/DEV
"""

import os
import sys
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple
import json
from datetime import datetime


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


class RepositoryScanner:
    """Scans directory tree for Git repositories"""
    
    def __init__(self, root_path: str):
        self.root_path = Path(root_path).expanduser().resolve()
        self.repositories: List[Dict] = []
        
    def scan(self) -> List[Dict]:
        """Recursively scan for Git repositories"""
        print(f"{Colors.OKBLUE}🔍 Scanning for Git repositories in: {self.root_path}{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Please wait...{Colors.ENDC}\n")
        
        try:
            for dirpath, dirnames, filenames in os.walk(self.root_path):
                # Skip hidden directories except .git
                dirnames[:] = [d for d in dirnames if not d.startswith('.') or d == '.git']
                
                # Check if current directory contains .git
                if '.git' in dirnames:
                    repo_info = self._analyze_repository(dirpath)
                    if repo_info:
                        self.repositories.append(repo_info)
                    # Don't recurse into .git directory
                    dirnames.remove('.git')
                    
        except PermissionError as e:
            print(f"{Colors.WARNING}⚠️  Permission denied: {e}{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.FAIL}❌ Error during scan: {e}{Colors.ENDC}")
            
        return self.repositories
    
    def _analyze_repository(self, repo_path: str) -> Dict:
        """Analyze a single repository and gather metadata"""
        try:
            repo_path_obj = Path(repo_path)
            
            # Get repository name
            repo_name = repo_path_obj.name
            
            # Get Git information
            git_info = self._get_git_info(repo_path)
            
            # Get file statistics
            file_stats = self._get_file_stats(repo_path)
            
            # Get last commit date
            last_commit = self._get_last_commit_date(repo_path)
            
            return {
                'name': repo_name,
                'path': str(repo_path_obj),
                'relative_path': str(repo_path_obj.relative_to(self.root_path)),
                'branch': git_info.get('branch', 'unknown'),
                'remote': git_info.get('remote', 'none'),
                'last_commit': last_commit,
                'file_count': file_stats.get('total_files', 0),
                'size_mb': file_stats.get('size_mb', 0),
            }
        except Exception as e:
            print(f"{Colors.WARNING}⚠️  Could not analyze {repo_path}: {e}{Colors.ENDC}")
            return None
    
    def _get_git_info(self, repo_path: str) -> Dict:
        """Get Git branch and remote information"""
        info = {}
        try:
            # Get current branch
            result = subprocess.run(
                ['git', '-C', repo_path, 'rev-parse', '--abbrev-ref', 'HEAD'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['branch'] = result.stdout.strip()
            
            # Get remote URL
            result = subprocess.run(
                ['git', '-C', repo_path, 'config', '--get', 'remote.origin.url'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                info['remote'] = result.stdout.strip()
                
        except Exception:
            pass
            
        return info
    
    def _get_last_commit_date(self, repo_path: str) -> str:
        """Get the date of the last commit"""
        try:
            result = subprocess.run(
                ['git', '-C', repo_path, 'log', '-1', '--format=%ci'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception:
            pass
        return 'unknown'
    
    def _get_file_stats(self, repo_path: str) -> Dict:
        """Get file count and size statistics"""
        stats = {'total_files': 0, 'size_mb': 0}
        try:
            total_size = 0
            file_count = 0
            
            for dirpath, dirnames, filenames in os.walk(repo_path):
                # Skip .git directory
                if '.git' in dirpath:
                    continue
                    
                file_count += len(filenames)
                for filename in filenames:
                    try:
                        filepath = os.path.join(dirpath, filename)
                        total_size += os.path.getsize(filepath)
                    except (OSError, PermissionError):
                        pass
            
            stats['total_files'] = file_count
            stats['size_mb'] = round(total_size / (1024 * 1024), 2)
        except Exception:
            pass
            
        return stats


class InteractiveSelector:
    """Interactive CLI for repository selection"""
    
    def __init__(self, repositories: List[Dict]):
        self.repositories = sorted(repositories, key=lambda x: x['last_commit'], reverse=True)
        self.selected_indices = set()
        
    def display_repositories(self):
        """Display all found repositories with numbering"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}Found {len(self.repositories)} Git repositories:{Colors.ENDC}\n")
        
        for idx, repo in enumerate(self.repositories, 1):
            selected = "✓" if idx in self.selected_indices else " "
            print(f"{Colors.OKGREEN}[{selected}]{Colors.ENDC} {idx:3d}. {Colors.BOLD}{repo['name']}{Colors.ENDC}")
            print(f"      Path: {repo['relative_path']}")
            print(f"      Branch: {repo['branch']} | Files: {repo['file_count']} | Size: {repo['size_mb']} MB")
            print(f"      Last commit: {repo['last_commit']}")
            print()
    
    def interactive_select(self) -> List[Dict]:
        """Run interactive selection interface"""
        self.display_repositories()
        
        print(f"{Colors.OKCYAN}{Colors.BOLD}Selection Options:{Colors.ENDC}")
        print("  • Enter numbers (e.g., 1 3 5) to select specific repositories")
        print("  • Enter range (e.g., 1-5) to select a range")
        print("  • Enter 'all' to select all repositories")
        print("  • Enter 'none' to clear selection")
        print("  • Enter 'done' when finished selecting")
        print("  • Enter 'quit' or 'q' to exit\n")
        
        while True:
            try:
                user_input = input(f"{Colors.OKBLUE}➜ Select repositories: {Colors.ENDC}").strip().lower()
                
                if user_input in ['quit', 'q', 'exit']:
                    print(f"{Colors.WARNING}Exiting...{Colors.ENDC}")
                    sys.exit(0)
                    
                if user_input == 'done':
                    break
                    
                if user_input == 'all':
                    self.selected_indices = set(range(1, len(self.repositories) + 1))
                    print(f"{Colors.OKGREEN}✓ Selected all {len(self.repositories)} repositories{Colors.ENDC}")
                    continue
                    
                if user_input == 'none':
                    self.selected_indices.clear()
                    print(f"{Colors.WARNING}Cleared all selections{Colors.ENDC}")
                    continue
                
                # Parse selection
                self._parse_selection(user_input)
                print(f"{Colors.OKGREEN}✓ Currently selected: {len(self.selected_indices)} repositories{Colors.ENDC}")
                
            except KeyboardInterrupt:
                print(f"\n{Colors.WARNING}Interrupted by user{Colors.ENDC}")
                sys.exit(0)
            except Exception as e:
                print(f"{Colors.FAIL}❌ Error: {e}{Colors.ENDC}")
        
        # Return selected repositories
        selected_repos = [
            self.repositories[idx - 1] 
            for idx in sorted(self.selected_indices)
        ]
        
        return selected_repos
    
    def _parse_selection(self, user_input: str):
        """Parse user selection input"""
        parts = user_input.replace(',', ' ').split()
        
        for part in parts:
            if '-' in part:
                # Range selection
                try:
                    start, end = map(int, part.split('-'))
                    for i in range(start, end + 1):
                        if 1 <= i <= len(self.repositories):
                            self.selected_indices.add(i)
                except ValueError:
                    print(f"{Colors.WARNING}Invalid range: {part}{Colors.ENDC}")
            else:
                # Single number
                try:
                    num = int(part)
                    if 1 <= num <= len(self.repositories):
                        self.selected_indices.add(num)
                    else:
                        print(f"{Colors.WARNING}Number out of range: {num}{Colors.ENDC}")
                except ValueError:
                    print(f"{Colors.WARNING}Invalid input: {part}{Colors.ENDC}")


def save_selection(repositories: List[Dict], output_dir: str = None):
    """Save selected repositories to a JSON file"""
    if not repositories:
        print(f"{Colors.WARNING}No repositories selected to save{Colors.ENDC}")
        return None
        
    if output_dir is None:
        output_dir = Path.cwd()
    else:
        output_dir = Path(output_dir)
        
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f'selected_repositories_{timestamp}.json'
    
    output_data = {
        'timestamp': datetime.now().isoformat(),
        'total_selected': len(repositories),
        'repositories': repositories
    }
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n{Colors.OKGREEN}✓ Saved selection to: {output_file}{Colors.ENDC}")
    return output_file


def display_summary(repositories: List[Dict]):
    """Display summary of selected repositories"""
    if not repositories:
        print(f"\n{Colors.WARNING}No repositories selected{Colors.ENDC}")
        return
        
    print(f"\n{Colors.HEADER}{Colors.BOLD}={'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}SELECTION SUMMARY{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}={'=' * 70}{Colors.ENDC}\n")
    
    total_files = sum(repo['file_count'] for repo in repositories)
    total_size = sum(repo['size_mb'] for repo in repositories)
    
    print(f"Total repositories selected: {Colors.BOLD}{len(repositories)}{Colors.ENDC}")
    print(f"Total files: {Colors.BOLD}{total_files:,}{Colors.ENDC}")
    print(f"Total size: {Colors.BOLD}{total_size:.2f} MB{Colors.ENDC}\n")
    
    print(f"{Colors.OKCYAN}Selected repositories:{Colors.ENDC}")
    for idx, repo in enumerate(repositories, 1):
        print(f"  {idx}. {Colors.BOLD}{repo['name']}{Colors.ENDC} ({repo['relative_path']})")


def main():
    """Main entry point"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}Local Repository Analysis & Generation Tool{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}Phase 0: Repository Selection{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")
    
    # Get root directory from command line argument
    if len(sys.argv) < 2:
        print(f"{Colors.FAIL}❌ Error: Root directory path required{Colors.ENDC}")
        print(f"\nUsage: {Colors.BOLD}python analyze.py <root_directory>{Colors.ENDC}")
        print(f"Example: {Colors.OKCYAN}python analyze.py ~/dev/projects{Colors.ENDC}")
        sys.exit(1)
    
    root_path = sys.argv[1]
    
    # Validate path
    if not os.path.isdir(os.path.expanduser(root_path)):
        print(f"{Colors.FAIL}❌ Error: Directory does not exist: {root_path}{Colors.ENDC}")
        sys.exit(1)
    
    # Phase 1: Scan for repositories
    scanner = RepositoryScanner(root_path)
    repositories = scanner.scan()
    
    if not repositories:
        print(f"{Colors.WARNING}No Git repositories found in: {root_path}{Colors.ENDC}")
        sys.exit(0)
    
    print(f"{Colors.OKGREEN}✓ Found {len(repositories)} repositories{Colors.ENDC}\n")
    
    # Phase 2: Interactive selection
    selector = InteractiveSelector(repositories)
    selected_repositories = selector.interactive_select()
    
    # Phase 3: Display summary
    display_summary(selected_repositories)
    
    # Phase 4: Save selection
    if selected_repositories:
        output_dir = Path(root_path) / '.repo-analyzer'
        save_selection(selected_repositories, output_dir)
        
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Repository selection complete!{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Ready to proceed to Phase 1: Analysis{Colors.ENDC}\n")
    else:
        print(f"\n{Colors.WARNING}No repositories selected. Exiting.{Colors.ENDC}\n")


if __name__ == '__main__':
    main()

