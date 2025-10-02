#!/usr/bin/env python3
"""
Local Repository Analysis & Generation Tool (CLI)
Phase 1 Execution Script

Runs Phase 1 analysis on selected repositories.

Usage:
    python run_phase1.py --json <path-to-selection.json>
    python run_phase1.py --markdown <path-to-selection.md> --base-path <repos-base-path>
"""

import sys
import argparse
from pathlib import Path
from phase1_analyzer import (
    Colors,
    RepositoryAnalyzer,
    load_selection_from_json,
    parse_selection_from_markdown,
    display_analysis_summary
)


def main():
    """Main entry point for Phase 1 analysis"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}Local Repository Analysis & Generation Tool{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}Phase 1: Repository Analysis & Data Generation{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Analyze selected repositories and generate dev-status.config.json files'
    )
    
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument(
        '--json',
        type=str,
        help='Path to JSON selection file from Phase 0'
    )
    input_group.add_argument(
        '--markdown',
        type=str,
        help='Path to markdown selection file'
    )
    
    parser.add_argument(
        '--base-path',
        type=str,
        help='Base path for repositories (required with --markdown)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Analyze without saving config files'
    )
    
    args = parser.parse_args()
    
    # Load repository selection
    repositories = []
    
    if args.json:
        print(f"{Colors.OKBLUE}📂 Loading selection from JSON...{Colors.ENDC}")
        repositories = load_selection_from_json(args.json)
        
    elif args.markdown:
        if not args.base_path:
            print(f"{Colors.FAIL}❌ --base-path is required when using --markdown{Colors.ENDC}")
            sys.exit(1)
        
        print(f"{Colors.OKBLUE}📂 Loading selection from Markdown...{Colors.ENDC}")
        repositories = parse_selection_from_markdown(args.markdown, args.base_path)
    
    if not repositories:
        print(f"{Colors.WARNING}No repositories to analyze{Colors.ENDC}")
        sys.exit(0)
    
    print(f"{Colors.OKGREEN}✓ Loaded {len(repositories)} repositories{Colors.ENDC}")
    
    if args.dry_run:
        print(f"{Colors.WARNING}⚠️  DRY RUN MODE - Config files will not be saved{Colors.ENDC}")
    
    # Analyze each repository
    print(f"\n{Colors.HEADER}{Colors.BOLD}Starting Analysis...{Colors.ENDC}\n")
    
    results = []
    for idx, repo_info in enumerate(repositories, 1):
        print(f"{Colors.OKCYAN}[{idx}/{len(repositories)}]{Colors.ENDC}", end=' ')
        
        analyzer = RepositoryAnalyzer(repo_info)
        success, config = analyzer.analyze()
        
        results.append((repo_info, success, config))
    
    # Display summary
    display_analysis_summary(results)
    
    # Report completion
    print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Phase 1 Analysis Complete!{Colors.ENDC}")
    
    successful_configs = [config for _, success, config in results if success and config]
    if successful_configs:
        print(f"{Colors.OKCYAN}Generated {len(successful_configs)} dev-status.config.json files{Colors.ENDC}")
        print(f"{Colors.OKCYAN}Ready to proceed to Phase 2: 3D Visualization{Colors.ENDC}\n")


if __name__ == '__main__':
    main()

