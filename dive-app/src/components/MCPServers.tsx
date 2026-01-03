import { useState, useEffect } from 'react';
import { mcpService } from '../services/mcp';
import type { MCPServerInstance } from '../services/mcp';
import { ToolTester } from './ToolTester';
import { ErrorBoundary } from './ErrorBoundary';

export function MCPServers() {
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [showToolTester, setShowToolTester] = useState(false);

  useEffect(() => {
    // Load servers on component mount
    setServers(mcpService.getServers());
  }, []);

  const handleConnect = async (serverId: string) => {
    try {
      await mcpService.connectServer(serverId);
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to connect:', error);
      setServers(mcpService.getServers());
    }
  };

  const handleDisconnect = async (serverId: string) => {
    try {
      await mcpService.disconnectServer(serverId);
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#10b981';
      case 'connecting':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="mcp-servers">
      <div className="mcp-servers-header">
        <h2>MCP Servers</h2>
        <p className="mcp-servers-subtitle">
          Model Context Protocol servers provide tools and resources for the AI
        </p>
        <button
          className="tool-tester-toggle"
          onClick={() => setShowToolTester(!showToolTester)}
        >
          {showToolTester ? 'Hide Tool Tester' : 'Show Tool Tester'}
        </button>
      </div>

      {showToolTester && (
        <ErrorBoundary>
          <ToolTester servers={servers} />
        </ErrorBoundary>
      )}

      <div className="mcp-servers-list">
        {servers.map((server) => (
          <div key={server.config.id} className="mcp-server-card">
            <div className="mcp-server-info">
              <div className="mcp-server-name-row">
                <h3>{server.config.name}</h3>
                <div
                  className="mcp-server-status"
                  style={{ backgroundColor: getStatusColor(server.status) }}
                >
                  {getStatusText(server.status)}
                </div>
              </div>

              {server.config.description && (
                <p className="mcp-server-description">{server.config.description}</p>
              )}

              <div className="mcp-server-command">
                <code>
                  {server.config.command} {server.config.args.join(' ')}
                </code>
              </div>

              {server.error && (
                <div className="mcp-server-error">
                  <strong>Error:</strong> {server.error}
                </div>
              )}

              {server.status === 'connected' && (
                <div className="mcp-server-stats">
                  <span className="mcp-stat">
                    {server.tools.length} tools
                  </span>
                  <span className="mcp-stat">
                    {server.resources.length} resources
                  </span>
                </div>
              )}
            </div>

            <div className="mcp-server-actions">
              {server.status === 'disconnected' || server.status === 'error' ? (
                <button
                  className="mcp-button mcp-button-connect"
                  onClick={() => handleConnect(server.config.id)}
                >
                  Connect
                </button>
              ) : server.status === 'connected' ? (
                <button
                  className="mcp-button mcp-button-disconnect"
                  onClick={() => handleDisconnect(server.config.id)}
                >
                  Disconnect
                </button>
              ) : (
                <button className="mcp-button" disabled>
                  Connecting...
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {servers.length === 0 && (
        <div className="mcp-empty-state">
          <p>No MCP servers registered</p>
        </div>
      )}
    </div>
  );
}
