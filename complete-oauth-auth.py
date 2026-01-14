#!/usr/bin/env python3
"""
Complete Google Calendar OAuth Authorization
This script will:
1. Start workspace-mcp with OAuth callback server
2. Open browser for authorization
3. Wait for authorization to complete
4. Test that it works
"""

import os
import subprocess
import json
import time
import webbrowser
import sys

def load_oauth_env():
    """Load OAuth credentials from .env"""
    env_path = "dive-app/.env"
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                value = value.strip().strip('"\'')
                if key == 'VITE_GOOGLE_OAUTH_CLIENT_ID':
                    env_vars['GOOGLE_OAUTH_CLIENT_ID'] = value
                elif key == 'VITE_GOOGLE_OAUTH_CLIENT_SECRET':
                    env_vars['GOOGLE_OAUTH_CLIENT_SECRET'] = value
    return env_vars

def send_jsonrpc(proc, method, params, request_id):
    """Send JSON-RPC request"""
    request = {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}
    try:
        proc.stdin.write(json.dumps(request) + '\n')
        proc.stdin.flush()
    except:
        return None

    # Read response with timeout
    max_wait = 20
    start = time.time()
    while time.time() - start < max_wait:
        try:
            line = proc.stdout.readline()
            if line and line.strip().startswith('{'):
                response = json.loads(line.strip())
                if response.get('id') == request_id:
                    return response
        except:
            pass
        time.sleep(0.1)
    return None

print("=" * 70)
print("  Google Calendar OAuth Authorization")
print("=" * 70)
print()

# Load OAuth credentials
print("📋 Step 1: Loading OAuth credentials...")
env_vars = load_oauth_env()
if not env_vars or 'GOOGLE_OAUTH_CLIENT_ID' not in env_vars:
    print("❌ Failed to load OAuth credentials from dive-app/.env")
    sys.exit(1)

print(f"✅ Client ID: {env_vars['GOOGLE_OAUTH_CLIENT_ID'][:20]}...")
print()

# Prepare environment
env = os.environ.copy()
env.update(env_vars)

# Start workspace-mcp (this starts the OAuth callback server)
print("📋 Step 2: Starting workspace-mcp with OAuth callback server...")
print("   This will start a server on http://localhost:8000")
print()

proc = subprocess.Popen(
    ['uvx', 'workspace-mcp', '--tools', 'calendar'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    env=env,
    text=True,
    bufsize=1
)

print(f"✅ Process started (PID: {proc.pid})")
print()

# Give it a moment to start
time.sleep(2)

# Initialize to trigger OAuth URL generation
print("📋 Step 3: Triggering OAuth flow...")
init_response = send_jsonrpc(proc, "initialize", {
    "protocolVersion": "0.1.0",
    "capabilities": {},
    "clientInfo": {"name": "Axen", "version": "0.1.0"}
}, 1)

if init_response:
    print("✅ MCP initialized")
else:
    print("⚠️  No initialize response (this is ok)")
print()

# Try to call a tool to trigger the OAuth URL
print("📋 Step 4: Requesting OAuth authorization URL...")
tool_response = send_jsonrpc(proc, "tools/call", {
    "name": "list_calendars",
    "arguments": {"user_google_email": "samlin77@gmail.com"}
}, 2)

oauth_url = None
if tool_response and 'result' in tool_response:
    content = tool_response['result'].get('content', [])
    for item in content:
        if 'text' in item:
            text = item['text']
            if 'https://accounts.google.com/o/oauth2/auth' in text:
                # Extract URL
                start_idx = text.find('https://accounts.google.com/o/oauth2/auth')
                end_idx = text.find(' ', start_idx)
                if end_idx == -1:
                    end_idx = text.find('\n', start_idx)
                if end_idx == -1:
                    end_idx = len(text)
                oauth_url = text[start_idx:end_idx].strip()
                break

if oauth_url:
    print("✅ OAuth URL generated!")
    print()
    print("=" * 70)
    print("  AUTHORIZATION REQUIRED")
    print("=" * 70)
    print()
    print("A browser window will open in 3 seconds...")
    print()
    print("Please:")
    print("1. Sign in with your Google account (samlin77@gmail.com)")
    print("2. Grant permission for Google Calendar access")
    print("3. Wait for the redirect to complete")
    print()
    print("The authorization URL is:")
    print(oauth_url)
    print()

    # Wait a bit
    for i in range(3, 0, -1):
        print(f"Opening browser in {i}...", end='\r')
        time.sleep(1)

    print("\n🌐 Opening browser...")
    webbrowser.open(oauth_url)

    print()
    print("Waiting for you to complete authorization...")
    print("(The browser should show a Google sign-in page)")
    print()
    print("After authorization, press Enter to test the connection...")

    input()

    print()
    print("=" * 70)
    print("  Testing Authorization")
    print("=" * 70)
    print()

    # Terminate old process
    proc.terminate()
    time.sleep(2)

    # Start a fresh process to test
    print("📋 Starting fresh connection to test credentials...")
    test_proc = subprocess.Popen(
        ['uvx', 'workspace-mcp', '--tools', 'calendar'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        text=True,
        bufsize=1
    )

    time.sleep(2)

    # Initialize
    init = send_jsonrpc(test_proc, "initialize", {
        "protocolVersion": "0.1.0",
        "capabilities": {},
        "clientInfo": {"name": "Axen", "version": "0.1.0"}
    }, 1)

    # Test list_calendars
    print("📅 Testing list_calendars...")
    test_result = send_jsonrpc(test_proc, "tools/call", {
        "name": "list_calendars",
        "arguments": {"user_google_email": "samlin77@gmail.com"}
    }, 2)

    if test_result and 'result' in test_result:
        is_error = test_result['result'].get('isError', False)
        if not is_error:
            print("✅ SUCCESS! Authorization complete!")
            print()
            content = test_result['result'].get('content', [])
            for item in content:
                if 'text' in item:
                    try:
                        calendars = json.loads(item['text'])
                        print(f"📅 Found {len(calendars)} calendar(s):")
                        for cal in calendars[:5]:
                            summary = cal.get('summary', 'Unknown')
                            primary = " ⭐" if cal.get('primary') else ""
                            print(f"   • {summary}{primary}")
                    except:
                        pass
        else:
            print("❌ Still getting authorization error")
            print("   You may need to complete the authorization again")

    test_proc.terminate()
    test_proc.wait()

else:
    print("⚠️  Could not extract OAuth URL")
    print("   Please authorize manually using the test-google-oauth.sh script")

# Cleanup
try:
    proc.terminate()
    proc.wait(timeout=3)
except:
    proc.kill()

print()
print("=" * 70)
print("Script complete")
print("=" * 70)
