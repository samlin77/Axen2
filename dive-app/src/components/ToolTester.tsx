import { useState } from 'react';
import { mcpService } from '../services/mcp';
import type { MCPServerInstance } from '../services/mcp';

interface ToolTesterProps {
  servers: MCPServerInstance[];
}

export function ToolTester({ servers }: ToolTesterProps) {
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const connectedServers = servers.filter(s => s.status === 'connected');
  const selectedServerData = connectedServers.find(s => s.config.id === selectedServer);
  const availableTools = selectedServerData?.tools || [];

  const handleExecuteTool = async () => {
    if (!selectedServer || !selectedTool) {
      setError('Please select a server and tool');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Sanitize curly quotes to straight quotes (macOS smart quotes issue)
      const sanitizedArgs = toolArgs
        .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
        .replace(/[\u2018\u2019]/g, "'"); // Replace curly single quotes

      const args = JSON.parse(sanitizedArgs);
      const response = await mcpService.callTool(selectedServer, selectedTool, args);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getToolSchema = () => {
    const tool = availableTools.find(t => t.name === selectedTool);
    if (!tool) return null;

    const schema = tool.inputSchema;
    const example: any = {};

    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        const prop = (schema.properties as any)[key];
        if (prop.type === 'string') {
          example[key] = prop.description || 'value';
        }
      });
    }

    return { schema: tool.inputSchema, example };
  };

  return (
    <div className="tool-tester">
      <div className="tool-tester-header">
        <h3>MCP Tool Tester</h3>
        <p className="tool-tester-subtitle">Test MCP tools directly</p>
      </div>

      <div className="tool-tester-form">
        <div className="form-group">
          <label>MCP Server</label>
          <select
            value={selectedServer}
            onChange={(e) => {
              setSelectedServer(e.target.value);
              setSelectedTool('');
              setToolArgs('{}');
              setResult(null);
              setError('');
            }}
            disabled={connectedServers.length === 0}
          >
            <option value="">Select a server...</option>
            {connectedServers.map(server => (
              <option key={server.config.id} value={server.config.id}>
                {server.config.name} ({server.tools.length} tools)
              </option>
            ))}
          </select>
        </div>

        {selectedServer && (
          <div className="form-group">
            <label>Tool</label>
            <select
              value={selectedTool}
              onChange={(e) => {
                const newToolName = e.target.value;
                setSelectedTool(newToolName);

                // Get schema for the newly selected tool
                const tool = availableTools.find(t => t.name === newToolName);
                if (tool) {
                  const example: any = {};
                  const schema = tool.inputSchema;

                  if (schema.properties) {
                    Object.keys(schema.properties).forEach(key => {
                      const prop = (schema.properties as any)[key];
                      if (prop.type === 'string') {
                        // Use user-specific defaults for common parameters
                        if (key === 'user_google_email') {
                          example[key] = 'samlin77@gmail.com';
                        } else if (key === 'service_name') {
                          example[key] = 'Axen Desktop';
                        } else {
                          example[key] = `example_${key}`;
                        }
                      }
                    });
                  }

                  setToolArgs(JSON.stringify(example, null, 2));
                }

                setResult(null);
                setError('');
              }}
            >
              <option value="">Select a tool...</option>
              {availableTools.map(tool => (
                <option key={tool.name} value={tool.name}>
                  {tool.name} - {tool.description || 'No description'}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedTool && (
          <>
            <div className="form-group">
              <label>Arguments (JSON)</label>
              <textarea
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                rows={6}
                placeholder='{"key": "value"}'
                className="tool-args-input"
              />
              {(() => {
                const toolData = getToolSchema();
                if (toolData) {
                  return (
                    <div className="tool-schema-hint">
                      <strong>Schema:</strong>
                      <pre>{JSON.stringify(toolData.schema, null, 2)}</pre>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <button
              onClick={handleExecuteTool}
              disabled={isLoading}
              className="execute-button"
            >
              {isLoading ? 'Executing...' : 'Execute Tool'}
            </button>
          </>
        )}

        {error && (
          <div className="tool-result error">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}

        {result && (
          <div className="tool-result success">
            <strong>Result:</strong>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>

      {connectedServers.length === 0 && (
        <div className="tool-tester-empty">
          <p>No MCP servers connected. Please connect a server first.</p>
        </div>
      )}
    </div>
  );
}
