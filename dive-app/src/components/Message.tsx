import ReactMarkdown from 'react-markdown';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

export function Message({ content, role, timestamp }: MessageProps) {
  return (
    <div className={`message ${role}`}>
      <div className="message-header">
        <span className="message-role">
          {role === 'user' ? 'You' : 'AI Assistant'}
        </span>
        {timestamp && (
          <span className="message-time">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div className="message-content">
        {role === 'assistant' ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
