#!/bin/bash

###############################################################################
# Repository 3D Visualization - Start Script
# Phase 2: 3D Visualization Web Application
#
# This script starts the visualization server and opens the browser
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
PORT="${PORT:-3000}"
BASE_PATH="${BASE_PATH:-/Users/creator/Documents/DEV}"

echo ""
echo -e "${MAGENTA}======================================================================${NC}"
echo -e "${MAGENTA}    Repository 3D Visualization - Startup${NC}"
echo -e "${MAGENTA}======================================================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js 18+ from:"
    echo "  https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js installed: ${NODE_VERSION}${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm installed: ${NPM_VERSION}${NC}"
echo ""

# Check if server directory exists
if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}❌ Error: Server directory not found${NC}"
    echo "Expected: $SERVER_DIR"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "$SERVER_DIR/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    cd "$SERVER_DIR"
    npm install
    echo ""
fi

# Check if config files exist
CONFIG_COUNT=$(find "$BASE_PATH" -name "dev-status.config.json" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONFIG_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Warning: No dev-status.config.json files found${NC}"
    echo ""
    echo "Make sure you've run Phase 1 analysis first:"
    echo "  python run_phase1.py --markdown selection.md --base-path \"$BASE_PATH\""
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ Found ${CONFIG_COUNT} repository configurations${NC}"
fi

echo ""
echo -e "${CYAN}Starting visualization server...${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Base Path: ${BASE_PATH}"
echo -e "  Port: ${PORT}"
echo -e "  URL: ${GREEN}http://localhost:${PORT}${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo -e "${MAGENTA}======================================================================${NC}"
echo ""

# Start server
cd "$SERVER_DIR"
export BASE_PATH="$BASE_PATH"
export PORT="$PORT"

# Open browser after a short delay (in background)
(
    sleep 2
    if command -v open &> /dev/null; then
        # macOS
        open "http://localhost:${PORT}"
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "http://localhost:${PORT}"
    elif command -v start &> /dev/null; then
        # Windows
        start "http://localhost:${PORT}"
    fi
) &

# Start server (this blocks until Ctrl+C)
node server.js

