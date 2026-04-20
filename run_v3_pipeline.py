#!/usr/bin/env python3
"""
Run the v3 pipeline end-to-end:
1) Scan GitHub org/repo → power.status.json (via GitHubScanner)
2) Convert to pow3r.v3.status.json
3) Generate Mermaid and Graphviz diagrams
"""
import os
from pathlib import Path

from github_scanner_v3 import scan_to_v3


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Pow3r v3 pipeline runner')
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
