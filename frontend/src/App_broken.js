import React, { useEffect, useState } from 'react';

// Dynamically determine API URL
const getAPIUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:5000`;
  }
  return `${window.location.protocol}//${hostname}:5000`;
};

const API = getAPIUrl();

// Beverage options available
const BEVERAGE_OPTIONS = ['☕ Coffee', '🍵 Tea', '🥤 Juice', '🥛 Milk', '🧋 Boba Tea', '🍷 Wine', '🍺 Beer', '💧 Water'];

// Helper function to format timestamps
const formatTime = (isoString) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'unknown time';
  }
};

function App() {
  const [invites, setInvites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [myHostName, setMyHostName] = useState(localStorage.getItem('hostName') || '');
  const [myEvents, setMyEvents] = useState([]);
  const [prevGuestCounts, setPrevGuestCounts] = useState({});
  const [messageText, setMessageText] = useState('');
  const [joiningGuestName, setJoiningGuestName] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);

  const [form, setForm] = useState({
    time: 'Now',
    location: 'Common Room (Level 1)',
    detail: '',
    spots: 1,
    host: '',
    phone: '',
    fun_fact: '',
    additional_info: '',
    beverages: []
  });

  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for new guests joining host's events
    invites.forEach(invite => {
      const currentGuestCount = invite.guests ? invite.guests.length : 0;
      const prevCount = prevGuestCounts[invite.id] || 0;

      // If this is my event and guests joined, show notification
      if (invite.host === myHostName && currentGuestCount > prevCount && currentGuestCount > 0) {
        const newGuests = invite.guests.slice(prevCount);
        newGuests.forEach(guest => {
          const notif = {
            type: 'host',
            msg: `🎉 ${guest.name} joined your coffee at ${invite.location}!`,
            eventId: invite.id
          };
          setNotifications(prev => [...prev, notif]);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.eventId !== invite.id || n.msg !== notif.msg));
          }, 5000);
        });
      }

      // Update prev counts
      setPrevGuestCounts(prev => ({
        ...prev,
        [invite.id]: currentGuestCount
      }));
    });

    // Update my events
    if (myHostName) {
      const myHostedEvents = invites.filter(inv => inv.host === myHostName);
      setMyEvents(myHostedEvents);
    }
  }, [invites, myHostName, prevGuestCounts]);

  const fetchInvites = async () => {
    try {
      setError('');
      const res = await fetch(`${API}/invites`);
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      setInvites(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(`Connection Error: Cannot reach backend. Check if you're on the same WiFi.`);
    }
  };

  const createInvite = async () => {
    try {
      if (!form.host.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!form.fun_fact.trim()) {
        setError('Please enter a fun fact');
        return;
      }
      if (!form.spots || form.spots < 1) {
        setError('Please enter number of spots (at least 1)');
        return;
      }

      setSubmitting(true);
      setError('');

      const res = await fetch(`${API}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error('Failed to create invite');
      
      const newInvite = await res.json();

      // Save host name for tracking
      localStorage.setItem('hostName', form.host);
      setMyHostName(form.host);

      // Show notification
      setNotifications([...notifications, { 
        type: 'success', 
        msg: `✅ Coffee event created! Guests can now join.`,
        eventId: newInvite.id
      }]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 4000);

      // Reset form
      setForm({
        time: 'Now',
        location: 'Common Room (Level 1)',
        detail: '',
        spots: 1,
        host: '',
        phone: '',
        fun_fact: '',
        additional_info: '',
        beverages: []
      });
      setShowForm(false);
      setSubmitting(false);
      await fetchInvites();
    } catch (err) {
      setSubmitting(false);
      setError(`Error creating invite: ${err.message}`);
    }
  };

  const joinInvite = async () => {
    try {
      if (!guestName.trim()) {
        setError('Please enter your name');
        return;
      }

      setSubmitting(true);
      setError('');

      const res = await fetch(`${API}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedInvite.id,
          guest_name: guestName
        })
      });
      
      if (!res.ok) throw new Error('Failed to join');
      
      // Show notification to user
      setNotifications([...notifications, { type: 'success', msg: `✅ You joined ${selectedInvite.host}'s coffee!` }]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);

      setGuestName('');
      setSelectedInvite(null);
      setSubmitting(false);
      await fetchInvites();
    } catch (err) {
      setSubmitting(false);
      setError(`Error joining: ${err.message}`);
    }
  };

  const sendMessage = async (senderName, senderType) => {
    try {
      if (!messageText.trim()) {
        setError('Please type a message');
        return;
      }

      setSubmitting(true);
      const res = await fetch(`${API}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_id: selectedInvite.id,
          sender_name: senderName,
          sender_type: senderType,
          message: messageText
        })
      });

      if (!res.ok) throw new Error('Failed to send message');
      
      setMessageText('');
      setSubmitting(false);
      await fetchInvites();
    } catch (err) {
      setError(`Error sending message: ${err.message}`);
      setSubmitting(false);
    }
  };



  // Coffee-themed background style
  const pageStyle = {
    background: 'linear-gradient(135deg, #f5deb3 0%, #ffe4b5 50%, #ffd9b3 100%)',
    minHeight: '100vh',
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#3d2817'
  };

  const containerStyle = {
    maxWidth: 500,
    margin: 'auto',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)'
  };

  const headerStyle = {
    textAlign: 'center',
    color: '#6f4e37',
    marginBottom: 20,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1
  };

  const buttonPrimaryStyle = {
    width: '100%',
    padding: 12,
    background: 'linear-gradient(135deg, #d2691e, #cd853f)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
    marginBottom: 10
  };

  const formStyle = {
    marginTop: 20,
    background: 'linear-gradient(135deg, #fff8dc 0%, #fffacd 100%)',
    padding: 15,
    borderRadius: 8,
    border: '2px solid #d2691e'
  };

  const inviteCardStyle = {
    border: '2px solid #cd853f',
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #fffacd 0%, #fff8dc 100%)',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)'
  };

  return (
    <div style={pageStyle}>
      {/* Notifications */}
      {notifications.map((notif, idx) => (
        <div key={idx} style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#c8e6c9',
          color: '#2e7d32',
          padding: '12px 20px',
          borderRadius: 8,
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          {notif.msg}
        </div>
      ))}

      <div style={containerStyle}>
        <div style={headerStyle}>☕ Sip&Link</div>

        {error && (
          <div style={{
            color: '#c62828',
            background: '#ffebee',
            padding: 12,
            borderRadius: 5,
            marginBottom: 12,
            border: '2px solid #ef5350'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>⚠️ Error:</p>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        <button 
          onClick={() => setShowForm(!showForm)} 
          disabled={loading || submitting}
          style={{
            ...buttonPrimaryStyle,
            opacity: loading || submitting ? 0.6 : 1,
            cursor: loading || submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? '⏳ Creating...' : '➕ Host a Coffee'}
        </button>

        {showForm && (
          <div style={formStyle}>
            <h3 style={{ color: '#6f4e37', marginTop: 0 }}>☕ Host a Coffee</h3>
            
            <input
              placeholder="Your Name *"
              value={form.host}
              onChange={e => setForm({ ...form, host: e.target.value })}
              style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}
            />

            <input
              placeholder="Your Phone Number (visible only to joined guests)"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}
            />

            <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}>
              <option>Now</option>
              <option>+15 min</option>
              <option>+30 min</option>
            </select>

            <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}>
              <option>My Room</option>
              <option>Kitchen</option>
              <option>Common Room (Level 1)</option>
              <option>Outside (Level 1)</option>
            </select>

            {(form.location === 'My Room' || form.location === 'Kitchen') && (
              <input
                placeholder="Room/Kitchen number (private)"
                value={form.detail}
                onChange={e => setForm({ ...form, detail: e.target.value })}
                style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}
              />
            )}

            <input
              type="number"
              min="1"
              placeholder="Number of extra people *"
              value={form.spots}
              onChange={e => setForm({ ...form, spots: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}
            />

            <input
              placeholder="Fun fact (Ask me about...) *"
              value={form.fun_fact}
              onChange={e => setForm({ ...form, fun_fact: e.target.value })}
              style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e' }}
            />

            <textarea
              placeholder="Additional info (optional) - share more details about the meetup"
              value={form.additional_info}
              onChange={e => setForm({ ...form, additional_info: e.target.value })}
              style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box', borderRadius: 4, border: '1px solid #d2691e', minHeight: 60, fontFamily: 'inherit' }}
            />

            <p style={{ marginBottom: 8, fontWeight: 'bold', color: '#6f4e37' }}>🍵 Available Beverages:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {BEVERAGE_OPTIONS.map(bev => (
                <label key={bev} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.beverages.includes(bev)}
                    onChange={e => {
                      if (e.target.checked) {
                        setForm({ ...form, beverages: [...form.beverages, bev] });
                      } else {
                        setForm({ ...form, beverages: form.beverages.filter(b => b !== bev) });
                      }
                    }}
                    style={{ marginRight: 6 }}
                  />
                  {bev}
                </label>
              ))}
            </div>

            <button 
              onClick={createInvite}
              disabled={submitting}
              style={{
                ...buttonPrimaryStyle,
                background: submitting ? '#ccc' : 'linear-gradient(135deg, #d2691e, #cd853f)',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? '⏳ Creating...' : '☕ Create Invite'}
            </button>

            <button 
              onClick={() => setShowForm(false)} 
              style={{
                width: '100%',
                padding: 10,
                background: '#a0826d',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {myHostName && myEvents.length > 0 && (
          <>
            <h2 style={{ color: '#6f4e37', marginTop: 20, marginBottom: 10 }}>👑 My Events</h2>
            {myEvents.map(event => (
              <div key={event.id} style={{
                ...inviteCardStyle,
                background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)',
                border: '2px solid #c71585'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#c71585' }}>Your Event</h4>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{event.time} @ {event.location}</p>
                {event.detail && <p style={{ margin: '5px 0', fontSize: '0.85em' }}>📍 {event.detail}</p>}
                <p style={{ margin: '8px 0', color: '#666' }}>
                  👥 <b>{event.guests ? event.guests.length : 0}</b> {event.guests && event.guests.length === 1 ? 'guest' : 'guests'} joined ({event.spots} spots left)
                </p>
                
                {event.guests && event.guests.length > 0 && (
                  <div style={{ background: 'rgba(199, 21, 133, 0.08)', padding: 8, borderRadius: 4, marginTop: 8, marginBottom: 10 }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.9em', fontWeight: 'bold', color: '#c71585' }}>✅ Guests who joined:</p>
                    {event.guests.map((guest, idx) => (
                      <p key={idx} style={{ margin: '4px 0', fontSize: '0.85em', color: '#333' }}>
                        • {guest.name}
                      </p>
                    ))}
                  </div>
                )}

                {/* Host Message Display */}
                <div style={{
                  background: 'white',
                  border: '1px solid #d2691e',
                  borderRadius: 4,
                  padding: 10,
                  marginBottom: 10,
                  maxHeight: 150,
                  overflowY: 'auto'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85em', fontWeight: 'bold', color: '#6f4e37' }}>💬 Messages:</p>
                  {event.messages && event.messages.length > 0 ? (
                    event.messages.map((msg, idx) => (
                      <div key={idx} style={{
                        marginBottom: 6,
                        padding: 6,
                        background: msg.sender_type === 'host' ? '#fff3cd' : '#e8f5e9',
                        borderRadius: 3,
                        fontSize: '0.8em',
                        borderLeft: `3px solid ${msg.sender_type === 'host' ? '#d2691e' : '#2e7d32'}`
                      }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{msg.sender} {msg.sender_type === 'host' ? '👤' : '🎯'}</p>
                        <p style={{ margin: '2px 0 0 0' }}>{msg.text}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.75em', color: '#999' }}>No messages yet</p>
                  )}
                </div>

                {/* Host Message Input */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input
                    placeholder="Reply to guests..."
                    value={selectedInvite && selectedInvite.id === event.id ? messageText : ''}
                    onChange={e => selectedInvite && selectedInvite.id === event.id && setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && selectedInvite && selectedInvite.id === event.id && sendMessage(myHostName, 'host')}
                    style={{
                      flex: 1,
                      padding: 8,
                      boxSizing: 'border-box',
                      borderRadius: 4,
                      border: '1px solid #d2691e',
                      fontSize: '0.85em'
                    }}
                  />
                  <button
                    onClick={() => {
                      setSelectedInvite(event);
                      sendMessage(myHostName, 'host');
                    }}
                    disabled={submitting || !messageText.trim()}
                    style={{
                      padding: '8px 12px',
                      background: submitting || !messageText.trim() ? '#ccc' : '#d2691e',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: submitting || !messageText.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '0.85em',
                      fontWeight: 'bold'
                    }}
                  >
                    📤
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        <h2 style={{ color: '#6f4e37', marginTop: 20 }}>☕ Happening Now</h2>

        {loading ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>⏳ Loading invites...</p>
        ) : invites.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>No coffee meetups yet. Be the first to host one! ☕</p>
        ) : (
          invites.map(invite => (
            <div key={invite.id} style={inviteCardStyle}>
              <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#6f4e37' }}>
                <b>{invite.time}</b> @ {invite.location}
              </p>
              {invite.detail && <p style={{ margin: '5px 0', fontSize: '0.85em', color: '#8b6914' }}>📍 {invite.detail}</p>}
              
              {invite.created_at && (
                <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#a0826d' }}>
                  🕐 Added at {formatTime(invite.created_at)}
                </p>
              )}
              
              <p style={{ margin: '8px 0 5px 0', color: '#6f4e37' }}>👤 <b>With {invite.host}</b></p>
              <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#6f4e37' }}>"{invite.fun_fact}"</p>
              
              {invite.beverages && invite.beverages.length > 0 && (
                <p style={{ margin: '8px 0 5px 0', fontSize: '0.9em', color: '#6f4e37' }}>
                  🍵 <b>Beverages:</b> {invite.beverages.join(', ')}
                </p>
              )}
              
              {invite.additional_info && (
                <p style={{ margin: '8px 0 5px 0', fontSize: '0.85em', color: '#8b6914', background: '#fffacd', padding: 6, borderRadius: 4 }}>
                  ℹ️ {invite.additional_info}
                </p>
              )}
              
              <p style={{ margin: '8px 0', color: invite.spots > 0 ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                {invite.spots > 0 ? `${invite.spots} ${invite.spots === 1 ? 'spot' : 'spots'} left` : 'FULL'}
              </p>
              
              <button 
                onClick={() => setSelectedInvite(invite)}
                disabled={invite.spots <= 0 || submitting}
                style={{
                  width: '100%',
                  padding: 10,
                  marginTop: 8,
                  background: invite.spots > 0 && !submitting ? 'linear-gradient(135deg, #d2691e, #cd853f)' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: invite.spots > 0 && !submitting ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                {invite.spots > 0 ? '🎯 Join' : '❌ Full'}
              </button>
            </div>
          ))
        )}

        {/* Join Modal with Chat */}
        {selectedInvite && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 999,
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={() => !submitting && setSelectedInvite(null)}>
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #fffacd 0%, #fff8dc 100%)',
              borderTop: '3px solid #d2691e',
              padding: 20,
              borderRadius: '12px 12px 0 0',
              maxWidth: 500,
              margin: '0 auto',
              maxHeight: '85vh',
              overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ color: '#6f4e37', marginTop: 0 }}>☕ Join Coffee with {selectedInvite.host}</h3>
              
              <p style={{ color: '#6f4e37' }}><b>📍 Location:</b> {selectedInvite.location} {selectedInvite.detail && `(${selectedInvite.detail})`}</p>
              <p style={{ color: '#6f4e37' }}><b>⏰ When:</b> {selectedInvite.time}</p>
              <p style={{ color: '#6f4e37', fontStyle: 'italic' }}>"{selectedInvite.fun_fact}"</p>
              
              {selectedInvite.beverages && selectedInvite.beverages.length > 0 && (
                <p style={{ color: '#6f4e37' }}><b>🍵 Drinks:</b> {selectedInvite.beverages.join(', ')}</p>
              )}

              {selectedInvite.additional_info && (
                <p style={{ color: '#8b6914', background: '#fff3cd', padding: 8, borderRadius: 4, marginBottom: 12 }}>
                  ℹ️ {selectedInvite.additional_info}
                </p>
              )}

              {!guestName ? (
                <>
                  <input
                    placeholder="Your Name (so the host knows who's coming) *"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      marginBottom: 12,
                      boxSizing: 'border-box',
                      borderRadius: 4,
                      border: '2px solid #d2691e'
                    }}
                  />

                  <button 
                    onClick={joinInvite}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: submitting ? '#ccc' : 'linear-gradient(135deg, #2e7d32, #43a047)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      marginBottom: 10,
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {submitting ? '⏳ Joining...' : '✅ Yes, Join!'}
                  </button>
                </>
              ) : (
                <>
                  {/* Chat Messages */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #d2691e',
                    borderRadius: 4,
                    padding: 12,
                    marginBottom: 12,
                    maxHeight: 200,
                    overflowY: 'auto',
                    minHeight: 100
                  }}>
                    {selectedInvite.messages && selectedInvite.messages.length > 0 ? (
                      selectedInvite.messages.map((msg, idx) => (
                        <div key={idx} style={{
                          marginBottom: 10,
                          padding: 8,
                          background: msg.sender_type === 'host' ? '#fff3cd' : '#e8f5e9',
                          borderRadius: 4,
                          borderLeft: `4px solid ${msg.sender_type === 'host' ? '#d2691e' : '#2e7d32'}`
                        }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '0.85em', color: '#6f4e37' }}>
                            {msg.sender} {msg.sender_type === 'host' ? '👤' : '🎯'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.9em' }}>{msg.text}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75em', color: '#999' }}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: 0, color: '#999', textAlign: 'center', padding: '20px 0' }}>
                        💬 No messages yet. Start a conversation!
                      </p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      placeholder="Say hello to the host..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage(guestName, 'guest')}
                      style={{
                        flex: 1,
                        padding: 10,
                        boxSizing: 'border-box',
                        borderRadius: 4,
                        border: '2px solid #d2691e'
                      }}
                    />
                    <button
                      onClick={() => sendMessage(guestName, 'guest')}
                      disabled={submitting || !messageText.trim()}
                      style={{
                        padding: '10px 16px',
                        background: submitting || !messageText.trim() ? '#ccc' : '#d2691e',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: submitting || !messageText.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      📤
                    </button>
                  </div>
                </>
              )}

              <button 
                onClick={() => {
                  setSelectedInvite(null);
                  setGuestName('');
                  setMessageText('');
                }}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: 10,
                  background: submitting ? '#999' : '#a0826d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
