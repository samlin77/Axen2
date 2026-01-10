// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod mcp_process;

use std::collections::HashMap;
use std::sync::{Arc, Mutex as StdMutex};
use serde::{Deserialize, Serialize};
use tauri::State;
use mcp_process::{MCPProcess, MCPServerConfig, MCPTool, load_oauth_credentials};
use tokio::sync::Mutex as TokioMutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MCPServerState {
    config: MCPServerConfig,
    status: String,
    tools: Vec<MCPTool>,
    error: Option<String>,
}

struct AppState {
    servers: StdMutex<HashMap<String, MCPServerState>>,
    processes: StdMutex<HashMap<String, Arc<TokioMutex<MCPProcess>>>>,
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

    // Load OAuth credentials from environment
    let oauth_env = load_oauth_credentials();

    // Spawn real MCP server process
    let spawn_result = MCPProcess::spawn(&config, oauth_env).await;

    let mut process = match spawn_result {
        Ok(p) => p,
        Err(e) => {
            server_state.status = "error".to_string();
            server_state.error = Some(format!("Failed to spawn MCP server: {}", e));
            let mut servers = state.servers.lock().unwrap();
            servers.insert(server_id, server_state.clone());
            return Err(e);
        }
    };

    // Initialize MCP protocol
    if let Err(e) = process.initialize().await {
        let _ = process.kill().await;
        server_state.status = "error".to_string();
        server_state.error = Some(format!("Failed to initialize MCP protocol: {}", e));
        let mut servers = state.servers.lock().unwrap();
        servers.insert(server_id, server_state.clone());
        return Err(format!("Failed to initialize MCP protocol: {}", e));
    }

    // List available tools (OAuth browser flow may happen here)
    let tools = match process.list_tools().await {
        Ok(t) => t,
        Err(e) => {
            let _ = process.kill().await;
            server_state.status = "error".to_string();
            server_state.error = Some(format!("Failed to list tools: {}", e));
            let mut servers = state.servers.lock().unwrap();
            servers.insert(server_id, server_state.clone());
            return Err(format!("Failed to list tools: {}", e));
        }
    };

    server_state.status = "connected".to_string();
    server_state.tools = tools;

    {
        let mut servers = state.servers.lock().unwrap();
        servers.insert(server_id.clone(), server_state.clone());
    }

    {
        let mut processes = state.processes.lock().unwrap();
        processes.insert(server_id, Arc::new(TokioMutex::new(process)));
    }

    Ok(server_state)
}

#[tauri::command]
async fn disconnect_mcp_server(
    server_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    println!("Disconnecting MCP server: {}", server_id);

    // Remove the process from the map
    let process_arc = {
        let mut processes = state.processes.lock().unwrap();
        processes.remove(&server_id)
    };

    // Kill the process (outside the lock)
    if let Some(process_arc) = process_arc {
        let mut process = process_arc.lock().await;
        if let Err(e) = process.kill().await {
            println!("Warning: Failed to kill MCP server process: {}", e);
        }
    }

    // Update server state
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

    // Check server status
    {
        let servers = state.servers.lock().unwrap();
        let server = servers.get(&server_id)
            .ok_or_else(|| format!("Server {} not found", server_id))?;

        if server.status != "connected" {
            return Err(format!("Server {} is not connected", server_id));
        }
    }

    // Get the process Arc (outside the lock)
    let process_arc = {
        let processes = state.processes.lock().unwrap();
        processes.get(&server_id)
            .ok_or_else(|| format!("Process for server {} not found", server_id))?
            .clone()
    };

    // Call the tool via JSON-RPC
    let mut process = process_arc.lock().await;
    process.call_tool(&tool_name, args).await
}

#[tauri::command]
async fn get_mcp_servers(
    state: State<'_, AppState>,
) -> Result<Vec<MCPServerState>, String> {
    let servers = state.servers.lock().unwrap();
    Ok(servers.values().cloned().collect())
}

#[tauri::command]
async fn mcp_health_check(
    server_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let process_arc = {
        let processes = state.processes.lock().unwrap();
        processes.get(&server_id).cloned()
    };

    if let Some(process_arc) = process_arc {
        let mut process = process_arc.lock().await;
        Ok(process.is_alive())
    } else {
        Ok(false)
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            servers: StdMutex::new(HashMap::new()),
            processes: StdMutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            connect_mcp_server,
            disconnect_mcp_server,
            call_mcp_tool,
            get_mcp_servers,
            mcp_health_check,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
