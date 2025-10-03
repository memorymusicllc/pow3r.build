#!/usr/bin/env python3
"""
Run Comprehensive Analysis on All Selected Repositories
Generates pow3r.config.json, pow3r.config.canvas, pow3r.config.md for each
"""

import sys
from pathlib import Path
from comprehensive_analyzer import analyze_repository, load_api_keys_from_env
from phase1_analyzer import parse_selection_from_markdown


def main():
    print("\n" + "=" * 70)
    print("🚀 Comprehensive Repository Analysis")
    print("=" * 70 + "\n")
    
    # Load API keys
    api_keys = load_api_keys_from_env()
    print(f"✓ Loaded API keys: {', '.join([k for k, v in api_keys.items() if v])}\n")
    
    # Load selection
    if len(sys.argv) < 3:
        print("Usage: python run_comprehensive_analysis.py <markdown_file> <base_path>")
        sys.exit(1)
    
    md_file = sys.argv[1]
    base_path = sys.argv[2]
    
    print(f"📂 Loading selection from: {md_file}")
    repositories = parse_selection_from_markdown(md_file, base_path)
    
    if not repositories:
        print("❌ No repositories found")
        sys.exit(1)
    
    print(f"✓ Found {len(repositories)} repositories\n")
    print("=" * 70 + "\n")
    
    # Analyze each repository
    results = []
    for idx, repo in enumerate(repositories, 1):
        print(f"[{idx}/{len(repositories)}] {repo['name']}")
        
        try:
            outputs = analyze_repository(repo['path'], api_keys)
            results.append((repo, True, outputs))
        except Exception as e:
            print(f"  ❌ Error: {e}")
            results.append((repo, False, None))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 ANALYSIS COMPLETE")
    print("=" * 70 + "\n")
    
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]
    
    print(f"Total: {len(results)}")
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    
    if successful:
        print(f"\n✨ Generated for each successful repository:")
        print(f"  - pow3r.config.json (Three.js graph)")
        print(f"  - pow3r.config.canvas (Obsidian Canvas)")
        print(f"  - pow3r.config.md (Mermaid diagram)")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == '__main__':
    main()

