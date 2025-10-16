#!/usr/bin/env python3
"""
GitHub Scanner V3 Wrapper
- Runs existing GitHubScanner to produce power.status.json
- Converts to pow3r.v3.status.json
- Generates diagrams (Mermaid/Graphviz)
"""
import os
import json
from pathlib import Path
from typing import Optional

from github_scanner import GitHubScanner
from status_v3 import convert_power_to_v3, save_v3, to_mermaid, to_graphviz_dot


def scan_to_v3(token: str, org: Optional[str] = None, repo: Optional[str] = None, output_dir: str = './github-repos') -> None:
    scanner = GitHubScanner(token=token, org=org)

    if repo:
        # Single repository
        power = scanner.scan_repository(repo, output_dir)
        name = repo.split('/')[-1]
        repo_dir = Path(output_dir) / name
        power_path = repo_dir / 'power.status.json'
        if not power_path.exists():
            with open(power_path, 'w') as f:
                json.dump(power, f, indent=2)
        process_repo_dir(repo_dir)
    else:
        # Organization scan
        result = scanner.scan_organization(output_dir)
        for r in result.get('repositories', []):
            repo_dir = Path(r['path']).parent
            process_repo_dir(repo_dir)


def process_repo_dir(repo_dir: Path) -> None:
    power_path = repo_dir / 'power.status.json'
    if not power_path.exists():
        print(f"⚠️  Missing {power_path}")
        return

    with open(power_path, 'r') as f:
        power = json.load(f)

    v3 = convert_power_to_v3(power)
    v3_path = repo_dir / 'pow3r.v3.status.json'
    save_v3(v3, str(v3_path))

    # Generate diagrams
    (repo_dir / 'architecture.mmd').write_text(to_mermaid(v3))
    (repo_dir / 'architecture.dot').write_text(to_graphviz_dot(v3))

    print(f"✅ Generated v3 + diagrams in {repo_dir}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Scan GitHub and produce pow3r.v3.status.json + diagrams')
    parser.add_argument('--org', help='GitHub organization')
    parser.add_argument('--repo', help='Specific repository (owner/repo or repo if --org set)')
    parser.add_argument('--output', default='./github-repos', help='Output directory')
    args = parser.parse_args()

    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GITHUB_ACCESS_TOKEN')
    if not token:
        raise SystemExit('GITHUB_TOKEN environment variable not set')

    scan_to_v3(token=token, org=args.org, repo=args.repo, output_dir=args.output)


if __name__ == '__main__':
    main()
