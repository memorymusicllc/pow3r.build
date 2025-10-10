#!/usr/bin/env python3
"""
Run the complete GitHub integration workflow
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime


def run_command(cmd, description):
    """Run a command and handle output"""
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}")
    print(f"$ {cmd}")
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print(result.stdout)
            
        if result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
            
        print(f"✅ Success!")
        return True
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False


def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...")
    
    # Check Python modules
    required_modules = ['requests', 'pathlib']
    missing_modules = []
    
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            missing_modules.append(module)
            
    if missing_modules:
        print(f"❌ Missing Python modules: {', '.join(missing_modules)}")
        print("   Run: pip install -r requirements.txt")
        return False
        
    # Check for GitHub token
    if not os.environ.get('GITHUB_TOKEN'):
        print("❌ GITHUB_TOKEN environment variable not set")
        print("   Export your GitHub personal access token:")
        print("   export GITHUB_TOKEN=your_token_here")
        return False
        
    print("✅ All requirements met!")
    return True


def scan_repositories(org=None, repo=None):
    """Run GitHub scanner"""
    token = os.environ.get('GITHUB_TOKEN')
    
    if repo:
        cmd = f"python github_scanner.py --token {token} --repo {repo}"
        description = f"Scanning repository: {repo}"
    elif org:
        cmd = f"python github_scanner.py --token {token} --org {org}"
        description = f"Scanning organization: {org}"
    else:
        print("❌ Either --org or --repo must be specified")
        return False
        
    return run_command(cmd, description)


def aggregate_data():
    """Run data aggregator"""
    cmd = "python data_aggregator.py"
    description = "Aggregating power.status.json files"
    return run_command(cmd, description)


def start_local_server():
    """Start local development server"""
    print("\n🌐 Starting local server...")
    print("   Visit: http://localhost:3000")
    print("   Press Ctrl+C to stop")
    
    try:
        subprocess.run("python -m http.server 3000 --directory public", shell=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")


def display_summary():
    """Display summary of generated data"""
    data_file = Path("public/data.json")
    
    if not data_file.exists():
        print("⚠️  No data.json file found")
        return
        
    with open(data_file, 'r') as f:
        data = json.load(f)
        
    if data.get('success'):
        summary = data.get('summary', {})
        print("\n📊 Summary:")
        print(f"   Total Projects: {summary.get('totalProjects', 0)}")
        print(f"   Total Nodes: {summary.get('totalNodes', 0)}")
        print(f"   Total Edges: {summary.get('totalEdges', 0)}")
        print(f"   Sources: {', '.join(summary.get('sources', []))}")
        
        # Show project breakdown
        if data.get('projects'):
            print("\n📦 Projects:")
            for project in data['projects']:
                status_icon = {
                    'green': '🟢',
                    'orange': '🟠',
                    'red': '🔴',
                    'gray': '⚫'
                }.get(project['status'], '⚪')
                
                print(f"   {status_icon} {project['name']}")
                print(f"      Nodes: {project['metrics']['nodeCount']}")
                print(f"      Activity: {project['metrics']['totalActivity']}")
                print(f"      Quality: {project['metrics']['avgQuality']:.1%}")


def setup_cloudflare():
    """Guide for CloudFlare setup"""
    print("\n☁️  CloudFlare Setup Guide:")
    print("\n1. Create KV namespaces:")
    print("   wrangler kv:namespace create 'REPO_SCANS'")
    print("   wrangler kv:namespace create 'REPO_STATUS'")
    print("   wrangler kv:namespace create 'POWER_STATUS'")
    
    print("\n2. Add namespace IDs to wrangler.toml")
    
    print("\n3. Set secrets:")
    print("   wrangler secret put GITHUB_TOKEN")
    print("   wrangler secret put GITHUB_WEBHOOK_SECRET")
    
    print("\n4. Deploy:")
    print("   wrangler pages publish")
    
    print("\n5. Setup webhooks:")
    print("   python setup_github_webhooks.py --token $GITHUB_TOKEN \\")
    print("     --webhook-url https://thewatchmen.pages.dev/api/github-webhook \\")
    print("     --secret your-webhook-secret \\")
    print("     --org your-org")


def main():
    """Main workflow runner"""
    parser = argparse.ArgumentParser(description='Run GitHub integration workflow')
    parser.add_argument('--org', help='GitHub organization to scan')
    parser.add_argument('--repo', help='Single repository to scan')
    parser.add_argument('--server', action='store_true', help='Start local server after scanning')
    parser.add_argument('--cloudflare', action='store_true', help='Show CloudFlare setup guide')
    parser.add_argument('--skip-scan', action='store_true', help='Skip scanning, only aggregate existing data')
    
    args = parser.parse_args()
    
    print("🎯 Pow3r.build GitHub Integration Workflow")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check requirements
    if not args.cloudflare and not check_requirements():
        sys.exit(1)
        
    # Show CloudFlare guide if requested
    if args.cloudflare:
        setup_cloudflare()
        return
        
    # Run workflow
    success = True
    
    if not args.skip_scan:
        if not args.org and not args.repo:
            print("❌ Either --org or --repo must be specified")
            sys.exit(1)
            
        success = scan_repositories(args.org, args.repo)
        
    if success:
        success = aggregate_data()
        
    if success:
        display_summary()
        
    if success and args.server:
        start_local_server()
        
    print(f"\n{'='*60}")
    if success:
        print("✅ Workflow completed successfully!")
        print("\nNext steps:")
        print("1. View the visualization at http://localhost:3000")
        print("2. Deploy to CloudFlare with --cloudflare flag")
    else:
        print("❌ Workflow failed. Check the errors above.")
        
    print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == '__main__':
    main()