#!/usr/bin/env python3
"""
Setup GitHub Webhooks for All Repositories
Creates webhooks that trigger status updates on CloudFlare Workers
"""

import os
import sys
import requests
import json


def setup_webhook_for_repo(repo_full_name, webhook_url, secret, token):
    """Setup webhook for a single repository"""
    
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    # Check if webhook already exists
    webhooks_response = requests.get(
        f'https://api.github.com/repos/{repo_full_name}/hooks',
        headers=headers
    )
    
    if webhooks_response.status_code != 200:
        print(f'  ❌ Failed to fetch webhooks: {webhooks_response.status_code}')
        return False
    
    existing_webhooks = webhooks_response.json()
    
    # Check if our webhook URL already exists
    for hook in existing_webhooks:
        if hook['config'].get('url') == webhook_url:
            print(f'  ✓ Webhook already exists (id: {hook["id"]})')
            return True
    
    # Create new webhook
    webhook_config = {
        'name': 'web',
        'active': True,
        'events': [
            'push',
            'pull_request',
            'release',
            'create',
            'delete',
            'repository'
        ],
        'config': {
            'url': webhook_url,
            'content_type': 'json',
            'secret': secret,
            'insecure_ssl': '0'
        }
    }
    
    response = requests.post(
        f'https://api.github.com/repos/{repo_full_name}/hooks',
        headers=headers,
        json=webhook_config
    )
    
    if response.status_code == 201:
        hook_data = response.json()
        print(f'  ✓ Webhook created (id: {hook_data["id"]})')
        return True
    else:
        print(f'  ❌ Failed to create webhook: {response.status_code}')
        print(f'     {response.text}')
        return False


def setup_webhooks_for_all_repos(webhook_url, secret, token, username=None, org=None):
    """Setup webhooks for all repositories"""
    
    print(f"\n🔗 Setting up GitHub Webhooks")
    print(f"Webhook URL: {webhook_url}")
    print("=" * 70 + "\n")
    
    # Get all repositories
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    repos = []
    page = 1
    
    while True:
        if org:
            url = f'https://api.github.com/orgs/{org}/repos'
        elif username:
            url = f'https://api.github.com/users/{username}/repos'
        else:
            url = 'https://api.github.com/user/repos'
        
        response = requests.get(
            url,
            headers=headers,
            params={'page': page, 'per_page': 100}
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to fetch repositories: {response.status_code}")
            sys.exit(1)
        
        page_repos = response.json()
        if not page_repos:
            break
        
        repos.extend(page_repos)
        page += 1
    
    print(f"Found {len(repos)} repositories\n")
    
    # Setup webhook for each repo
    results = []
    for idx, repo in enumerate(repos, 1):
        print(f"[{idx}/{len(repos)}] {repo['full_name']}")
        
        # Skip if no admin permission
        if not repo['permissions'].get('admin', False):
            print(f"  ⚠️  No admin permission, skipping")
            results.append((repo['full_name'], False, 'no_permission'))
            continue
        
        success = setup_webhook_for_repo(
            repo['full_name'],
            webhook_url,
            secret,
            token
        )
        
        results.append((repo['full_name'], success, 'created' if success else 'failed'))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 SETUP COMPLETE")
    print("=" * 70)
    
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1] and r[2] != 'no_permission']
    skipped = [r for r in results if r[2] == 'no_permission']
    
    print(f"Total: {len(results)}")
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    print(f"⚠️  Skipped (no permission): {len(skipped)}")
    
    if failed:
        print(f"\nFailed repositories:")
        for repo_name, _, _ in failed:
            print(f"  - {repo_name}")
    
    print("\n" + "=" * 70 + "\n")


def main():
    # Get configuration
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        if len(sys.argv) > 1:
            token = sys.argv[1]
        else:
            print("❌ GitHub token required")
            print("Usage: python setup_github_webhooks.py [token] [webhook_url] [secret]")
            print("Or set GITHUB_TOKEN, WEBHOOK_URL, WEBHOOK_SECRET environment variables")
            sys.exit(1)
    
    webhook_url = os.environ.get('WEBHOOK_URL')
    if not webhook_url:
        if len(sys.argv) > 2:
            webhook_url = sys.argv[2]
        else:
            print("❌ Webhook URL required")
            print("Example: https://your-domain.pages.dev/api/github-webhook")
            sys.exit(1)
    
    secret = os.environ.get('WEBHOOK_SECRET')
    if not secret:
        if len(sys.argv) > 3:
            secret = sys.argv[3]
        else:
            # Generate a random secret
            import secrets
            secret = secrets.token_urlsafe(32)
            print(f"Generated webhook secret: {secret}")
            print("⚠️  Save this secret and add it to your CloudFlare KV as GITHUB_WEBHOOK_SECRET")
    
    username = os.environ.get('GITHUB_USERNAME')
    org = os.environ.get('GITHUB_ORG')
    
    # Setup webhooks
    setup_webhooks_for_all_repos(webhook_url, secret, token, username, org)


if __name__ == '__main__':
    main()
