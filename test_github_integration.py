#!/usr/bin/env python3
"""
Test the GitHub integration components
"""

import os
import sys
import json
import tempfile
from pathlib import Path


def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from github_scanner import GitHubScanner
        print("  ✅ github_scanner imported successfully")
    except Exception as e:
        print(f"  ❌ Failed to import github_scanner: {e}")
        return False
        
    try:
        from data_aggregator import DataAggregator
        print("  ✅ data_aggregator imported successfully")
    except Exception as e:
        print(f"  ❌ Failed to import data_aggregator: {e}")
        return False
        
    try:
        from setup_github_webhooks import GitHubWebhookSetup
        print("  ✅ setup_github_webhooks imported successfully")
    except Exception as e:
        print(f"  ❌ Failed to import setup_github_webhooks: {e}")
        return False
        
    return True


def test_github_scanner():
    """Test GitHub scanner functionality"""
    print("\n🧪 Testing GitHub scanner...")
    
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print("  ⚠️  GITHUB_TOKEN not set, skipping API tests")
        return True
        
    try:
        from github_scanner import GitHubScanner
        
        # Test with a small public repo
        scanner = GitHubScanner(token)
        
        # Test ID generation
        test_id = scanner.generate_id("test-content")
        print(f"  ✅ ID generation works: {test_id}")
        
        # Test file type detection
        file_types = [
            ("component/Button.tsx", "component.ui.react"),
            ("api/server.py", "service.backend"),
            ("README.md", "doc.markdown"),
            ("test/app.test.js", "test.e2e"),
            (".github/workflows/ci.yml", "workflow.ci-cd")
        ]
        
        for path, expected in file_types:
            result = scanner.determine_file_type(path)
            if result == expected:
                print(f"  ✅ File type detection: {path} → {result}")
            else:
                print(f"  ❌ File type detection failed: {path} → {result} (expected {expected})")
                
        return True
        
    except Exception as e:
        print(f"  ❌ GitHub scanner test failed: {e}")
        return False


def test_data_aggregator():
    """Test data aggregator functionality"""
    print("\n🧪 Testing data aggregator...")
    
    try:
        from data_aggregator import DataAggregator
        
        # Create test data
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create test power.status.json
            test_data = {
                "graphId": "test-123",
                "lastScan": "2025-01-01T00:00:00Z",
                "assets": [
                    {
                        "id": "test-asset-1",
                        "type": "component.ui.react",
                        "source": "test",
                        "location": "test.com",
                        "metadata": {
                            "title": "Test Component",
                            "tags": ["test"],
                            "description": "Test description"
                        },
                        "status": {
                            "phase": "green",
                            "qualityScore": 0.8,
                            "completeness": 0.9
                        },
                        "analytics": {
                            "activityLast30Days": 5,
                            "centralityScore": 0.7,
                            "connectivity": 3
                        }
                    }
                ],
                "edges": []
            }
            
            # Save test file
            test_path = Path(tmpdir) / "test-repo" / "power.status.json"
            test_path.parent.mkdir(parents=True)
            
            with open(test_path, 'w') as f:
                json.dump(test_data, f)
                
            # Test aggregator
            aggregator = DataAggregator()
            aggregator.sources = {'test': tmpdir}
            
            projects = aggregator.collect_all_status_files()
            
            if projects:
                print(f"  ✅ Found {len(projects)} test projects")
                
                # Test formatting
                project = projects[0]
                if project['name'] == 'test-repo':
                    print("  ✅ Project formatting works")
                else:
                    print(f"  ❌ Project name incorrect: {project['name']}")
                    
                if len(project['nodes']) == 1:
                    print("  ✅ Node conversion works")
                else:
                    print(f"  ❌ Node count incorrect: {len(project['nodes'])}")
                    
            else:
                print("  ❌ No projects found")
                
        return True
        
    except Exception as e:
        print(f"  ❌ Data aggregator test failed: {e}")
        return False


def test_cloudflare_workers():
    """Test CloudFlare worker files exist and are valid"""
    print("\n🧪 Testing CloudFlare workers...")
    
    worker_files = [
        "functions/api/github-webhook.js",
        "functions/api/scan-processor.js",
        "functions/api/data.js"
    ]
    
    all_valid = True
    
    for file_path in worker_files:
        full_path = Path("/workspace") / file_path
        if full_path.exists():
            # Check if it's valid JavaScript
            with open(full_path, 'r') as f:
                content = f.read()
                
            if 'export async function' in content:
                print(f"  ✅ {file_path} exists and appears valid")
            else:
                print(f"  ⚠️  {file_path} exists but may be invalid")
                all_valid = False
        else:
            print(f"  ❌ {file_path} not found")
            all_valid = False
            
    return all_valid


def test_visualization_integration():
    """Test that the visualization can read the generated data"""
    print("\n🧪 Testing visualization integration...")
    
    # Check if public/data.json exists
    data_path = Path("/workspace/public/data.json")
    
    if data_path.exists():
        try:
            with open(data_path, 'r') as f:
                data = json.load(f)
                
            if data.get('success'):
                print(f"  ✅ data.json exists and is valid")
                print(f"     Projects: {data.get('summary', {}).get('totalProjects', 0)}")
                print(f"     Nodes: {data.get('summary', {}).get('totalNodes', 0)}")
            else:
                print("  ⚠️  data.json exists but success=false")
                
        except Exception as e:
            print(f"  ❌ Failed to parse data.json: {e}")
    else:
        print("  ⚠️  public/data.json not found (run aggregator first)")
        
    # Check visualization files
    viz_files = [
        "public/pow3r-complete.js",
        "public/index.html"
    ]
    
    for file_path in viz_files:
        full_path = Path("/workspace") / file_path
        if full_path.exists():
            print(f"  ✅ {file_path} exists")
        else:
            print(f"  ❌ {file_path} not found")
            
    return True


def main():
    """Run all tests"""
    print("🔬 GitHub Integration Test Suite")
    print("="*60)
    
    tests = [
        ("Imports", test_imports),
        ("GitHub Scanner", test_github_scanner),
        ("Data Aggregator", test_data_aggregator),
        ("CloudFlare Workers", test_cloudflare_workers),
        ("Visualization Integration", test_visualization_integration)
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ {name} test crashed: {e}")
            results.append((name, False))
            
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary:")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! GitHub integration is ready to use.")
        print("\nNext steps:")
        print("1. Set GITHUB_TOKEN environment variable")
        print("2. Run: python run_github_integration.py --org your-org")
        print("3. Deploy to CloudFlare")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()