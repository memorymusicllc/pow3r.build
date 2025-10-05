#!/usr/bin/env python3
"""
Run Architecture Review Workflow on All Selected Repositories
Uses deep code analysis instead of simple folder scanning
"""

import sys
from phase1_analyzer import parse_selection_from_markdown
from architecture_review_workflow import run_architecture_review


def main():
    print("\n" + "="*70)
    print("🏗️  ARCHITECTURE REVIEW WORKFLOW - ALL REPOSITORIES")
    print("="*70 + "\n")
    
    if len(sys.argv) < 3:
        print("Usage: python run_architecture_review_all.py <markdown> <base_path>")
        sys.exit(1)
    
    md_file = sys.argv[1]
    base_path = sys.argv[2]
    
    # Load selection
    repos = parse_selection_from_markdown(md_file, base_path)
    
    if not repos:
        print("❌ No repositories found")
        sys.exit(1)
    
    print(f"✓ Found {len(repos)} repositories\n")
    print("="*70 + "\n")
    
    # Run workflow on each
    results = []
    for idx, repo in enumerate(repos, 1):
        print(f"\n[{idx}/{len(repos)}] Processing...")
        
        try:
            outputs = run_architecture_review(repo['path'])
            results.append((repo, True, outputs))
            print(f"✅ {repo['name']}: SUCCESS")
        except Exception as e:
            print(f"❌ {repo['name']}: FAILED - {e}")
            results.append((repo, False, None))
    
    # Summary
    print("\n" + "="*70)
    print("📊 WORKFLOW COMPLETE")
    print("="*70 + "\n")
    
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]
    
    print(f"Total: {len(results)}")
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    
    if successful:
        print(f"\n✨ Generated for each repository:")
        print(f"  - pow3r.config.json (Deep analysis)")
        print(f"  - pow3r.config.canvas (Obsidian)")
        print(f"  - pow3r.config.md (Mermaid)")
    
    print("\n" + "="*70 + "\n")


if __name__ == '__main__':
    main()
