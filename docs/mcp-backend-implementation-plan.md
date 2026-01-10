# MCP Backend Implementation Plan

**Status:** In Progress
**Priority:** Critical - Blocks Google Workspace OAuth functionality
**Estimated Effort:** 2-3 hours

---

## Current State

### ✅ What's Complete:
- OAuth UI wizard (GoogleOAuthSetup component)
- OAuth credentials stored in localStorage
- Frontend MCP service with multi-server support
- Google Workspace MCP servers registered (Calendar, Gmail, Drive, Docs, Sheets)
- Environment variables configured in .env

### ❌ What's Missing:
The Tauri backend (`src-tauri/src/main.rs`) currently **mocks** MCP connections instead of spawning real MCP server processes.

**Evidence:**
```rust
// Line 60 in main.rs:
// Simulate MCP connection - in production, spawn actual MCP server process
tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

// Line 63-102: Returns hardcoded tools for filesystem/github, empty array for others
let tools = match server_id.as_str() {
    "filesystem" => vec![...],
    "github" => vec![...],
    _ => vec![],  // <- Google Workspace servers return 0 tools
};
```

---

## Implementation Requirements

### 1. Process Spawning (Rust)

**Goal:** Spawn real MCP server subprocesses

**Implementation:**
```rust
use std::process::Stdio;
use tokio::process::Command;

async fn spawn_mcp_server(config: &MCPServerConfig) -> Result<Child, String> {
    let mut cmd = Command::new(&config.command);
    cmd.args(&config.args)
       .stdin(Stdio::piped())
       .stdout(Stdio::piped())
       .stderr(Stdio::piped());

    // Pass environment variables (OAuth credentials)
    if let Some(env_vars) = &config.env {
        for (key, value) in env_vars {
            cmd.env(key, value);
        }
    }

    cmd.spawn().map_err(|e| e.to_string())
}
```

**Key Challenges:**
- Environment variables from `.env` have `VITE_` prefix (frontend only)
- Need to read `.env` file in Rust and extract OAuth credentials
- Pass credentials to MCP subprocess without `VITE_` prefix

---

### 2. JSON-RPC Communication

**Goal:** Communicate with MCP server via stdio using JSON-RPC protocol

**MCP Protocol Basics:**
```json
// Initialize request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "0.1.0",
    "capabilities": {}
  }
}

// List tools request
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}

// Call tool request
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "calendar_list",
    "arguments": {}
  }
}
```

**Implementation:**
```rust
struct MCPProcess {
    child: Child,
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
    request_id: AtomicU64,
}

impl MCPProcess {
    async fn send_request(&mut self, method: &str, params: Value) -> Result<Value, String> {
        let id = self.request_id.fetch_add(1, Ordering::SeqCst);
        let request = json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        });

        // Write to stdin
        self.stdin.write_all(request.to_string().as_bytes()).await?;
        self.stdin.write_all(b"\n").await?;
        self.stdin.flush().await?;

        // Read from stdout
        let mut line = String::new();
        self.stdout.read_line(&mut line).await?;

        let response: Value = serde_json::from_str(&line)?;
        Ok(response["result"].clone())
    }

    async fn initialize(&mut self) -> Result<(), String> {
        self.send_request("initialize", json!({
            "protocolVersion": "0.1.0",
            "capabilities": {}
        })).await?;
        Ok(())
    }

    async fn list_tools(&mut self) -> Result<Vec<MCPTool>, String> {
        let result = self.send_request("tools/list", json!({})).await?;
        serde_json::from_value(result["tools"].clone())
            .map_err(|e| e.to_string())
    }

    async fn call_tool(&mut self, name: &str, args: Value) -> Result<Value, String> {
        self.send_request("tools/call", json!({
            "name": name,
            "arguments": args
        })).await
    }
}
```

---

### 3. Environment Variable Handling

**Problem:** OAuth credentials in `.env` use `VITE_` prefix

**Current `.env`:**
```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=123...
VITE_GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
```

**MCP Server Needs:**
```bash
GOOGLE_OAUTH_CLIENT_ID=123...
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
```

**Solution:**
```rust
use std::env;

fn load_oauth_credentials() -> HashMap<String, String> {
    let mut env_vars = HashMap::new();

    // Read from environment (set by Vite/Tauri)
    if let Ok(client_id) = env::var("VITE_GOOGLE_OAUTH_CLIENT_ID") {
        env_vars.insert("GOOGLE_OAUTH_CLIENT_ID".to_string(), client_id);
    }
    if let Ok(client_secret) = env::var("VITE_GOOGLE_OAUTH_CLIENT_SECRET") {
        env_vars.insert("GOOGLE_OAUTH_CLIENT_SECRET".to_string(), client_secret);
    }

    env_vars
}
```

---

### 4. OAuth Browser Flow Integration

**How workspace-mcp OAuth Works:**

