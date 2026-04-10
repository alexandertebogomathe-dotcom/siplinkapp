import React, { FC, useRef, useEffect } from 'react';
import { Invite } from '../hooks/useInvites';
import { chatModalBackdropStyle, chatModalContentStyle, messageBubbleStyle } from '../styles/theme';

interface ChatModalProps {
  selectedInvite: Invite | null;
  currentUser: string | null;
  messageInput: string;
  setMessageInput: (input: string) => void;
  submitting: boolean;
  onSendMessage: () => void;
  onClose: () => void;
}

/**
 * Component for event messaging modal
 */
const ChatModal: FC<ChatModalProps> = ({
  selectedInvite,
  currentUser,
  messageInput,
  setMessageInput,
  submitting,
  onSendMessage,
  onClose
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInvite?.messages]);

  if (!selectedInvite) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !submitting && messageInput.trim()) {
      onSendMessage();
    }
  };

  return (
    <div style={chatModalBackdropStyle} onClick={handleBackdropClick}>
      <div style={chatModalContentStyle} onClick={(e) => e.stopPropagation()}>
        {/* EVENT HEADER */}
        <h3 style={{ color: '#6f4e37', marginTop: 0 }}>☕ {selectedInvite.host}'s Coffee</h3>
        <p style={{ color: '#6f4e37', marginBottom: 4 }}>
          <b>📍</b> {selectedInvite.location}
          {selectedInvite.detail && ` (${selectedInvite.detail})`}
        </p>
        <p style={{ color: '#6f4e37', marginBottom: 8 }}>
          <b>⏰</b> {selectedInvite.time}
        </p>
        <p style={{ color: '#6f4e37', fontStyle: 'italic', marginBottom: 12 }}>"{selectedInvite.fun_fact}"</p>

        <hr style={{ borderColor: '#ddd', margin: '12px 0' }} />

        {/* PARTICIPANTS */}
        <div style={{ background: 'rgba(0, 0, 0, 0.05)', padding: 8, borderRadius: 4, marginBottom: 12 }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.9em', fontWeight: 'bold' }}>👥 Participants:</p>
          <p style={{ margin: '2px 0', fontSize: '0.85em' }}>
            👤 <strong>Host:</strong> {selectedInvite.host}
          </p>
          {selectedInvite.guests && selectedInvite.guests.length > 0 && (
            <>
              <p style={{ margin: '6px 0 2px 0', fontSize: '0.85em' }}>
                <strong>Guests:</strong>
              </p>
              {selectedInvite.guests.map((guest, idx) => (
                <p key={idx} style={{ margin: '2px 0 2px 12px', fontSize: '0.85em' }}>
                  • {guest}
                </p>
              ))}
            </>
          )}
        </div>

        {/* MESSAGES */}
        <div
          style={{
            background: 'white',
            border: '1px solid #d2691e',
            borderRadius: 4,
            padding: 12,
            marginBottom: 12,
            maxHeight: 200,
            overflowY: 'auto',
            minHeight: 80
          }}
        >
          {selectedInvite.messages && selectedInvite.messages.length > 0 ? (
            <>
              {selectedInvite.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 10,
                    padding: 8,
                    background: msg.sender === currentUser ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 4,
                    borderLeft: `3px solid ${msg.sender === currentUser ? '#2196f3' : '#d2691e'}`
                  }}
                >
                  <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '0.85em', color: '#333' }}>
                    {msg.sender}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <p style={{ margin: 0, color: '#999', textAlign: 'center', padding: '20px 0' }}>
              💬 Start the conversation!
            </p>
          )}
        </div>

        {/* MESSAGE INPUT */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={submitting}
            style={{
              flex: 1,
              padding: 10,
              boxSizing: 'border-box',
              borderRadius: 4,
              border: '2px solid #d2691e',
              fontSize: '14px',
              opacity: submitting ? 0.6 : 1
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={submitting || !messageInput.trim()}
            style={{
              padding: '10px 16px',
              background: submitting || !messageInput.trim() ? '#ccc' : '#d2691e',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: submitting || !messageInput.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            📤
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={submitting}
          style={{
            width: '100%',
            padding: 10,
            background: submitting ? '#999' : '#a0826d',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
