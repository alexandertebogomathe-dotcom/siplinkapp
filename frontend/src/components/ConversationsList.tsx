import React, { FC } from 'react';
import { Invite } from '../hooks/useInvites';
import { C } from '../styles/theme';

interface ConversationsListProps {
  userEvents: Invite[];
  currentUser: string | null;
  onOpenChat: (invite: Invite) => void;
}

const ConversationsList: FC<ConversationsListProps> = ({ userEvents, currentUser, onOpenChat }) => {
  if (userEvents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#A89880' }}>
        <p style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 500 }}>💬 No conversations yet</p>
        <p style={{ fontSize: 14, margin: 0, color: '#B8A490' }}>Join or host an event to start chatting!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {userEvents.map((invite) => {
        // Get all participants for the conversation
        const allGuests = [...(invite.guests || []), ...(invite.joined_by || [])];
        const isHost = invite.host === currentUser;
        const otherParticipants = isHost ? allGuests : [invite.host, ...allGuests.filter(g => g !== currentUser)];
        
        // Count unread messages (simple: just show total message count)
        const messageCount = (invite.messages || []).length;

        return (
          <div
            key={invite.id}
            style={{
              background: 'white',
              border: '2px solid #E8DCD0',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              const el = (e.currentTarget as HTMLDivElement);
              el.style.transform = 'translateY(-4px)';
              el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              el.style.borderColor = '#C47B3A';
            }}
            onMouseOut={(e) => {
              const el = (e.currentTarget as HTMLDivElement);
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              el.style.borderColor = '#E8DCD0';
            }}
          >
            {/* Top Accent Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${messageCount > 0 ? '#C47B3A' : '#A89880'}, #8B7355)`,
              }}
            />

            {/* Event Info */}
            <div style={{ marginBottom: 12, marginTop: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#1C1208' }}>
                📍 {invite.location}
              </p>
              <p style={{ fontSize: 12, color: '#6B5A46', margin: 0 }}>
                ⏰ {invite.time}
              </p>
            </div>

            {/* Participants */}
            <div style={{ fontSize: 12, color: '#6B5A46', marginBottom: 12 }}>
              <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>👥 Participants ({allGuests.length + 1}):</p>
              <p style={{ margin: '2px 0', color: '#8B5A3B' }}>
                🎯 <strong>{invite.host}</strong> {isHost ? '(you - host)' : '(host)'}
              </p>
              {allGuests.map((guest, i) => (
                <p key={i} style={{ margin: '2px 0', color: '#8B5A3B' }}>
                  💬 {guest} {guest === currentUser ? '(you)' : ''}
                </p>
              ))}
              
              {/* Capacity Indicator */}
              {invite.spots === 0 && (
                <p style={{
                  margin: '6px 0 0',
                  padding: '4px 8px',
                  background: '#FADBD8',
                  borderRadius: 4,
                  color: '#C0392B',
                  fontWeight: 600,
                  fontSize: 11
                }}>
                  🔴 Session Full
                </p>
              )}
            </div>

            {/* Message Count Badge */}
            <div style={{
              background: '#EBF4EA',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: 12, color: '#3A6B35', fontWeight: 600 }}>
                💬 {messageCount} message{messageCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Open Chat Button */}
            <button
              style={{
                background: '#C47B3A',
                color: 'white',
                border: 'none',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s'
              }}
              onClick={() => onOpenChat(invite)}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.background = '#A65B28';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.background = '#C47B3A';
              }}
            >
              Open Chat 💬
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;
