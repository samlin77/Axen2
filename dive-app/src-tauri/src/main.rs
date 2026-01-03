// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MCPServerConfig {
    id: String,
    name: String,
    description: Option<String>,
    command: String,
    args: Vec<String>,
    env: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MCPTool {
    name: String,
    description: Option<String>,
    #[serde(rename = "inputSchema")]
    input_schema: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MCPServerState {
    config: MCPServerConfig,
    status: String,
    tools: Vec<MCPTool>,
    error: Option<String>,
}

struct AppState {
    servers: Mutex<HashMap<String, MCPServerState>>,
}

#[tauri::command]
async fn connect_mcp_server(
    server_id: String,
    config: MCPServerConfig,
    state: State<'_, AppState>,
) -> Result<MCPServerState, String> {
    println!("Connecting to MCP server: {}", config.name);

    // Update status to connecting
    let mut server_state = MCPServerState {
        config: config.clone(),
        status: "connecting".to_string(),
        tools: vec![],
        error: None,
    };

    {
        let mut servers = state.servers.lock().unwrap();
        servers.insert(server_id.clone(), server_state.clone());
    }

    // Simulate MCP connection - in production, spawn actual MCP server process
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Mock tools based on server type
    let tools = match server_id.as_str() {
        "filesystem" => vec![
            MCPTool {
                name: "read_file".to_string(),
                description: Some("Read file contents".to_string()),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": {"type": "string"}
                    },
                    "required": ["path"]
                }),
            },
            MCPTool {
                name: "list_directory".to_string(),
                description: Some("List directory contents".to_string()),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "path": {"type": "string"}
                    },
                    "required": ["path"]
                }),
            },
        ],
        "github" => vec![
            MCPTool {
                name: "search_repositories".to_string(),
                description: Some("Search GitHub repositories".to_string()),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"}
                    },
                    "required": ["query"]
                }),
            },
        ],
        _ => vec![],
    };

    server_state.status = "connected".to_string();
    server_state.tools = tools;

    {
        let mut servers = state.servers.lock().unwrap();
        servers.insert(server_id, server_state.clone());
    }

    Ok(server_state)
}

#[tauri::command]
async fn disconnect_mcp_server(
    server_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    println!("Disconnecting MCP server: {}", server_id);

    let mut servers = state.servers.lock().unwrap();
    if let Some(server) = servers.get_mut(&server_id) {
        server.status = "disconnected".to_string();
        server.tools = vec![];
    }

    Ok(())
}

#[tauri::command]
async fn call_mcp_tool(
    server_id: String,
    tool_name: String,
    args: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    println!("Calling tool {} on server {}", tool_name, server_id);

    let servers = state.servers.lock().unwrap();
    let server = servers.get(&server_id)
        .ok_or_else(|| format!("Server {} not found", server_id))?;

    if server.status != "connected" {
        return Err(format!("Server {} is not connected", server_id));
    }

    // Mock tool execution - in production, send JSON-RPC to MCP server
    let result = match (server_id.as_str(), tool_name.as_str()) {
        ("filesystem", "read_file") => {
            let path = args.get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path argument")?;

            match std::fs::read_to_string(path) {
                Ok(content) => serde_json::json!({
                    "success": true,
                    "content": content,
                    "path": path
                }),
                Err(e) => serde_json::json!({
                    "success": false,
                    "error": e.to_string()
                }),
            }
        },
        ("filesystem", "list_directory") => {
            let path = args.get("path")
                .and_then(|v| v.as_str())
                .ok_or("Missing path argument")?;

            match std::fs::read_dir(path) {
                Ok(entries) => {
                    let files: Vec<String> = entries
                        .filter_map(|e| e.ok())
                        .map(|e| e.file_name().to_string_lossy().to_string())
                        .collect();

                    serde_json::json!({
                        "success": true,
                        "files": files,
                        "path": path
                    })
                },
                Err(e) => serde_json::json!({
                    "success": false,
                    "error": e.to_string()
                }),
            }
        },
        ("github", "search_repositories") => {
            serde_json::json!({
                "success": true,
                "message": "GitHub API integration pending",
                "query": args.get("query")
            })
        },
        _ => serde_json::json!({
            "success": false,
            "error": format!("Unknown tool: {}", tool_name)
        }),
    };

    Ok(result)
}

#[tauri::command]
async fn get_mcp_servers(
    state: State<'_, AppState>,
) -> Result<Vec<MCPServerState>, String> {
    let servers = state.servers.lock().unwrap();
    Ok(servers.values().cloned().collect())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            servers: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            connect_mcp_server,
            disconnect_mcp_server,
            call_mcp_tool,
            get_mcp_servers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
