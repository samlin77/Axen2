import { useState, useEffect } from 'react'
import './App.css'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import { MCPServers } from './components/MCPServers'
import { Sidebar } from './components/Sidebar'
import { AgentThinking } from './components/AgentThinking'
import { ConfirmationDialog } from './components/ConfirmationDialog'
import { geminiService } from './services/gemini'
import { mcpService } from './services/mcp'
import type { AgentTask, ConfirmationGate } from './services/agent-flow'
import { testOAuthOpen } from './test-oauth-open'

// Expose test function to browser console
if (typeof window !== 'undefined') {
  (window as any).testOAuthOpen = testOAuthOpen;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

type View = 'chat' | 'servers';

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load conversations from localStorage or create default
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('axen-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((conv: Conversation) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (e) {
        console.error('Failed to parse saved conversations:', e);
      }
    }
    // Create default conversation
    const defaultConv: Conversation = {
      id: Date.now().toString(),
      title: 'New chat',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          content: 'Hello! I\'m the Axen AI Assistant powered by Google Gemini with MCP integration.\n\nI can help you with various tasks. You can also connect MCP servers from the "MCP Servers" settings to give me access to additional tools and capabilities.\n\nHow can I help you today?',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]
    };
    return [defaultConv];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    const saved = localStorage.getItem('axen-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed[0]?.id || Date.now().toString();
      } catch {
        return Date.now().toString();
      }
    }
    return Date.now().toString();
  });

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0];
  const messages = currentConversation?.messages || [];

  const [isLoading, setIsLoading] = useState(false);
  const [connectedTools, setConnectedTools] = useState<string[]>([]);

  // Agent flow state
  const [currentTask] = useState<AgentTask | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationGate | null>(null);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('axen-conversations', JSON.stringify(conversations));
  }, [conversations]);

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

    // Update conversation title if it's the first user message
    if (currentConversation && currentConversation.messages.length === 1) {
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, title }
            : conv
        )
      );
    }

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

      // Check if user is asking for file operations but MCP is not connected
      if ((readFileMatch || listDirMatch) && connectedTools.length === 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `⚠️ **MCP Server Not Connected**\n\n` +
                           `I detected that you want to access files, but no MCP servers are currently connected.\n\n` +
                           `**To enable file access:**\n` +
                           `1. Go to the **MCP Servers** tab\n` +
                           `2. Click **Connect** on the Filesystem Server\n` +
                           `3. Come back to Chat and try again\n\n` +
                           `*Note: File operations require MCP server permissions.*`
                }
              : msg
          )
        );
        setIsLoading(false);
        return;
      }

      if (readFileMatch && connectedTools.length > 0) {
        // User wants to read a file - call tool directly
        let filePath = readFileMatch[1].trim();

        // Remove quotes, backticks if present
        filePath = filePath.replace(/^["'`]|["'`]$/g, '');

        console.log('[App] Detected file read request. Original:', readFileMatch[1]);
        console.log('[App] Cleaned path:', filePath);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `<div class="loading-indicator">🔧 **Reading file:** \`${filePath}\`<span class="loading-dots">...</span></div>` }
              : msg
          )
        );

        try {
          console.log('[App] Calling MCP tool with args:', { path: filePath });
          const result = await mcpService.callTool('filesystem', 'read_file', { path: filePath });
          console.log('[App] File read result:', result);

          // Check if the result indicates an error
          if (result && typeof result === 'object' && 'success' in result && !result.success) {
            throw new Error((result as any).error || 'Unknown error occurred');
          }

          if (result && typeof result === 'object' && 'content' in result) {
            const fileContent = result.content as string;
            const lineCount = fileContent.split('\n').length;
            const charCount = fileContent.length;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: `I successfully read the file **${filePath.split('/').pop()}**.\n\n` +
                               `📄 **File Details:**\n` +
                               `- Lines: ${lineCount}\n` +
                               `- Characters: ${charCount}\n\n` +
                               `**Content:**\n\`\`\`\n${fileContent}\n\`\`\`\n\n` +
                               `*Full path: ${filePath}*`
                    }
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
          const errorMsg = error instanceof Error ? error.message : String(error);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `❌ **Error reading file**\n\n${errorMsg}\n\n**Path:** \`${filePath}\`\n\n*Tip: Make sure the file path is correct and the file exists.*` }
                : msg
            )
          );
        }
      } else if (listDirMatch && connectedTools.length > 0) {
        // User wants to list directory
        let dirPath = listDirMatch[1].trim();
        // Remove quotes, backticks if present
        dirPath = dirPath.replace(/^["'`]|["'`]$/g, '');
        // Remove trailing slash
        dirPath = dirPath.replace(/\/$/, '');
        console.log('[App] Detected directory list request. Original:', listDirMatch[1]);
        console.log('[App] Cleaned path:', dirPath);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: `<div class="loading-indicator">🔧 **Listing directory:** ${dirPath}<span class="loading-dots">...</span></div>` }
              : msg
          )
        );

        try {
          const result = await mcpService.callTool('filesystem', 'list_directory', { path: dirPath });
          console.log('[App] Directory list result:', result);

          // Check if the result indicates an error
          if (result && typeof result === 'object' && 'success' in result && !result.success) {
            throw new Error((result as any).error || 'Unknown error occurred');
          }

          // Format the file list nicely
          if (result && typeof result === 'object' && 'files' in result && Array.isArray(result.files)) {
            const files = result.files as string[];
            const fileCount = files.length;
            const fileList = files.map((file, index) => `${index + 1}. ${file}`).join('\n');
            const dirName = dirPath.split('/').pop() || dirPath;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: `I found **${fileCount} items** in the directory **${dirName}**.\n\n` +
                               `📁 **Directory Listing:**\n\n${fileList}\n\n` +
                               `*Full path: ${dirPath}*`
                    }
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
          const errorMsg = error instanceof Error ? error.message : String(error);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: `❌ **Error listing directory**\n\n${errorMsg}\n\n**Path:** \`${dirPath}\`\n\n*Tip: Make sure the directory path is correct and accessible.*` }
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

  // Helper function to update messages in current conversation
  const setMessages = (updater: (prev: Message[]) => Message[]) => {
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: updater(conv.messages) }
          : conv
      )
    );
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New chat',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          content: 'Hello! How can I help you today?',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setCurrentView('chat');
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setCurrentView('chat');
  };

  const handleShowSettings = () => {
    setCurrentView('servers');
  };

  const handleClearChat = () => {
    console.log('[App] Clear chat clicked');
    setMessages(() => [
      {
        id: Date.now().toString(),
        content: 'Chat history cleared. How can I help you today?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="app">
      {sidebarCollapsed && (
        <button
          className="sidebar-toggle-collapsed"
          onClick={() => setSidebarCollapsed(false)}
          title="Show sidebar"
        >
          ☰
        </button>
      )}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onShowSettings={handleShowSettings}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="app-main">
        {currentView === 'chat' ? (
          <div className="chat-container">
            {connectedTools.length > 0 && (
              <div className="mcp-tools-indicator">
                <span className="mcp-tools-label">🔧 {connectedTools.length} tools</span>
              </div>
            )}
            <MessageList messages={messages} />
            {currentTask && <AgentThinking task={currentTask} />}
            <ChatInput onSend={handleSendMessage} onClear={handleClearChat} disabled={isLoading} />
          </div>
        ) : (
          <div className="settings-view">
            <div className="settings-header">
              <h2>MCP Servers</h2>
            </div>
            <div className="settings-content">
              <MCPServers />
            </div>
          </div>
        )}
      </main>
      {pendingConfirmation && (
        <ConfirmationDialog
          gate={pendingConfirmation}
          onApprove={() => {
            setPendingConfirmation(null);
            // Confirmation handling will be implemented when we add full agentic flow
          }}
          onReject={() => {
            setPendingConfirmation(null);
          }}
        />
      )}
    </div>
  )
}

export default App
