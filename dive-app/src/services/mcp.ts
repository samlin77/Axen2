/**
 * MCP Server Configuration
 */
export interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * MCP Tool Definition
 */
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP Resource Definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * MCP Server Connection Status
 */
export type MCPConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * MCP Server Instance
 */
export interface MCPServerInstance {
  config: MCPServerConfig;
  client: any | null;
  status: MCPConnectionStatus;
  tools: MCPTool[];
  resources: MCPResource[];
  error?: string;
}

/**
 * MCP Client Service
 *
 * This service manages connections to MCP servers and provides methods to
 * interact with them. In the MVP, this is a foundation for future integration.
 *
 * Note: Full MCP integration requires Tauri backend support since MCP servers
 * run as native processes (stdio transport). For MVP-4, we're building the
 * client-side foundation.
 */
export class MCPService {
  private servers: Map<string, MCPServerInstance> = new Map();

  /**
   * Register an MCP server configuration
   */
  registerServer(config: MCPServerConfig): void {
    console.log('Registering MCP server:', config.name);

    this.servers.set(config.id, {
      config,
      client: null,
      status: 'disconnected',
      tools: [],
      resources: [],
    });
  }

  /**
   * Connect to an MCP server using Tauri backend
   */
  async connectServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    console.log('Connecting to MCP server:', server.config.name);

    server.status = 'connecting';

    try {
      // Try to import and use Tauri invoke
      let invoke;
      try {
        const tauriCore = await import('@tauri-apps/api/core');
        invoke = tauriCore.invoke;
      } catch (importError) {
        throw new Error('MCP servers require running the Tauri desktop app. Please run "npm run tauri:dev" instead of "npm run dev".');
      }

      const result = await invoke('connect_mcp_server', {
        serverId: serverId,
        config: {
          id: server.config.id,
          name: server.config.name,
          description: server.config.description,
          command: server.config.command,
          args: server.config.args,
          env: server.config.env,
        },
      });

      // Update server state from Tauri response
      server.status = 'connected';
      server.tools = (result as any).tools || [];
      server.resources = [];

    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      server.status = 'error';
      server.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server using Tauri backend
   */
  async disconnectServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    console.log('Disconnecting from MCP server:', server.config.name);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('disconnect_mcp_server', { serverId });

      server.status = 'disconnected';
      server.tools = [];
      server.resources = [];
      server.client = null;
    } catch (error) {
      console.error('Failed to disconnect from MCP server:', error);
      throw error;
    }
  }

  /**
   * Get list of registered servers
   */
  getServers(): MCPServerInstance[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get a specific server instance
   */
  getServer(serverId: string): MCPServerInstance | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Get all available tools from connected servers
   */
  getAllTools(): { serverId: string; serverName: string; tools: MCPTool[] }[] {
    return Array.from(this.servers.entries())
      .filter(([, server]) => server.status === 'connected')
      .map(([serverId, server]) => ({
        serverId,
        serverName: server.config.name,
        tools: server.tools,
      }));
  }

  /**
   * Get all available resources from connected servers
   */
  getAllResources(): { serverId: string; serverName: string; resources: MCPResource[] }[] {
    return Array.from(this.servers.entries())
      .filter(([, server]) => server.status === 'connected')
      .map(([serverId, server]) => ({
        serverId,
        serverName: server.config.name,
        resources: server.resources,
      }));
  }

  /**
   * Call a tool from a specific server using Tauri backend
   */
  async callTool(serverId: string, toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    if (server.status !== 'connected') {
      throw new Error(`Server ${server.config.name} is not connected`);
    }

    console.log(`Calling tool ${toolName} on server ${server.config.name}`, args);

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke('call_mcp_tool', {
        serverId,
        toolName,
        args,
      });

      return result;
    } catch (error) {
      console.error('Failed to call MCP tool:', error);
      throw error;
    }
  }

  /**
   * Read a resource from a specific server
   *
   * Note: Placeholder for MVP. Full implementation requires server connection.
   */
  async readResource(serverId: string, uri: string): Promise<unknown> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    if (server.status !== 'connected') {
      throw new Error(`Server ${server.config.name} is not connected`);
    }

    console.log(`Reading resource ${uri} from server ${server.config.name}`);

    // TODO: Implement actual resource reading via MCP protocol
    throw new Error('Resource reading not yet implemented in MVP-4');
  }
}

// Export a singleton instance
export const mcpService = new MCPService();

// Register some example MCP servers for demonstration
mcpService.registerServer({
  id: 'filesystem',
  name: 'Filesystem Server',
  description: 'Provides access to local filesystem',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users'],
});

mcpService.registerServer({
  id: 'github',
  name: 'GitHub Server',
  description: 'Provides access to GitHub repositories',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-github'],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: import.meta.env.VITE_GITHUB_TOKEN || '',
  },
});
