import React, { FC, useMemo, useState } from 'react';
import { Invite } from '../hooks/useInvites';
import { C } from '../styles/theme';
import { API_URL } from '../config/api';

interface MyEventsListProps {
  myEvents: Invite[];
  currentUser: string | null;
  onChat: (event: Invite) => void;
  onDelete?: (eventId: number) => Promise<void>;
}

const MyEventsList: FC<MyEventsListProps> = ({ myEvents, currentUser, onChat, onDelete }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const { hosted, joined } = useMemo(() => ({
    // FIXED: Normalize comparison (backend sends normalized names)
    hosted: myEvents.filter(e => e.host === currentUser),
    joined: myEvents.filter(e => e.host !== currentUser)
  }), [myEvents, currentUser]);

  const handleDelete = async (invite: Invite) => {
    if (!window.confirm(
      `Are you sure you want to delete this session at ${invite.location}? This cannot be undone.`
    )) {
      return;
    }

    setDeletingId(invite.id);
    try {
      const response = await fetch(`${API_URL}/invites/${invite.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: currentUser })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      // Notify parent to refresh events
      if (onDelete) {
        await onDelete(invite.id);
      }
    } catch (error) {
      alert(`Error deleting event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const EventCard: FC<{ invite: Invite; isHosted: boolean }> = ({ invite, isHosted }) => (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: C.accent,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0
        }}>
          {(isHosted ? invite.host : invite.host).substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.text }}>
            {isHosted ? 'You\'re hosting' : 'You\'re joining'}
          </p>
          <p style={{ fontSize: 12, color: C.textHint, margin: '2px 0 0' }}>
            with {isHosted ? 'potential guests' : invite.host}
          </p>
        </div>
      </div>

      <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 12 }}>
        <p style={{ margin: '0 0 6px' }}>📍 {invite.location}{invite.detail ? ` - ${invite.detail}` : ''}</p>
        <p style={{ margin: '0 0 6px' }}>⏰ {invite.time}</p>
        <p style={{ margin: 0 }}>🍵 {(invite.beverages || []).join(', ') || 'Beverage TBA'}</p>
        {isHosted && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>👥 Capacity:</span>
              {invite.spots === 0 && (
                <span style={{
                  background: '#E74C3C',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700
                }}>FULL</span>
              )}
            </div>
            <div style={{
              background: C.surface2,
              height: 6,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: invite.spots > 0 ? C.accent : '#E74C3C',
                width: `${Math.max(5, 100 - (invite.spots / (invite.original_spots || 1)) * 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ fontSize: 11, color: C.textHint, margin: '4px 0 0', textAlign: 'right' }}>
              {invite.original_spots - invite.spots} / {invite.original_spots} joined
            </p>
          </div>
        )}
      </div>

      {(() => {
        const allGuests = [...(invite.guests || []), ...(invite.joined_by || [])];
        return allGuests.length > 0 ? (
          <div style={{
            background: C.surface2,
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 12,
            fontSize: 12
          }}>
            <p style={{ color: C.textHint, margin: 0, marginBottom: 6 }}>✅ {allGuests.length} joined</p>
            {allGuests.map((g, i) => (
              <p key={i} style={{ color: C.text, margin: '2px 0', fontSize: 12 }}>• {g}</p>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: C.textSoft, fontStyle: 'italic', margin: '0 0 12px' }}>
            Waiting for someone...
          </p>
        );
      })()}

      <button
        style={{
          width: '100%',
          padding: '8px 12px',
          background: C.accent,
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: isHosted ? 8 : 0
        }}
        onClick={() => onChat(invite)}
      >
        💬 Chat
      </button>
      
      {isHosted && (
        <button
          style={{
            width: '100%',
            padding: '8px 12px',
            background: deletingId === invite.id ? '#95A5A6' : '#E67E22',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: deletingId === invite.id ? 'not-allowed' : 'pointer',
            opacity: deletingId === invite.id ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
          onClick={() => handleDelete(invite)}
          disabled={deletingId === invite.id}
          onMouseOver={(e) => {
            if (deletingId !== invite.id) {
              (e.target as HTMLButtonElement).style.background = '#D35400';
            }
          }}
          onMouseOut={(e) => {
            if (deletingId !== invite.id) {
              (e.target as HTMLButtonElement).style.background = '#E67E22';
            }
          }}
        >
          {deletingId === invite.id ? '⏳ Deleting...' : '🗑️ End session'}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {hosted.length === 0 && joined.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: C.textHint }}>
          <p style={{ fontSize: 16, margin: '0 0 8px' }}>No events yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>Go to Live sessions to host or join</p>
        </div>
      ) : (
        <>
          {hosted.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>👑 Hosting</h3>
              {hosted.map(e => <EventCard key={e.id} invite={e} isHosted={true} />)}
            </div>
          )}

          {joined.length > 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 12px' }}>🎯 Joined</h3>
              {joined.map(e => <EventCard key={e.id} invite={e} isHosted={false} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyEventsList;