1. User clicks "Connect" on Google Calendar
2. Tauri spawns: `uvx workspace-mcp --tools calendar`
3. MCP server detects no cached OAuth token
4. MCP server starts local HTTP server on `http://localhost:8080`
5. **MCP server opens browser** to Google OAuth URL:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=...&
     redirect_uri=http://localhost:8080/callback&
     response_type=code&
     scope=https://www.googleapis.com/auth/calendar&
     code_challenge=...
   ```
6. User signs in to Google, grants permissions
7. Google redirects to: `http://localhost:8080/callback?code=...`
8. MCP server exchanges code for access token
9. MCP server saves token to cache
10. Future connections use cached token

**Our Backend Needs To:**
- Let the MCP server handle OAuth flow (it does this automatically)
- Ensure OAuth credentials are passed as environment variables
- Wait for MCP server to complete OAuth before returning "connected"

---

## Implementation Steps

### Step 1: Add Dependencies to Cargo.toml
```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full", "io-util", "process"] }
dotenv = "0.15"  # For reading .env file
```

### Step 2: Create MCP Process Manager Module
Create `src-tauri/src/mcp_process.rs`:
- MCPProcess struct
- spawn_mcp_server()
- send_jsonrpc_request()
- initialize()
- list_tools()
- call_tool()

### Step 3: Update main.rs
Replace mock implementation in `connect_mcp_server()`:
```rust
#[tauri::command]
async fn connect_mcp_server(
    server_id: String,
    config: MCPServerConfig,
    state: State<'_, AppState>,
) -> Result<MCPServerState, String> {
    // 1. Load OAuth credentials from environment
    let oauth_env = load_oauth_credentials();

    // 2. Spawn MCP server process
    let mut process = MCPProcess::spawn(&config, oauth_env).await?;

    // 3. Initialize MCP protocol
    process.initialize().await?;

    // 4. List available tools (OAuth flow happens here if needed)
    let tools = process.list_tools().await?;

    // 5. Store process in state
    let server_state = MCPServerState {
        config,
        status: "connected".to_string(),
        tools,
        error: None,
    };

    state.servers.lock().unwrap().insert(server_id, (server_state.clone(), process));

    Ok(server_state)
}
```

### Step 4: Update call_mcp_tool()
```rust
#[tauri::command]
async fn call_mcp_tool(
    server_id: String,
    tool_name: String,
    args: Value,
    state: State<'_, AppState>,
) -> Result<Value, String> {
    let mut servers = state.servers.lock().unwrap();
    let (server_state, process) = servers.get_mut(&server_id)
        .ok_or_else(|| format!("Server {} not found", server_id))?;

    if server_state.status != "connected" {
        return Err(format!("Server {} is not connected", server_id));
    }

    // Call real MCP tool via JSON-RPC
    process.call_tool(&tool_name, args).await
}
```

### Step 5: Handle Process Lifecycle
- On disconnect: Kill child process
- On app shutdown: Kill all child processes
- Handle stderr logging
- Handle process crashes/restarts

---

## Testing Plan

### Test 1: Filesystem MCP Server (Baseline)
- Connect to filesystem server
- Verify tools appear (read_file, list_directory)
- Call read_file tool
- Verify result

### Test 2: Google Calendar OAuth Flow
- Ensure OAuth credentials in .env
- Connect to Google Calendar
- **Expect:** Browser opens for OAuth
- Sign in to Google
- **Expect:** Connection succeeds
- **Expect:** Tools appear (calendar_list, event_create, etc.)

### Test 3: Multiple Server Support
- Connect to Filesystem
- Connect to Google Calendar
- Connect to Gmail
- Verify all show correct tools
- Call tools on each server

---

## Risks & Mitigations

### Risk 1: OAuth Browser Flow Doesn't Trigger
**Mitigation:** workspace-mcp handles this automatically. Just ensure env vars are passed correctly.

### Risk 2: Process Stdio Deadlock
**Mitigation:** Use tokio async I/O with proper buffering. Read/write on separate tasks if needed.

### Risk 3: Process Crashes
**Mitigation:** Wrap in try-catch, update status to "error", allow reconnection.

### Risk 4: Multiple Simultaneous Connections
**Mitigation:** Use async/await, spawn each MCP server independently.

---

## Success Criteria

- [ ] Real MCP server processes spawn successfully
- [ ] JSON-RPC communication works bidirectionally
- [ ] OAuth browser flow triggers for Google Workspace servers
- [ ] Tools list populates correctly after connection
- [ ] Tool calls execute and return results
- [ ] Multiple servers can run simultaneously
- [ ] Graceful error handling and process cleanup

---

## Timeline

- **Step 1-2:** Add dependencies, create mcp_process.rs (30 min)
- **Step 3:** Update main.rs connect_mcp_server (45 min)
- **Step 4:** Update call_mcp_tool (15 min)
- **Step 5:** Process lifecycle management (30 min)
- **Testing:** End-to-end OAuth flow (30 min)

**Total:** ~2.5 hours

---

## Next Steps

1. Commit current OAuth UI work
2. Implement mcp_process.rs module
3. Update main.rs with real spawning logic
4. Test with filesystem server first
5. Test Google Calendar OAuth flow
6. Document for future developers

---

**Status:** Ready to implement
**Blocked By:** None
**Assigned To:** Claude Code
