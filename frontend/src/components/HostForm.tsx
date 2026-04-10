import React, { useState, FC } from 'react';
import { C, OV, SH, HDL, SHH, I, SEL, BD, FL, FG, CHIP } from '../styles/theme';
import { Avatar, CloseBtn } from './Avatar';
import { API_URL } from '../config/api';

interface HostFormProps {
  currentUser: string | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
}

export const HostForm: FC<HostFormProps> = ({ currentUser, onClose, onCreated }) => {
  const [form, setForm] = useState({
    host: currentUser || '',
    time: 'Now',
    location: 'Common room',
    detail: '',
    spots: 1,
    fun_fact: '',
    phone: '',
    additional_info: '',
    beverages: [] as string[],
  });
  const [hostName, setHostName] = useState(currentUser || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const beverages = ['Coffee ☕', 'Tea 🍵', 'Rooibos', 'Juice 🧃', 'Oat milk / other'];

  const submit = async () => {
    if (!form.fun_fact.trim()) {
      setError('Add a fun fact — it\'s your conversation starter');
      return;
    }
    if (form.beverages.length === 0) {
      setError('Select at least one beverage');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          host: hostName.trim() || currentUser,
        }),
      });
      if (!r.ok) throw new Error();
      await onCreated();
      onClose();
    } catch {
      setError('Could not reach server. Is Flask running on port 5000?');
    }
    setLoading(false);
  };

  return (
    <div style={OV} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={SH}>
        <div style={HDL} />
        <div style={SHH}>
          <span style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 19, color: C.text, flex: 1 }}>Host a session</span>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: '20px 24px' }}>

          {/* Your Name */}
          <div style={FG}>
            <label style={FL}>Your Name</label>
            <input
              style={I}
              placeholder={currentUser || 'Enter your name'}
              value={hostName}
              onChange={e => setHostName(e.target.value)}
            />
          </div>

          <div style={FG}>
            <label style={FL}>When?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {['Now', '+15 min', '+30 min'].map(t => (
                <button key={t} style={CHIP(form.time === t)} onClick={() => setForm(f => ({ ...f, time: t }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={FG}>
            <label style={FL}>Location</label>
            <select style={SEL} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              {['Common room', 'Kitchen — floor 1', 'Kitchen — floor 2', 'Kitchen — floor 3', 'Kitchen — floor 4', 'Kitchen — floor 5', 'Kitchen — floor 6', 'Kitchen — floor 7', 'Courtyard', 'My room'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div style={FG}>
            <label style={FL}>Room / Kitchen Number</label>
            <input
              style={I}
              placeholder="e.g. 312, Floor 2 (revealed after joining)"
              value={form.detail}
              onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
            />
          </div>

          <div style={FG}>
            <label style={FL}>Beverages Available (select all you have)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {beverages.map(b => (
                <label key={b} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8, fontSize: 14, color: C.text }}>
                  <input
                    type="checkbox"
                    checked={form.beverages.includes(b)}
                    onChange={e => {
                      if (e.target.checked) {
                        setForm(f => ({ ...f, beverages: [...f.beverages, b] }));
                      } else {
                        setForm(f => ({ ...f, beverages: f.beverages.filter(x => x !== b) }));
                      }
                    }}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                  {b}
                </label>
              ))}
            </div>
            {form.beverages.length === 0 && (
              <p style={{ fontSize: 12, color: C.textHint, margin: '8px 0 0' }}>Select at least one beverage</p>
            )}
          </div>

          <div style={FG}>
            <label style={FL}>Spots</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} style={CHIP(form.spots === n)} onClick={() => setForm(f => ({ ...f, spots: n }))}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={FG}>
            <label style={FL}>Your conversation starter</label>
            <input
              style={I}
              placeholder="Ask me about…"
              value={form.fun_fact}
              maxLength={70}
              onChange={e => setForm(f => ({ ...f, fun_fact: e.target.value }))}
            />
            <p style={{ fontSize: 11, color: C.textHint, marginTop: 5, margin: '5px 0 0' }}>
              This is your profile — one curiosity-sparker is all you need.
            </p>
          </div>

          {error && (
            <div style={{ background: C.redBg, color: C.red, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}
          <button style={BD(loading)} onClick={submit} disabled={loading}>
            {loading ? 'Creating…' : '☕  Create invite'}
          </button>
        </div>
      </div>
    </div>
  );
};
