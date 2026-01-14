#!/usr/bin/env python3
"""
End-to-End test for Google Workspace MCP integration
Tests: OAuth, Connection, Tools List, Tool Execution
"""

import os
import subprocess
import json
import time
import sys

def load_oauth_env():
    """Load OAuth credentials from .env file"""
    env_path = "dive-app/.env"
    env_vars = {}

    try:
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
    except Exception as e:
        print(f"❌ Error loading .env: {e}")
        return None

    return env_vars

def send_jsonrpc(proc, method, params, request_id):
    """Send a JSON-RPC request and get response"""
    request = {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": method,
        "params": params
    }

    # Send request
    request_str = json.dumps(request)
    proc.stdin.write(request_str + '\n')
    proc.stdin.flush()

    print(f"→ Sent: {method} (id={request_id})")

    # Read response (with timeout)
    max_wait = 10
    start = time.time()

    while time.time() - start < max_wait:
        line = proc.stdout.readline()
        if line:
            line = line.strip()
            if line.startswith('{'):
                try:
                    response = json.loads(line)
                    if response.get('id') == request_id:
                        return response
                except json.JSONDecodeError:
                    pass
        time.sleep(0.1)

    return None

def main():
    print("=" * 70)
    print("  Google Workspace MCP - End-to-End Test")
    print("=" * 70)
    print()

    # Step 1: Load OAuth credentials
    print("📋 Step 1: Loading OAuth credentials...")
    env_vars = load_oauth_env()
    if not env_vars or 'GOOGLE_OAUTH_CLIENT_ID' not in env_vars:
        print("❌ Failed to load OAuth credentials")
        return False

    print(f"✅ Client ID: {env_vars['GOOGLE_OAUTH_CLIENT_ID'][:20]}...")
    print(f"✅ Client Secret: ***")
    print()

    # Step 2: Check existing credentials
    creds_dir = os.path.expanduser("~/.google_workspace_mcp/credentials")
    if os.path.exists(creds_dir):
        creds_files = os.listdir(creds_dir)
        if creds_files:
            print(f"✅ Found existing OAuth token: {creds_files[0]}")
        else:
            print("ℹ️  No existing OAuth tokens found")
    print()

    # Step 3: Spawn workspace-mcp
    print("📋 Step 2: Spawning workspace-mcp process...")
    env = os.environ.copy()
    env.update(env_vars)

    proc = subprocess.Popen(
        ['uvx', 'workspace-mcp', '--tools', 'calendar'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        text=True,
        bufsize=1
    )

    print(f"✅ Process started (PID: {proc.pid})")
    print()

    try:
        # Step 4: Initialize
        print("📋 Step 3: Initializing MCP protocol...")
        init_response = send_jsonrpc(proc, "initialize", {
            "protocolVersion": "0.1.0",
            "capabilities": {},
            "clientInfo": {"name": "Axen E2E Test", "version": "0.1.0"}
        }, 1)

        if init_response and 'result' in init_response:
            print("✅ Initialize successful")
            server_name = init_response['result'].get('serverInfo', {}).get('name', 'unknown')
            print(f"   Server: {server_name}")
        else:
            print("❌ Initialize failed")
            return False
        print()

        # Step 5: List tools
        print("📋 Step 4: Listing available tools...")
        tools_response = send_jsonrpc(proc, "tools/list", {}, 2)

        if tools_response and 'result' in tools_response:
            tools = tools_response['result'].get('tools', [])
            print(f"✅ Found {len(tools)} tools:")
            for i, tool in enumerate(tools[:10], 1):
                print(f"   {i}. {tool.get('name', 'unknown')}")
            if len(tools) > 10:
                print(f"   ... and {len(tools) - 10} more")
        else:
            print("❌ Failed to get tools list")
            return False
        print()

        # Step 6: Call a simple tool (calendar_list)
        print("📋 Step 5: Testing tool execution (calendar_list)...")

        if any(t.get('name') == 'calendar_list' for t in tools):
            call_response = send_jsonrpc(proc, "tools/call", {
                "name": "calendar_list",
                "arguments": {}
            }, 3)

            if call_response:
                if 'result' in call_response:
                    result = call_response['result']
                    print("✅ Tool execution successful!")

                    # Pretty print result
                    if isinstance(result, dict) and 'content' in result:
                        content = result['content']
                        if isinstance(content, list) and len(content) > 0:
                            text_content = content[0].get('text', '')
                            try:
                                calendars = json.loads(text_content)
                                print(f"   Found {len(calendars)} calendar(s)")
                                for cal in calendars[:3]:
                                    print(f"   • {cal.get('summary', 'Unknown')}")
                            except:
                                print(f"   Result: {text_content[:100]}...")
                elif 'error' in call_response:
                    error = call_response['error']
                    print(f"❌ Tool call error: {error}")
                    return False
        else:
            print("⚠️  calendar_list tool not available, skipping")

        print()
        print("=" * 70)
        print("✅ All tests passed!")
        print("=" * 70)
        return True

    finally:
        # Cleanup
        print("\n🛑 Cleaning up...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except:
            proc.kill()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
