import { useState, useEffect } from 'react'
import './App.css'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import { MCPServers } from './components/MCPServers'
import { geminiService } from './services/gemini'
import { mcpService } from './services/mcp'

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

type View = 'chat' | 'servers';

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m the Dive AI Assistant powered by Google Gemini with MCP integration.\n\nI can help you with various tasks. You can also connect MCP servers from the "MCP Servers" tab to give me access to additional tools and capabilities.\n\nHow can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectedTools, setConnectedTools] = useState<string[]>([]);

  // Monitor MCP server connections and update Gemini tools
  useEffect(() => {
    const updateTools = () => {
      const allTools = mcpService.getAllTools();
      const toolNames = allTools.flatMap(server =>
        server.tools.map(tool => `${server.serverName}: ${tool.name}`)
      );
      setConnectedTools(toolNames);

      // Update Gemini with available tools
      const flatTools = allTools.flatMap(server => server.tools);
      console.log('[App] Updating Gemini with tools:', flatTools.map(t => t.name));
      geminiService.setAvailableTools(flatTools);
    };

    // Update initially
    updateTools();

    // Poll for changes every 2 seconds
    const interval = setInterval(updateTools, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (content: string) => {
    console.log('[App] handleSendMessage called with:', content);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create empty AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      console.log('[App] Processing message:', content);

      // Check if user is asking to read a file (simple pattern matching for MVP)
      const readFileMatch = content.match(/read (?:the )?files? (.+)/i);
      const listDirMatch = content.match(/list (?:files? )?(?:in |under |from )?(.+)/i);

      if (readFileMatch && connectedTools.length > 0) {
        // User wants to read a file - call tool directly
        let filePath = readFileMatch[1].trim();

        // Remove quotes if present
        filePath = filePath.replace(/^["']|["']$/g, '');

        console.log('[App] Detected file read request. Original:', readFileMatch[1]);
        console.log('[App] Cleaned path:', filePath);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `🔧 **Reading file:** \`${filePath}\`\n\n` }
              : msg
          )
        );

        try {
          console.log('[App] Calling MCP tool with args:', { path: filePath });
          const result = await mcpService.callTool('filesystem', 'read_file', { path: filePath });
          console.log('[App] File read result:', result);

          if (result && typeof result === 'object' && 'content' in result) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: `✅ **File Content:**\n\n${result.content}\n\n---\n**Path:** ${filePath}` }
                  : msg
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: `✅ **Result:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`` }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error('[App] Tool error:', error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `❌ **Error:** ${error}` }
                : msg
            )
          );
        }
      } else if (listDirMatch && connectedTools.length > 0) {
        // User wants to list directory
        let dirPath = listDirMatch[1].trim();
        // Remove quotes if present
        dirPath = dirPath.replace(/^["']|["']$/g, '');
        // Remove trailing slash
        dirPath = dirPath.replace(/\/$/, '');
        console.log('[App] Detected directory list request. Original:', listDirMatch[1]);
        console.log('[App] Cleaned path:', dirPath);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `🔧 **Listing directory:** ${dirPath}\n\n` }
              : msg
          )
        );

        try {
          const result = await mcpService.callTool('filesystem', 'list_directory', { path: dirPath });
          console.log('[App] Directory list result:', result);

          // Format the file list nicely
          if (result && typeof result === 'object' && 'files' in result && Array.isArray(result.files)) {
            const fileList = result.files.map((file, index) => `${index + 1}. ${file}`).join('\n');
            const fileCount = result.files.length;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: `✅ **Directory Contents:** (${fileCount} items)\n\n${fileList}\n\n---\n**Path:** ${dirPath}` }
                  : msg
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: `✅ **Result:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`` }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error('[App] Tool error:', error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `❌ **Error:** ${error}` }
                : msg
            )
          );
        }
      } else {
        // Regular AI chat - no tool needed
        console.log('[App] Regular chat message, calling Gemini...');
        let chunkCount = 0;

        for await (const chunk of geminiService.sendMessageStream(content)) {
          chunkCount++;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }

        console.log(`[App] Stream complete. Total chunks: ${chunkCount}`);
      }
    } catch (error) {
      console.error('[App] Error getting AI response:', error);

      let errorMessage = 'Sorry, I encountered an error.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        if (error.message.includes('API key')) {
          errorMessage += '\n\nPlease check your VITE_GEMINI_API_KEY in the .env file.';
        } else if (error.message.includes('model')) {
          errorMessage += '\n\nThe Gemini model may not be available. Please try again later.';
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: errorMessage }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Dive</h1>
          <span className="subtitle">AI Agent Platform</span>
        </div>

        <nav className="app-nav">
          <button
            className={`nav-button ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentView('chat')}
          >
            Chat
          </button>
          <button
            className={`nav-button ${currentView === 'servers' ? 'active' : ''}`}
            onClick={() => setCurrentView('servers')}
          >
            MCP Servers
          </button>
        </nav>
      </header>
      <main className="app-main">
        {currentView === 'chat' ? (
          <div className="chat-container">
            {connectedTools.length > 0 && (
              <div className="mcp-tools-indicator">
                <span className="mcp-tools-label">🔧 {connectedTools.length} tools</span>
              </div>
            )}
            <MessageList messages={messages} />
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        ) : (
          <MCPServers />
        )}
      </main>
    </div>
  )
}

export default App
