import React, { useState, FC } from 'react';
import { C, OV, SH, HDL, SHH, I, BD, FL } from '../styles/theme';
import { Avatar, CloseBtn } from './Avatar';
import { Invite } from '../hooks/useInvites';
import { API_URL } from '../config/api';

interface JoinSheetProps {
  invite: Invite;
  currentUser: string | null;
  onClose: () => void;
  onJoined: () => Promise<void>;
}

export const JoinSheet: FC<JoinSheetProps> = ({ invite, currentUser, onClose, onJoined }) => {
  const [stage, setStage] = useState<'confirm' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const join = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invite.id, guestName: currentUser }),
      });
      if (!r.ok) throw new Error();
      setStage('success');
      await onJoined();
    } catch {
      setError('Could not join. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div style={OV} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={SH}>
        <div style={HDL} />
        <div style={SHH}>
          <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 19, color: C.text, flex: 1 }}>
            {stage === 'confirm' ? 'Join session?' : 'You\'re in!'}
          </span>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: '20px 24px' }}>

          {stage === 'confirm' ? (
            <>
              {/* Host card */}
              <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={invite.host} size={40} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: C.textHint, margin: '0 0 2px' }}>Coffee with</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>{invite.host}</p>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div>
                    <p style={{ color: C.textHint, margin: 0, marginBottom: 2 }}>Beverage</p>
                    <p style={{ color: C.text, margin: 0, fontWeight: 500 }}>{invite.beverage}</p>
                  </div>
                  <div>
                    <p style={{ color: C.textHint, margin: 0, marginBottom: 2 }}>When</p>
                    <p style={{ color: C.text, margin: 0, fontWeight: 500 }}>{invite.time}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: C.textHint, margin: 0, marginBottom: 2 }}>Where</p>
                    <p style={{ color: C.text, margin: 0, fontWeight: 500 }}>{invite.location}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ color: C.textHint, margin: 0, marginBottom: 2 }}>Fun fact</p>
                    <p style={{ color: C.text, margin: 0, fontWeight: 500, fontStyle: 'italic' }}>{invite.fun_fact}</p>
                  </div>
                </div>
              </div>

              {/* Semi-blind notice */}
              <div style={{ background: C.warnBg, borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12 }}>
                <p style={{ color: C.warn, margin: 0, lineHeight: 1.4 }}>
                  🤝 Semi-blind: {invite.host} won't see your face until you meet.
                </p>
              </div>

              {/* Joining as */}
              <div style={{ background: C.surface2, borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={currentUser || ''} size={32} />
                <div>
                  <p style={{ fontSize: 12, color: C.textHint, margin: 0 }}>You're joining as</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>{currentUser}</p>
                </div>
              </div>

              {error && (
                <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button style={{ ...BD(false), background: C.surface2, color: C.text }} onClick={onClose}>
                  Cancel
                </button>
                <button style={BD(loading)} onClick={join} disabled={loading}>
                  {loading ? 'Joining…' : '✓ Join'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success screen */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 80, marginBottom: 12 }}>☕</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: '0 0 10px' }}>
                  You're all set!
                </p>
                <p style={{ fontSize: 14, color: C.textSoft, margin: 0 }}>
                  You're joining {invite.host} at {invite.location}
                </p>
              </div>

              {/* Summary table */}
              <div style={{ background: C.surface2, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', fontSize: 13 }}>
                  <span style={{ color: C.textHint }}>Host</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{invite.host}</span>

                  <span style={{ color: C.textHint }}>Beverage</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{invite.beverage}</span>

                  <span style={{ color: C.textHint }}>Time</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{invite.time}</span>

                  <span style={{ color: C.textHint }}>Location</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{invite.location}</span>

                  <span style={{ color: C.textHint }}>You're joining as</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{currentUser}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button style={BD(false)} onClick={onClose}>
                  Back home
                </button>
                <button style={{ ...BD(false), background: C.accent, color: 'white' }} onClick={() => {
                  // This would navigate to chat in the parent App
                  onClose();
                }}>
                  💬 Chat now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
