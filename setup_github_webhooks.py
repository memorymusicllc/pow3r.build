#!/usr/bin/env python3
"""
Setup GitHub Webhooks for automatic power.status.json updates
"""

import requests
import json
import argparse
from typing import List, Dict


class GitHubWebhookSetup:
    """Setup webhooks for GitHub repositories"""
    
    def __init__(self, token: str, webhook_url: str, secret: str):
        self.token = token
        self.webhook_url = webhook_url
        self.secret = secret
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        })
        self.base_url = 'https://api.github.com'
        
    def setup_webhook(self, repo_full_name: str) -> Dict:
        """Setup webhook for a single repository"""
        print(f"🔧 Setting up webhook for: {repo_full_name}")
        
        # Check if webhook already exists
        existing = self.get_existing_webhook(repo_full_name)
        if existing:
            print(f"  ✅ Webhook already exists (ID: {existing['id']})")
            return existing
            
        # Create new webhook
        webhook_config = {
            'name': 'web',
            'active': True,
            'events': [
                'push',
                'pull_request',
                'issues',
                'release',
                'repository'
            ],
            'config': {
                'url': self.webhook_url,
                'content_type': 'json',
                'secret': self.secret,
                'insecure_ssl': '0'
            }
        }
        
        response = self.session.post(
            f"{self.base_url}/repos/{repo_full_name}/hooks",
            json=webhook_config
        )
        
        if response.status_code == 201:
            webhook = response.json()
            print(f"  ✅ Webhook created successfully (ID: {webhook['id']})")
            return webhook
        else:
            print(f"  ❌ Failed to create webhook: {response.status_code}")
            print(f"     {response.json().get('message', 'Unknown error')}")
            return None
            
    def get_existing_webhook(self, repo_full_name: str) -> Dict:
        """Check if webhook already exists"""
        response = self.session.get(f"{self.base_url}/repos/{repo_full_name}/hooks")
        
        if response.status_code != 200:
            return None
            
        webhooks = response.json()
        for webhook in webhooks:
            if webhook.get('config', {}).get('url') == self.webhook_url:
                return webhook
                
        return None
        
    def setup_org_webhooks(self, org: str) -> List[Dict]:
        """Setup webhooks for all repositories in an organization"""
        print(f"🏢 Setting up webhooks for organization: {org}")
        
        # Get all repositories
        repos = []
        page = 1
        
        while True:
            response = self.session.get(
                f"{self.base_url}/orgs/{org}/repos",
                params={'page': page, 'per_page': 100}
            )
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch repositories: {response.status_code}")
                break
                
            batch = response.json()
            if not batch:
                break
                
            repos.extend(batch)
            page += 1
            
        print(f"📦 Found {len(repos)} repositories")
        
        # Setup webhook for each repository
        results = []
        for repo in repos:
            result = self.setup_webhook(repo['full_name'])
            if result:
                results.append(result)
                
        print(f"\n✅ Successfully set up {len(results)} webhooks")
        return results
        
    def test_webhook(self, repo_full_name: str, webhook_id: int):
        """Send a test ping to the webhook"""
        print(f"🏓 Testing webhook for {repo_full_name}...")
        
        response = self.session.post(
            f"{self.base_url}/repos/{repo_full_name}/hooks/{webhook_id}/pings"
        )
        
        if response.status_code == 204:
            print("  ✅ Test ping sent successfully!")
        else:
            print(f"  ❌ Test failed: {response.status_code}")
            
    def list_webhooks(self, repo_full_name: str):
        """List all webhooks for a repository"""
        response = self.session.get(f"{self.base_url}/repos/{repo_full_name}/hooks")
        
        if response.status_code != 200:
            print(f"❌ Failed to list webhooks: {response.status_code}")
            return
            
        webhooks = response.json()
        print(f"\n📋 Webhooks for {repo_full_name}:")
        
        for webhook in webhooks:
            print(f"\n  ID: {webhook['id']}")
            print(f"  URL: {webhook['config'].get('url', 'N/A')}")
            print(f"  Events: {', '.join(webhook['events'])}")
            print(f"  Active: {'✅' if webhook['active'] else '❌'}")
            
            if webhook.get('last_response'):
                status = webhook['last_response'].get('status', 'N/A')
                print(f"  Last Response: {status}")


def main():
    """CLI interface for webhook setup"""
    parser = argparse.ArgumentParser(description='Setup GitHub webhooks for automatic updates')
    parser.add_argument('--token', required=True, help='GitHub personal access token')
    parser.add_argument('--webhook-url', required=True, 
                       help='CloudFlare worker webhook URL (e.g., https://your-worker.workers.dev/api/github-webhook)')
    parser.add_argument('--secret', required=True, help='Webhook secret for verification')
    parser.add_argument('--org', help='GitHub organization')
    parser.add_argument('--repo', help='Single repository (format: owner/repo)')
    parser.add_argument('--list', action='store_true', help='List existing webhooks')
    parser.add_argument('--test', type=int, help='Test webhook by ID')
    
    args = parser.parse_args()
    
    if not args.org and not args.repo:
        parser.error('Either --org or --repo must be specified')
        
    setup = GitHubWebhookSetup(args.token, args.webhook_url, args.secret)
    
    if args.list:
        if args.repo:
            setup.list_webhooks(args.repo)
        else:
            print("Please specify --repo to list webhooks")
    elif args.test and args.repo:
        setup.test_webhook(args.repo, args.test)
    elif args.repo:
        setup.setup_webhook(args.repo)
    elif args.org:
        setup.setup_org_webhooks(args.org)
        
    print("\n🎉 Webhook setup complete!")
    print("\nNext steps:")
    print("1. Deploy the CloudFlare workers using: wrangler publish")
    print("2. Configure CloudFlare KV namespaces:")
    print("   - REPO_SCANS")
    print("   - REPO_STATUS")
    print("   - POWER_STATUS")
    print("3. Set CloudFlare secrets:")
    print("   - GITHUB_TOKEN")
    print("   - GITHUB_WEBHOOK_SECRET")
    print("4. Test the webhook using --test flag")


if __name__ == '__main__':
    main()