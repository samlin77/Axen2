use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::process::Stdio;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, Command, ChildStdin, ChildStdout};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPServerConfig {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPTool {
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "inputSchema")]
    pub input_schema: Value,
}

/// Manages a single MCP server subprocess and JSON-RPC communication
pub struct MCPProcess {
    child: Child,
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
    request_id: AtomicU64,
}

impl MCPProcess {
    /// Spawn a new MCP server process
    pub async fn spawn(config: &MCPServerConfig, oauth_env: HashMap<String, String>) -> Result<Self, String> {
        println!("Spawning MCP server: {} {}", config.command, config.args.join(" "));

        let mut cmd = Command::new(&config.command);
        cmd.args(&config.args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        // Pass OAuth environment variables (without VITE_ prefix)
        println!("Setting environment variables for MCP subprocess:");
        for (key, value) in &oauth_env {
            if !value.is_empty() {
                println!("  {}={}", key, if key.contains("SECRET") { "***" } else { value });
                cmd.env(key, value);
            }
        }

        // Pass any additional environment variables from config (skip empty values)
        if let Some(env_vars) = &config.env {
            for (key, value) in env_vars {
                if !value.is_empty() {
                    println!("  {}={}", key, if key.contains("SECRET") { "***" } else { value });
                    cmd.env(key, value);
                } else {
                    println!("  Skipping empty env var: {}", key);
                }
            }
        }

        let mut child = cmd.spawn().map_err(|e| {
            format!("Failed to spawn MCP server '{}': {}", config.command, e)
        })?;

        let stdin = child.stdin.take().ok_or("Failed to get stdin")?;
        let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
        let stdout = BufReader::new(stdout);

        Ok(MCPProcess {
            child,
            stdin,
            stdout,
            request_id: AtomicU64::new(1),
        })
    }

    /// Send a JSON-RPC request and wait for response
    async fn send_request(&mut self, method: &str, params: Value) -> Result<Value, String> {
        let id = self.request_id.fetch_add(1, Ordering::SeqCst);
        let request = json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": method,
            "params": params
        });

        // Write to stdin
        let request_str = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        println!("Sending JSON-RPC request: {}", request_str);

        self.stdin.write_all(request_str.as_bytes()).await
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        self.stdin.write_all(b"\n").await
            .map_err(|e| format!("Failed to write newline: {}", e))?;
        self.stdin.flush().await
            .map_err(|e| format!("Failed to flush stdin: {}", e))?;

        // Read from stdout
        let mut line = String::new();
        self.stdout.read_line(&mut line).await
            .map_err(|e| format!("Failed to read from stdout: {}", e))?;

        println!("Received JSON-RPC response: {}", line);

        if line.trim().is_empty() {
            return Err("Empty response from MCP server".to_string());
        }

        let response: Value = serde_json::from_str(&line)
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        // Check for error in response
        if let Some(error) = response.get("error") {
            return Err(format!("MCP server error: {}", error));
        }

        // Return the result field
        response.get("result")
            .cloned()
            .ok_or_else(|| "No result field in response".to_string())
    }

    /// Initialize the MCP protocol
    pub async fn initialize(&mut self) -> Result<(), String> {
        println!("Initializing MCP protocol...");

        self.send_request("initialize", json!({
            "protocolVersion": "0.1.0",
            "capabilities": {},
            "clientInfo": {
                "name": "Axen",
                "version": "0.1.0"
            }
        })).await?;

        println!("MCP protocol initialized successfully");
        Ok(())
    }

    /// List available tools from the MCP server
    pub async fn list_tools(&mut self) -> Result<Vec<MCPTool>, String> {
        println!("Listing tools from MCP server...");

        let result = self.send_request("tools/list", json!({})).await?;

        let tools = result.get("tools")
            .ok_or("No 'tools' field in response")?;

        let tools: Vec<MCPTool> = serde_json::from_value(tools.clone())
            .map_err(|e| format!("Failed to parse tools: {}", e))?;

        println!("Found {} tools", tools.len());
        for tool in &tools {
            println!("  - {}: {}", tool.name, tool.description.as_deref().unwrap_or("(no description)"));
        }

        Ok(tools)
    }

    /// Call a tool on the MCP server
    pub async fn call_tool(&mut self, name: &str, args: Value) -> Result<Value, String> {
        println!("Calling tool '{}' with args: {}", name, args);

        let result = self.send_request("tools/call", json!({
            "name": name,
            "arguments": args
        })).await?;

        Ok(result)
    }

    /// Check if the process is still alive
    pub fn is_alive(&mut self) -> bool {
        match self.child.try_wait() {
            Ok(Some(_)) => false, // Process has exited
            Ok(None) => true,     // Still running
            Err(_) => false,      // Error checking status
        }
    }

    /// Kill the MCP server process
    pub async fn kill(&mut self) -> Result<(), String> {
        println!("Killing MCP server process...");
        self.child.kill().await
            .map_err(|e| format!("Failed to kill process: {}", e))
    }
}

