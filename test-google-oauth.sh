#!/bin/bash
# Test Google Workspace MCP OAuth Flow
# This script will attempt to connect to Google Calendar and trigger OAuth if needed

echo "======================================================================"
echo "  Google Workspace MCP OAuth Test"
echo "======================================================================"
echo ""

# Load OAuth credentials from .env
if [ ! -f "dive-app/.env" ]; then
    echo "❌ Error: dive-app/.env not found"
    exit 1
fi

# Export OAuth credentials (strip VITE_ prefix)
export GOOGLE_OAUTH_CLIENT_ID=$(grep "VITE_GOOGLE_OAUTH_CLIENT_ID" dive-app/.env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
export GOOGLE_OAUTH_CLIENT_SECRET=$(grep "VITE_GOOGLE_OAUTH_CLIENT_SECRET" dive-app/.env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$GOOGLE_OAUTH_CLIENT_ID" ]; then
    echo "❌ Error: GOOGLE_OAUTH_CLIENT_ID not found in .env"
    exit 1
fi

echo "✅ OAuth Client ID: ${GOOGLE_OAUTH_CLIENT_ID:0:20}..."
echo "✅ OAuth Secret: ***"
echo ""

# Check if already authenticated
CREDS_DIR="$HOME/.google_workspace_mcp/credentials"
if [ -d "$CREDS_DIR" ] && [ "$(ls -A $CREDS_DIR 2>/dev/null)" ]; then
    echo "ℹ️  Found existing credentials in: $CREDS_DIR"
    echo "   You may already be authenticated"
    echo ""
fi

echo "🚀 Starting workspace-mcp for Google Calendar..."
echo "   If not authenticated, a browser window will open"
echo "   Complete the OAuth flow in your browser"
echo ""
echo "Press Ctrl+C to stop when done"
echo "----------------------------------------------------------------------"
echo ""

# Run workspace-mcp with calendar tools
uvx workspace-mcp --tools calendar

echo ""
echo "======================================================================"
echo "Test complete"
echo "======================================================================"
