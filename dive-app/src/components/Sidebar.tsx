import './Sidebar.css'

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onShowSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onShowSettings,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header-row">
        <h1 className="sidebar-title">Axen</h1>
        <button className="sidebar-collapse-button" onClick={onToggleCollapse} title="Hide sidebar">
          <span className="collapse-icon">◧</span>
        </button>
      </div>

      <button className="new-chat-button" onClick={onNewChat}>
        + New chat
      </button>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Recents</h3>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <span className="conversation-title">{conv.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-footer-button" onClick={onShowSettings}>
          <span className="footer-icon">⚙️</span>
          MCP Servers
        </button>
      </div>
    </div>
  );
}
