import React, { useState, useRef, FC, useEffect } from 'react';
import { useUserSession } from './hooks/useUserSession';
import { useInvites, Invite } from './hooks/useInvites';
import { useMessages } from './hooks/useMessages';
import { useSSE } from './hooks/useSSE';

import { NameGate } from './components/NameGate';
import { HostForm } from './components/HostForm';
import { JoinSheet } from './components/JoinSheet';
import { ChatSheet } from './components/ChatSheet';
import Notifications from './components/Notifications';
import MyEventsList from './components/MyEventsList';
import ConversationsList from './components/ConversationsList';
import { C } from './styles/theme';

type ModalState = 'nameGate' | 'hostForm' | 'joinSheet' | 'chatSheet' | null;
type TabType = 'live' | 'mine' | 'messages';

const App: FC = () => {
  const { user, setUser, logout } = useUserSession();
  const { invites, myEvents, createInvite, joinInvite, fetchInvites } = useInvites(user);
  const { messageInput, setMessageInput, sendMessage } = useMessages(user);
  const { isConnected, onEvent } = useSSE(user);

  const [modal, setModal] = useState<ModalState>(user ? null : 'nameGate');
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [tab, setTab] = useState<TabType>('live');
  const pendingAction = useRef<{ type: 'chat' | 'join'; invite: Invite } | null>(null);

  const handleNameSet = (name: string) => {
    setUser(name);
    setModal(null);
  };

  const handleHostCreate = async () => {
    console.log('🏠 Host created event, fetching invites...');
    await fetchInvites();
    // Switch to My Events tab so host can see their created event
    setTab('mine');
    setModal(null);
  };

  const handleJoinSuccess = () => {
    if (selectedInvite) {
      pendingAction.current = { type: 'chat', invite: selectedInvite };
      setModal(null);
    }
  };

  const handleOpenChat = (invite: Invite) => {
    setSelectedInvite(invite);
    setModal('chatSheet');
  };

  const handleDeleteEvent = async (eventId: number) => {
    console.log(`🗑️ Deleting event ${eventId}...`);
    await fetchInvites();
  };

  const handleCloseModal = () => {
    setModal(null);
    setSelectedInvite(null);
  };

  // After join success, open chat
  useEffect(() => {
    if (modal === null && pendingAction.current?.type === 'chat') {
      setSelectedInvite(pendingAction.current.invite);
      setModal('chatSheet');
      pendingAction.current = null;
    }
  }, [modal]);

  const renderModal = () => {
    if (!modal) return null;

    if (modal === 'nameGate') {
      return <NameGate onSet={handleNameSet} />;
    }
    if (modal === 'hostForm') {
      return <HostForm currentUser={user} onClose={handleCloseModal} onCreated={handleHostCreate} />;
    }
    if (modal === 'joinSheet' && selectedInvite) {
      return <JoinSheet invite={selectedInvite} currentUser={user} onClose={handleCloseModal} onJoined={handleJoinSuccess} />;
    }
    if (modal === 'chatSheet' && selectedInvite) {
      return <ChatSheet invite={selectedInvite} currentUser={user} onClose={handleCloseModal} />;
    }
    return null;
  };

  const liveCount = invites.filter(i => i.host !== user).length;
  const mineCount = myEvents.length;

  // Calculate user's events (for messages tab)
  const userEvents = invites.filter(invite =>
    invite.host === user ||
    (invite.guests || []).includes(user || '') ||
    (invite.joined_by || []).includes(user || '')
  );
  const messagesCount = userEvents.reduce((acc, inv) => acc + ((inv.messages || []).length), 0);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #8B7355 0%, #D2B48C 50%, #FAF0E6 100%)',
      color: C.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', 'Inter', sans-serif"
    }}>
      {/* Hero Header with Coffee Shop Vibe */}
      <div style={{
        background: 'linear-gradient(180deg, #6F4E37 0%, #4A3728 100%)',
        color: 'white',
        padding: '24px 24px 20px',
        borderBottom: `2px solid #8B7355`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            fontFamily: "'Georgia', 'Palatino', serif",
            letterSpacing: 1
          }}>☕ Sip&Link</p>
          <p style={{
            fontSize: 13,
            color: 'rgba(255, 240, 220, 0.9)',
            margin: '4px 0 0',
            fontStyle: 'italic'
          }}>Meet someone new over coffee</p>
        </div>
        {user && (
          <button
            style={{
              fontSize: 12,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onClick={logout}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
            }}
          >
            {user} (logout)
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `3px solid rgba(139, 115, 85, 0.2)`,
        background: 'rgba(255, 255, 255, 0.7)',
        padding: '0 24px',
        backdropFilter: 'blur(10px)'
      }}>
        {[
          { id: 'live' as const, label: '🔥 Live sessions', count: liveCount },
          { id: 'mine' as const, label: '💕 My events', count: mineCount },
          { id: 'messages' as const, label: '💬 Messages', count: messagesCount }
        ].map(t => (
          <button
            key={t.id}
            style={{
              flex: 1,
              padding: '14px 0',
              border: 'none',
              background: 'none',
              color: tab === t.id ? '#6F4E37' : '#A89880',
              fontWeight: tab === t.id ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer',
              borderBottom: tab === t.id ? `4px solid #8B7355` : 'none',
              position: 'relative',
              transition: 'all 0.3s',
              letterSpacing: 0.5
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 8,
                background: '#C47B3A',
                color: 'white',
                borderRadius: 12,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area with Gradient Background */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 24px 24px',
        marginBottom: 0,
        background: 'linear-gradient(to bottom, rgba(255,250,245,0.95), rgba(240,236,228,0.98))'
      }}>
        {tab === 'live' && (
          <>
            <button
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: 24,
                background: 'linear-gradient(135deg, #C47B3A 0%, #A65B28 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(196, 123, 58, 0.3)',
                transition: 'all 0.3s',
                letterSpacing: 0.5
              }}
              onClick={() => setModal('hostForm')}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(196, 123, 58, 0.4)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(196, 123, 58, 0.3)';
              }}
            >
              ☕ Host a session
            </button>

            {liveCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#A89880' }}>
                <p style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 500 }}>☕ No sessions yet</p>
                <p style={{ fontSize: 14, margin: 0, color: '#B8A490' }}>Be the first to host and meet someone new!</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 18,
                marginBottom: 20
              }}>
                {invites.filter(i => i.host !== user).map(invite => (
                  <div key={invite.id} style={{
                    background: 'white',
                    border: '2px solid #E8DCD0',
                    borderRadius: 14,
                    padding: 18,
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
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #C47B3A, #8B7355)',
                    }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, marginTop: 4 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #C47B3A, #8B7355)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: '0 4px 8px rgba(196, 123, 58, 0.2)'
                      }}>
                        {invite.host.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1C1208' }}>{invite.host}</p>
                        <p style={{ fontSize: 12, color: '#A89880', margin: '2px 0 0' }}>
                          {invite.beverages && invite.beverages.length > 0 
                            ? invite.beverages.join(', ')
                            : '☕ Coffee'}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: '#6B5A46', marginBottom: 12 }}>
                      <p style={{ margin: '0 0 6px' }}>📍 {invite.location}</p>
                      <p style={{ margin: '0 0 6px' }}>⏰ {invite.time}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0 }}>👥 {invite.spots} spot{invite.spots !== 1 ? 's' : ''} available</p>
                        {invite.spots === 0 && (
                          <span style={{
                            background: '#E74C3C',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.5
                          }}>FULL</span>
                        )}
                      </div>
                      <div style={{
                        background: '#F0E6D8',
                        height: 6,
                        borderRadius: 3,
                        marginTop: 6,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: invite.spots > 0 ? 'linear-gradient(90deg, #C47B3A, #8B7355)' : '#E74C3C',
                          width: `${Math.max(5, 100 - (invite.spots / (invite.original_spots || 1)) * 100)}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    <p style={{ fontSize: 12, fontStyle: 'italic', color: '#8B5A3B', marginBottom: 'auto', marginTop: 8, paddingTop: 8, borderTop: '1px solid #E8DCD0' }}>
                      "{invite.fun_fact}"
                    </p>

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
                        marginTop: 12,
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        setSelectedInvite(invite);
                        setModal('joinSheet');
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.background = '#A65B28';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.background = '#C47B3A';
                      }}
                    >
                      Join ☕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'mine' && (
          <MyEventsList myEvents={myEvents} currentUser={user} onChat={handleOpenChat} onDelete={handleDeleteEvent} />
        )}

        {tab === 'messages' && (
          <ConversationsList 
            userEvents={userEvents} 
            currentUser={user} 
            onOpenChat={handleOpenChat}
          />
        )}
      </div>

      {/* Modals */}
      {renderModal()}

      {/* Notifications */}
      <Notifications />
    </div>
  );
};

export default App;
