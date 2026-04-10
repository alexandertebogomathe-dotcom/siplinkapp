import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { C, OV, SH, HDL, SHH, I, BD, hhmm, same } from '../styles/theme';
import { Avatar, CloseBtn } from './Avatar';
import { Invite } from '../hooks/useInvites';
import { API_URL } from '../config/api';

interface ChatSheetProps {
  invite: Invite;
  currentUser: string | null;
  onClose: () => void;
}

export const ChatSheet: FC<ChatSheetProps> = ({ invite, currentUser, onClose }) => {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherName = same(currentUser, invite.host)
    ? invite.joined_by?.[0] || 'Guest'
    : invite.host;

  const fetchMsgs = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/messages/${invite.id}`);
      const d = await r.json();
      setMsgs(d);
    } catch {
      /* silent */
    }
  }, [invite.id]);

  useEffect(() => {
    fetchMsgs();
    const t = setInterval(fetchMsgs, 3000);
    return () => clearInterval(t);
  }, [fetchMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setError('');
    setText('');
    try {
      const r = await fetch(`${API_URL}/messages/${invite.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUser, text: t }),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error || 'Failed to send');
        setText(t);
      } else {
        fetchMsgs();
      }
    } catch {
      setError('Cannot reach server');
      setText(t);
    }
    setSending(false);
  };

  return (
    <div style={OV} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...SH, display: 'flex', flexDirection: 'column', height: '85vh', overflowY: 'hidden' }}>
        <div style={HDL} />

        {/* Header */}
        <div style={SHH}>
          <Avatar name={otherName} size={36} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: C.text, margin: 0 }}>{otherName}</p>
            <p style={{ fontSize: 12, color: C.textSoft, margin: 0 }}>{invite.location} · {invite.time}</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {msgs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textHint, fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>👋</p>
              <p style={{ margin: 0 }}>Say hi and sort out the details!</p>
            </div>
          )}
          {msgs.map((m, i) => {
            if (m.sender === '__system__') {
              return (
                <p key={i} style={{ textAlign: 'center', fontSize: 12, color: C.textHint, padding: '4px 0', margin: 0 }}>
                  {m.text}
                </p>
              );
            }
            const mine = same(m.sender, currentUser);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 2 }}>
                {!mine && <span style={{ fontSize: 11, color: C.textHint, paddingLeft: 4 }}>{m.sender}</span>}
                <div style={{
                  maxWidth: '78%',
                  background: mine ? C.dark : C.surface,
                  color: mine ? '#FAF7F2' : C.text,
                  border: mine ? 'none' : `1px solid ${C.border}`,
                  borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '10px 14px',
                  fontSize: 14,
                  lineHeight: 1.4,
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize: 10, color: C.textHint, paddingInline: 4 }}>{hhmm(m.ts)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && <p style={{ fontSize: 12, color: C.red, padding: '0 20px 8px', margin: 0 }}>⚠️ {error}</p>}

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', borderTop: `1px solid ${C.border}` }}>
          <input
            style={{ ...I, flex: 1, padding: '10px 14px', marginBottom: 0 }}
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              flexShrink: 0,
              background: text.trim() ? C.dark : C.surface2,
              border: `1px solid ${text.trim() ? C.dark : C.border}`,
              color: text.trim() ? '#FAF7F2' : C.textHint,
              cursor: text.trim() ? 'pointer' : 'default',
              fontSize: 18,
              fontFamily: 'inherit',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
