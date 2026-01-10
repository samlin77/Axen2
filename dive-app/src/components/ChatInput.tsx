import { useState, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onClear, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      {onClear && (
        <button
          onClick={onClear}
          className="chat-clear-button"
          title="Clear chat history"
        >
          Clear
        </button>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="chat-input-field"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="chat-send-button"
      >
        Send
      </button>
    </div>
  );
}
