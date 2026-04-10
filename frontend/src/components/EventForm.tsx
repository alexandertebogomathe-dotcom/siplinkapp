import React, { FC } from 'react';
import { EventFormData, BEVERAGE_OPTIONS } from '../hooks/useInvites';
import {
  inputStyle,
  selectStyle,
  textareaStyle,
  buttonPrimaryStyle
} from '../styles/theme';

interface EventFormProps {
  form: EventFormData;
  setForm: (form: EventFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}

/**
 * Component for creating a new coffee event
 */
const EventForm: FC<EventFormProps> = ({ form, setForm, onSubmit, onCancel, submitting, error }) => {
  return (
    <div
      style={{
        marginBottom: 20,
        background: 'linear-gradient(135deg, #fff8dc 0%, #fffacd 100%)',
        padding: 15,
        borderRadius: 8,
        border: '2px solid #d2691e'
      }}
    >
      <h3 style={{ color: '#6f4e37', marginTop: 0 }}>☕ Host a Coffee</h3>

      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            padding: 10,
            borderRadius: 4,
            marginBottom: 12,
            fontSize: '14px'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <select
        value={form.time}
        onChange={(e) => setForm({ ...form, time: e.target.value })}
        style={{ ...selectStyle, marginBottom: 10 }}
      >
        <option>Now</option>
        <option>+15 min</option>
        <option>+30 min</option>
      </select>

      <select
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        style={{ ...selectStyle, marginBottom: 10 }}
      >
        <option>My Room</option>
        <option>Kitchen</option>
        <option>Common Room (Level 1)</option>
        <option>Outside (Level 1)</option>
      </select>

      {(form.location === 'My Room' || form.location === 'Kitchen') && (
        <input
          placeholder="Room/Kitchen number"
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
          style={{ ...inputStyle, marginBottom: 10 }}
        />
      )}

      <input
        type="number"
        min="1"
        placeholder="Number of extra people (spots available)"
        value={form.spots}
        onChange={(e) => setForm({ ...form, spots: parseInt(e.target.value) || 1 })}
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      <input
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      <input
        placeholder="Fun fact (Ask me about...)"
        required
        value={form.fun_fact}
        onChange={(e) => setForm({ ...form, fun_fact: e.target.value })}
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      <textarea
        placeholder="Additional info (optional)"
        value={form.additional_info}
        onChange={(e) => setForm({ ...form, additional_info: e.target.value })}
        style={{ ...textareaStyle, marginBottom: 10, minHeight: 60 }}
      />

      <p style={{ marginBottom: 8, fontWeight: 'bold', color: '#6f4e37' }}>🍵 Available Beverages:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {BEVERAGE_OPTIONS.map((bev) => (
          <label key={bev} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.beverages.includes(bev)}
              onChange={(e) => {
                if (e.target.checked) {
                  setForm({ ...form, beverages: [...form.beverages, bev] });
                } else {
                  setForm({ ...form, beverages: form.beverages.filter((b) => b !== bev) });
                }
              }}
              style={{ marginRight: 6 }}
            />
            {bev}
          </label>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          ...buttonPrimaryStyle,
          background: submitting ? '#ccc' : 'linear-gradient(135deg, #d2691e, #cd853f)',
          width: '100%',
          marginBottom: 8
        }}
      >
        {submitting ? '⏳ Creating...' : '☕ Create Invite'}
      </button>

      <button
        onClick={onCancel}
        style={{
          width: '100%',
          padding: 10,
          background: '#a0826d',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
          marginBottom: 0
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default EventForm;
