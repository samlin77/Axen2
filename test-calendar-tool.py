#!/usr/bin/env python3
"""Test Google Calendar tool execution"""

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

    max_wait = 15
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
                except:
                    pass
        time.sleep(0.1)
    return None

print("=" * 70)
print("  Testing Google Calendar Tool: list_calendars")
print("=" * 70)
print()

env = os.environ.copy()
env.update(load_oauth_env())

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

try:
    # Initialize
    print("📝 Initializing...")
    init = send_jsonrpc(proc, "initialize", {
        "protocolVersion": "0.1.0",
        "capabilities": {},
        "clientInfo": {"name": "Test", "version": "1.0"}
    }, 1)

    if not init or 'result' not in init:
        print("❌ Initialize failed")
        exit(1)

    print("✅ Initialized")
    print()

    # Call list_calendars
    print("📅 Calling list_calendars tool...")
    result = send_jsonrpc(proc, "tools/call", {
        "name": "list_calendars",
        "arguments": {}
    }, 2)

    print()
    if result:
        if 'result' in result:
            print("✅ Success! Response:")
            print("-" * 70)
            print(json.dumps(result['result'], indent=2))
            print("-" * 70)

            # Try to extract calendar names
            content = result['result'].get('content', [])
            if content and isinstance(content, list):
                for item in content:
                    if 'text' in item:
                        try:
                            calendars = json.loads(item['text'])
                            print(f"\n📅 Found {len(calendars)} calendar(s):")
                            for cal in calendars:
                                summary = cal.get('summary', 'Unknown')
                                primary = " (Primary)" if cal.get('primary') else ""
                                print(f"   • {summary}{primary}")
                        except:
                            print(f"\n📄 Response text: {item['text'][:200]}")
        elif 'error' in result:
            print(f"❌ Error: {result['error']}")
    else:
        print("❌ No response received")

finally:
    proc.terminate()
    proc.wait(timeout=3)

print()
print("=" * 70)
print("Test complete!")
print("=" * 70)
