#!/bin/bash
# Demo test script for the Repository Analyzer
# This creates a small test environment to demonstrate functionality

echo "🧪 Setting up test environment..."

# Create test directory
TEST_DIR="/tmp/repo-analyzer-demo"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

# Create sample Git repositories
repos=("project-alpha" "project-beta" "project-gamma" "tool-delta" "app-epsilon")

for repo in "${repos[@]}"; do
    echo "  Creating test repo: $repo"
    mkdir -p "$TEST_DIR/$repo"
    cd "$TEST_DIR/$repo"
    git init -q
    
    # Add some test files
    echo "# $repo" > README.md
    echo "console.log('Hello from $repo');" > index.js
    mkdir -p src
    echo "export const name = '$repo';" > src/main.js
    
    # Make initial commit
    git add .
    git commit -q -m "Initial commit for $repo"
    
    # Add a second commit with timestamp
    echo "Updated: $(date)" >> README.md
    git add .
    git commit -q -m "Update README"
done

echo ""
echo "✅ Test environment created at: $TEST_DIR"
echo ""
echo "🚀 Now run the analyzer:"
echo "   python analyze.py $TEST_DIR"
echo ""
echo "Try these commands when prompted:"
echo "   1-3        (select first three repos)"
echo "   all        (select all repos)"
echo "   1 3 5      (select specific repos)"
echo "   done       (finish selection)"
echo ""

