#!/usr/bin/env python3
"""
Verify Google Calendar OAuth is working
Run this after completing OAuth authorization
"""

import os
import subprocess
import json
import time

def load_oauth_env():
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
    request = {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}
    proc.stdin.write(json.dumps(request) + '\n')
    proc.stdin.flush()

    max_wait = 20
    start = time.time()
    while time.time() - start < max_wait:
        line = proc.stdout.readline()
        if line and line.strip().startswith('{'):
            try:
                response = json.loads(line.strip())
                if response.get('id') == request_id:
                    return response
            except:
                pass
        time.sleep(0.1)
    return None

print("=" * 70)
print("  Verifying Google Calendar OAuth")
print("=" * 70)
print()

# Check credentials file
creds_file = os.path.expanduser("~/.google_workspace_mcp/credentials/samlin77@gmail.com.json")
if os.path.exists(creds_file):
    print(f"✅ OAuth credentials found: {creds_file}")
    # Show when it was last modified
    mtime = os.path.getmtime(creds_file)
    import datetime
    mod_time = datetime.datetime.fromtimestamp(mtime)
    print(f"   Last modified: {mod_time.strftime('%Y-%m-%d %H:%M:%S')}")
else:
    print(f"❌ No OAuth credentials found at: {creds_file}")
    print("   You need to complete the OAuth authorization first")
    print("   Run: ./test-google-oauth.sh")
    exit(1)

print()

# Load OAuth env
env = os.environ.copy()
env.update(load_oauth_env())

# Start workspace-mcp
print("🚀 Starting workspace-mcp...")
proc = subprocess.Popen(
    ['uvx', 'workspace-mcp', '--tools', 'calendar'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env,
    text=True,
    bufsize=1
)

time.sleep(2)

try:
    # Initialize
    print("📝 Initializing MCP connection...")
    init = send_jsonrpc(proc, "initialize", {
        "protocolVersion": "0.1.0",
        "capabilities": {},
        "clientInfo": {"name": "Axen Verify", "version": "0.1.0"}
    }, 1)

    if not init or 'result' not in init:
        print("❌ Failed to initialize")
        exit(1)

    print("✅ MCP connection established")
    print()

    # Test list_calendars
    print("📅 Testing list_calendars tool...")
    result = send_jsonrpc(proc, "tools/call", {
        "name": "list_calendars",
        "arguments": {"user_google_email": "samlin77@gmail.com"}
    }, 2)

    print()
    if result and 'result' in result:
        is_error = result['result'].get('isError', False)

        if is_error:
            print("❌ OAuth authorization needed")
            print()
            content = result['result'].get('content', [])
            for item in content:
                if 'text' in item:
                    if 'Authorization URL' in item['text']:
                        print("Please complete the OAuth flow:")
                        print("1. Run: ./test-google-oauth.sh")
                        print("2. Click the authorization link that appears")
                        print("3. Sign in and grant permissions")
                        print("4. Run this script again")
        else:
            print("=" * 70)
            print("✅ SUCCESS! Google Calendar OAuth is working!")
            print("=" * 70)
            print()

            # Parse and display calendars
            content = result['result'].get('content', [])
            for item in content:
                if 'text' in item:
                    try:
                        calendars = json.loads(item['text'])
                        if isinstance(calendars, list):
                            print(f"📅 Found {len(calendars)} calendar(s):")
                            print("-" * 70)
                            for i, cal in enumerate(calendars, 1):
                                summary = cal.get('summary', 'Unknown')
                                primary = " ⭐ PRIMARY" if cal.get('primary') else ""
                                access = cal.get('accessRole', 'unknown')
                                print(f"{i}. {summary}{primary}")
                                print(f"   Access: {access}")
                                if i >= 5:
                                    if len(calendars) > 5:
                                        print(f"   ... and {len(calendars) - 5} more")
                                    break
                            print("-" * 70)
                            print()
                            print("✅ You can now use Google Calendar in Axen!")
                            print("   The MCP backend will automatically use these credentials")
                    except json.JSONDecodeError:
                        print(item['text'][:200])
    else:
        print("❌ No response received")

finally:
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except:
        proc.kill()

print()
print("=" * 70)
