import { useState, useEffect } from 'react';
import { mcpService } from '../services/mcp';
import type { MCPServerInstance } from '../services/mcp';
import { ToolTester } from './ToolTester';
import { ErrorBoundary } from './ErrorBoundary';
import { GoogleOAuthSetup } from './GoogleOAuthSetup';

export function MCPServers() {
  const [servers, setServers] = useState<MCPServerInstance[]>([]);
  const [showToolTester, setShowToolTester] = useState(false);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);
  const [pendingServerId, setPendingServerId] = useState<string | null>(null);

  useEffect(() => {
    // Load saved configurations and servers on component mount
    mcpService.loadConfigurations();
    setServers(mcpService.getServers());
  }, []);

  const handleConnect = async (serverId: string) => {
    // Check if this is a Google Workspace server
    const googleServers = ['google-calendar', 'google-gmail', 'google-drive', 'google-docs', 'google-sheets'];
    const isGoogleServer = googleServers.includes(serverId);

    // Check if OAuth is configured
    const hasOAuth = localStorage.getItem('google-oauth-client-id') && localStorage.getItem('google-oauth-client-secret');

    if (isGoogleServer && !hasOAuth) {
      // Show OAuth setup dialog
      setPendingServerId(serverId);
      setShowOAuthSetup(true);
      return;
    }

    try {
      await mcpService.connectServer(serverId);
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to connect:', error);
      setServers(mcpService.getServers());
    }
  };

  const handleOAuthComplete = async (clientId: string, clientSecret: string) => {
    // Save OAuth credentials to localStorage
    localStorage.setItem('google-oauth-client-id', clientId);
    localStorage.setItem('google-oauth-client-secret', clientSecret);

    // Update environment variables in mcp service
    // Note: This requires app restart to take effect properly
    console.log('OAuth credentials saved. Restarting required for full effect.');

    // Close dialog
    setShowOAuthSetup(false);

    // Try to connect the pending server
    if (pendingServerId) {
      try {
        await mcpService.connectServer(pendingServerId);
        setServers(mcpService.getServers());
      } catch (error) {
        console.error('Failed to connect after OAuth setup:', error);
        alert('OAuth credentials saved, but connection failed. Please restart the app and try again.');
      }
      setPendingServerId(null);
    }
  };

  const handleOAuthCancel = () => {
    setShowOAuthSetup(false);
    setPendingServerId(null);
  };

  const handleDisconnect = async (serverId: string) => {
    try {
      await mcpService.disconnectServer(serverId);
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleConnectAll = async () => {
    setIsLoadingBulk(true);
    try {
      const allServerIds = servers.map(s => s.config.id);
      await mcpService.connectMultiple(allServerIds);
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to connect all servers:', error);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const handleDisconnectAll = async () => {
    setIsLoadingBulk(true);
    try {
      await mcpService.disconnectAll();
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to disconnect all servers:', error);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const handleHealthCheckAll = async () => {
    setIsLoadingBulk(true);
    try {
      await mcpService.healthCheckAll();
      setServers(mcpService.getServers());
    } catch (error) {
      console.error('Failed to health check servers:', error);
    } finally {
      setIsLoadingBulk(false);
    }
  };

  const handleSaveConfigs = () => {
    mcpService.saveConfigurations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#6fa372';
      case 'connecting':
        return '#d4c8aa';
      case 'error':
        return '#b54a35';
      default:
        return '#7d6b56';
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

  const connectedCount = servers.filter(s => s.status === 'connected').length;
  const hasServers = servers.length > 0;

  return (
    <div className="mcp-servers">
      <div className="mcp-servers-header">
        <h2>MCP Servers</h2>
        <p className="mcp-servers-subtitle">
          Model Context Protocol servers provide tools and resources for the AI
        </p>

        <div className="mcp-bulk-actions">
          <button
            className="mcp-button mcp-button-primary"
            onClick={handleConnectAll}
            disabled={isLoadingBulk || !hasServers || connectedCount === servers.length}
          >
            {isLoadingBulk ? 'Connecting...' : 'Connect All'}
          </button>
          <button
            className="mcp-button mcp-button-secondary"
            onClick={handleDisconnectAll}
            disabled={isLoadingBulk || connectedCount === 0}
          >
            {isLoadingBulk ? 'Disconnecting...' : 'Disconnect All'}
          </button>
          <button
            className="mcp-button mcp-button-secondary"
            onClick={handleHealthCheckAll}
            disabled={isLoadingBulk || connectedCount === 0}
          >
            Health Check
          </button>
          <button
            className="mcp-button mcp-button-secondary"
            onClick={handleSaveConfigs}
            disabled={!hasServers}
          >
            Save Configs
          </button>
        </div>

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

      {/* OAuth Setup Dialog */}
      {showOAuthSetup && (
        <GoogleOAuthSetup
          onComplete={handleOAuthComplete}
          onCancel={handleOAuthCancel}
        />
      )}
    </div>
  );
}
