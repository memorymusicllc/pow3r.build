#!/usr/bin/env python3
"""
Setup script for GitHub repository scanning and CloudFlare integration
"""

import os
import sys
import json
import subprocess
from pathlib import Path


def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def setup_github_scanner():
    """Setup GitHub scanner with token"""
    print_header("GitHub Scanner Setup")
    
    # Check for GitHub token
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print("❌ GITHUB_TOKEN environment variable not found!")
        print("\nTo set up GitHub access:")
        print("1. Go to https://github.com/settings/tokens")
        print("2. Generate a new token with 'repo' scope")
        print("3. Set the token:")
        print("   export GITHUB_TOKEN=your_token_here")
        return False
    
    print("✅ GitHub token found")
    
    # Test token
    try:
        import requests
        response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {token}'}
        )
        if response.ok:
            user = response.json()
            print(f"✅ Authenticated as: {user['login']}")
        else:
            print("❌ Invalid GitHub token")
            return False
    except Exception as e:
        print(f"❌ Error testing token: {e}")
        return False
    
    return True


def scan_github_repos():
    """Scan GitHub repositories"""
    print_header("Scanning GitHub Repositories")
    
    org = input("Enter GitHub organization name (or press Enter to skip): ").strip()
    repo = input("Enter specific repository (owner/repo format, or press Enter to scan all): ").strip()
    
    if not org and not repo:
        print("❌ Must specify either organization or repository")
        return False
    
    # Build command
    cmd = [
        sys.executable, 'github_scanner.py',
        '--token', os.environ.get('GITHUB_TOKEN'),
        '--output', './github-repos'
    ]
    
    if org:
        cmd.extend(['--org', org])
    if repo:
        cmd.extend(['--repo', repo])
    
    print(f"\n🔍 Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout)
            return True
        else:
            print(f"❌ Scanner failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running scanner: {e}")
        return False


def aggregate_data():
    """Aggregate all power.status.json files"""
    print_header("Aggregating Data")
    
    cmd = [sys.executable, 'data_aggregator.py']
    
    print(f"📊 Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout)
            
            # Check if data.json was created
            if Path('./public/data.json').exists():
                with open('./public/data.json', 'r') as f:
                    data = json.load(f)
                print(f"\n✅ Data aggregated successfully:")
                print(f"   - Projects: {data['summary']['totalProjects']}")
                print(f"   - Nodes: {data['summary']['totalNodes']}")
                print(f"   - Edges: {data['summary']['totalEdges']}")
                return True
        else:
            print(f"❌ Aggregator failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running aggregator: {e}")
        return False


def setup_cloudflare():
    """Setup CloudFlare workers"""
    print_header("CloudFlare Setup")
    
    print("To deploy to CloudFlare:")
    print("\n1. Install Wrangler CLI:")
    print("   npm install -g wrangler")
    
    print("\n2. Login to CloudFlare:")
    print("   wrangler login")
    
    print("\n3. Create KV namespaces:")
    print("   wrangler kv:namespace create REPO_SCANS")
    print("   wrangler kv:namespace create REPO_STATUS")
    print("   wrangler kv:namespace create POWER_STATUS")
    
    print("\n4. Create R2 bucket:")
    print("   wrangler r2 bucket create power-status-files")
    
    print("\n5. Update wrangler.toml with the IDs from step 3")
    
    print("\n6. Set secrets:")
    print("   wrangler secret put GITHUB_TOKEN")
    print("   wrangler secret put GITHUB_WEBHOOK_SECRET")
    
    print("\n7. Deploy:")
    print("   wrangler pages deploy public")
    
    print("\n8. Set up GitHub webhooks:")
    print("   - Go to your repository settings")
    print("   - Add webhook URL: https://thewatchmen.pages.dev/api/github-webhook")
    print("   - Select events: push, pull_request, issues, release")
    print("   - Set secret to match GITHUB_WEBHOOK_SECRET")
    
    return True


def start_local_server():
    """Start local development server"""
    print_header("Starting Local Server")
    
    print("Starting visualization at http://localhost:3000")
    print("Press Ctrl+C to stop\n")
    
    try:
        subprocess.run(['python', '-m', 'http.server', '3000'], cwd='public')
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")


def main():
    """Main setup flow"""
    print_header("Pow3r.build GitHub Integration Setup")
    
    steps = [
        ("1. Setup GitHub Scanner", setup_github_scanner),
        ("2. Scan GitHub Repositories", scan_github_repos),
        ("3. Aggregate Data", aggregate_data),
        ("4. CloudFlare Setup Guide", setup_cloudflare),
        ("5. Start Local Server", start_local_server)
    ]
    
    for step_name, step_func in steps:
        print(f"\n{step_name}...")
        
        if not step_func():
            print(f"\n❌ Setup failed at: {step_name}")
            if input("\nContinue anyway? (y/N): ").lower() != 'y':
                break
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Deploy to CloudFlare (see instructions above)")
    print("2. Configure GitHub webhooks")
    print("3. Access visualization at https://thewatchmen.pages.dev")


if __name__ == '__main__':
    main()