import React, { FC, useMemo } from 'react';
import { Invite } from '../hooks/useInvites';
import { inviteCardStyle, buttonPrimaryStyle } from '../styles/theme';

interface EventListProps {
  invites: Invite[];
  loading: boolean;
  submitting: boolean;
  currentUser: string | null;
  onJoin: (inviteId: string) => void;
  showForm: boolean;
}

/**
 * Component for displaying available events to join
 */
const EventList: FC<EventListProps> = ({ invites, loading, submitting, currentUser, onJoin, showForm }) => {
  // Memoize the title to prevent unnecessary re-renders
  const title = useMemo(() => {
    return showForm ? '👇 Or join one below:' : '☕ Happening Now';
  }, [showForm]);

  return (
    <div>
      <h2 style={{ color: '#6f4e37', marginTop: 20 }}>{title}</h2>

      {loading ? (
        <p style={{ color: '#666', textAlign: 'center' }}>⏳ Loading...</p>
      ) : invites.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>No events yet. Be first to host! ☕</p>
      ) : (
        invites.map((invite) => (
          <div key={invite.id} style={inviteCardStyle}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#6f4e37' }}>
              <b>{invite.time}</b> @ {invite.location}
            </p>
            {invite.detail && (
              <p style={{ margin: '5px 0', fontSize: '0.85em', color: '#8b6914' }}>📍 {invite.detail}</p>
            )}
            <p style={{ margin: '5px 0', color: '#6f4e37' }}>👤 With {invite.host}</p>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#6f4e37' }}>"{invite.fun_fact}"</p>

            {invite.beverages && invite.beverages.length > 0 && (
              <p style={{ margin: '8px 0', fontSize: '0.9em', color: '#6f4e37' }}>
                🍵 {invite.beverages.join(', ')}
              </p>
            )}

            <p style={{ margin: '8px 0', color: '#2e7d32', fontWeight: 'bold' }}>
              {invite.spots} {invite.spots === 1 ? 'spot' : 'spots'} left
            </p>

            {currentUser && invite.host.trim().toLowerCase() === currentUser.trim().toLowerCase() ? (
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  background: '#e0e0e0',
                  color: '#666',
                  borderRadius: 20,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  width: '100%',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >
                ✓ Your session
              </div>
            ) : (
              <button
                onClick={() => onJoin(invite.id)}
                disabled={submitting}
                style={{
                  ...buttonPrimaryStyle,
                  width: '100%',
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? '⏳ Joining...' : '🎯 Join'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;
