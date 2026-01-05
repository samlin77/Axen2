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

  /**
   * Connect to multiple MCP servers in parallel
   */
  async connectMultiple(serverIds: string[]): Promise<void> {
    console.log(`Connecting to ${serverIds.length} MCP servers in parallel...`);

    const connectionPromises = serverIds.map(serverId =>
      this.connectServer(serverId).catch(error => {
        console.error(`Failed to connect to server ${serverId}:`, error);
        // Don't throw - allow other connections to continue
        return null;
      })
    );

    await Promise.all(connectionPromises);

    const connectedCount = this.getServers().filter(s => s.status === 'connected').length;
    console.log(`Successfully connected to ${connectedCount}/${serverIds.length} servers`);
  }

  /**
   * Disconnect from all connected MCP servers
   */
  async disconnectAll(): Promise<void> {
    const connectedServers = Array.from(this.servers.entries())
      .filter(([, server]) => server.status === 'connected')
      .map(([serverId]) => serverId);

    if (connectedServers.length === 0) {
      console.log('No connected servers to disconnect');
      return;
    }

    console.log(`Disconnecting from ${connectedServers.length} servers...`);

    const disconnectionPromises = connectedServers.map(serverId =>
      this.disconnectServer(serverId).catch(error => {
        console.error(`Failed to disconnect from server ${serverId}:`, error);
        return null;
      })
    );

    await Promise.all(disconnectionPromises);
    console.log('All servers disconnected');
  }

  /**
   * Perform health check on a specific server
   */
  async healthCheck(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      console.warn(`Server ${serverId} not found`);
      return false;
    }

    if (server.status !== 'connected') {
      return false;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke('mcp_health_check', { serverId });
      return result as boolean;
    } catch (error) {
      console.error(`Health check failed for server ${serverId}:`, error);
      // Update server status if health check fails
      server.status = 'error';
      server.error = 'Health check failed';
      return false;
    }
  }

  /**
   * Perform health check on all connected servers
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const connectedServers = Array.from(this.servers.entries())
      .filter(([, server]) => server.status === 'connected')
      .map(([serverId]) => serverId);

    const results = new Map<string, boolean>();

    const healthChecks = connectedServers.map(async serverId => {
      const isHealthy = await this.healthCheck(serverId);
      results.set(serverId, isHealthy);
    });

    await Promise.all(healthChecks);

    const healthyCount = Array.from(results.values()).filter(v => v).length;
    console.log(`Health check complete: ${healthyCount}/${results.size} servers healthy`);

    return results;
  }

  /**
   * Save server configurations to localStorage
   */
  saveConfigurations(): void {
    const configs = Array.from(this.servers.values()).map(server => server.config);

    try {
      localStorage.setItem('axen-mcp-configs', JSON.stringify(configs));
      console.log(`Saved ${configs.length} MCP server configurations`);
    } catch (error) {
      console.error('Failed to save MCP configurations:', error);
    }
  }

  /**
   * Load server configurations from localStorage
   */
  loadConfigurations(): void {
    try {
      const saved = localStorage.getItem('axen-mcp-configs');
      if (!saved) {
        console.log('No saved MCP configurations found');
        return;
      }

      const configs = JSON.parse(saved) as MCPServerConfig[];
      console.log(`Loading ${configs.length} MCP server configurations...`);

      // Clear existing servers (except those already registered)
      this.servers.clear();

      // Re-register all saved configurations
      configs.forEach(config => this.registerServer(config));

      console.log(`Loaded ${configs.length} MCP server configurations`);
    } catch (error) {
      console.error('Failed to load MCP configurations:', error);
    }
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

// Google Workspace MCP Servers
mcpService.registerServer({
  id: 'google-calendar',
  name: 'Google Calendar',
  description: 'Manage Google Calendar events, scheduling, and availability',
  command: 'uvx',
  args: ['workspace-mcp', '--tools', 'calendar'],
  env: {
    GOOGLE_OAUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
});

mcpService.registerServer({
  id: 'google-gmail',
  name: 'Gmail',
  description: 'Search, send, and organize Gmail messages',
  command: 'uvx',
  args: ['workspace-mcp', '--tools', 'gmail'],
  env: {
    GOOGLE_OAUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
});

mcpService.registerServer({
  id: 'google-drive',
  name: 'Google Drive',
  description: 'Upload, download, search, and manage Google Drive files',
  command: 'uvx',
  args: ['workspace-mcp', '--tools', 'drive'],
  env: {
    GOOGLE_OAUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
});

mcpService.registerServer({
  id: 'google-docs',
  name: 'Google Docs',
  description: 'Create, read, and edit Google Docs documents',
  command: 'uvx',
  args: ['workspace-mcp', '--tools', 'docs'],
  env: {
    GOOGLE_OAUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
});

mcpService.registerServer({
  id: 'google-sheets',
  name: 'Google Sheets',
  description: 'Create, read, and edit Google Sheets spreadsheets',
  command: 'uvx',
  args: ['workspace-mcp', '--tools', 'sheets'],
  env: {
    GOOGLE_OAUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
    GOOGLE_OAUTH_CLIENT_SECRET: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
});
