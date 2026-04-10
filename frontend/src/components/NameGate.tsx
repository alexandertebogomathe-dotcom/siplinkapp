import React, { useState, FC } from 'react';
import { C, HDL, SH, I, BD, OV } from '../styles/theme';

interface NameGateProps {
  onSet: (name: string) => void;
}

export const NameGate: FC<NameGateProps> = ({ onSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSet(name.trim());
    }
  };

  return (
    <div style={OV}>
      <div style={{ ...SH, maxHeight: 'auto' }}>
        <div style={HDL} />
        <div style={{ padding: '24px 24px 32px' }}>
          <h2 style={{
            fontFamily: "'Lora',Georgia,serif",
            fontSize: 22,
            color: C.text,
            marginBottom: 8,
            margin: '0 0 8px'
          }}>
            What's your name?
          </h2>
          <p style={{
            fontSize: 14,
            color: C.textSoft,
            marginBottom: 20,
            lineHeight: 1.5,
            margin: '0 0 20px'
          }}>
            Used to identify you in sessions and chats. Just your first name is fine.
          </p>
          <input
            style={I}
            placeholder="e.g. Alex"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && handleSubmit()}
            autoFocus
          />
          <div style={{ marginTop: 16 }}>
            <button
              style={BD(!name.trim())}
              disabled={!name.trim()}
              onClick={handleSubmit}
            >
              Let's go →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