impl Drop for MCPProcess {
    fn drop(&mut self) {
        println!("Dropping MCPProcess, ensuring cleanup...");
        // Best effort kill on drop
        let _ = self.child.start_kill();
    }
}

/// Load OAuth credentials from environment and strip VITE_ prefix
pub fn load_oauth_credentials() -> HashMap<String, String> {
    let mut env_vars = HashMap::new();

    // Try multiple possible locations for .env file
    let possible_paths = vec![
        // Current directory
        std::env::current_dir().ok().map(|mut p| { p.push(".env"); p }),
        // Parent directory (for running from target/debug)
        std::env::current_dir().ok().map(|mut p| { p.pop(); p.push(".env"); p }),
        // Two levels up (for src-tauri/target/debug)
        std::env::current_dir().ok().map(|mut p| { p.pop(); p.pop(); p.push(".env"); p }),
        // Three levels up (just in case)
        std::env::current_dir().ok().map(|mut p| { p.pop(); p.pop(); p.pop(); p.push(".env"); p }),
    ];

    println!("Current directory: {:?}", std::env::current_dir());

    let mut env_file_path = None;
    for path_opt in possible_paths {
        if let Some(path) = path_opt {
            println!("Checking for .env at: {}", path.display());
            if path.exists() {
                println!("Found .env at: {}", path.display());
                env_file_path = Some(path);
                break;
            }
        }
    }

    if let Some(env_file) = env_file_path {
        if let Ok(contents) = std::fs::read_to_string(&env_file) {
            for line in contents.lines() {
                let line = line.trim();
                if line.starts_with('#') || line.is_empty() {
                    continue;
                }
                if let Some((key, value)) = line.split_once('=') {
                    let key = key.trim();
                    let value = value.trim().trim_matches('"').trim_matches('\'');

                    // Strip VITE_ prefix and store
                    if key == "VITE_GOOGLE_OAUTH_CLIENT_ID" && !value.is_empty() {
                        env_vars.insert("GOOGLE_OAUTH_CLIENT_ID".to_string(), value.to_string());
                        println!("Loaded GOOGLE_OAUTH_CLIENT_ID from .env");
                    } else if key == "VITE_GOOGLE_OAUTH_CLIENT_SECRET" && !value.is_empty() {
                        env_vars.insert("GOOGLE_OAUTH_CLIENT_SECRET".to_string(), value.to_string());
                        println!("Loaded GOOGLE_OAUTH_CLIENT_SECRET from .env");
                    }
                }
            }
        }
    } else {
        println!("WARNING: Could not find .env file in any expected location");
    }

    // Fallback: try environment variables directly (might be set in production)
    if env_vars.is_empty() {
        println!("Trying fallback: reading from environment variables");
        if let Ok(client_id) = std::env::var("VITE_GOOGLE_OAUTH_CLIENT_ID") {
            env_vars.insert("GOOGLE_OAUTH_CLIENT_ID".to_string(), client_id);
        }
        if let Ok(client_secret) = std::env::var("VITE_GOOGLE_OAUTH_CLIENT_SECRET") {
            env_vars.insert("GOOGLE_OAUTH_CLIENT_SECRET".to_string(), client_secret);
        }
    }

    println!("Loaded {} OAuth environment variables", env_vars.len());
    for key in env_vars.keys() {
        println!("  - {}", key);
    }

    env_vars
}
