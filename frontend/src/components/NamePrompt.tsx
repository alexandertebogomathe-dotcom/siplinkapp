import React, { FC, useRef, useEffect } from 'react';
import { pageStyle, containerStyle, headerStyle, buttonPrimaryStyle, inputStyle, errorAlertStyle } from '../styles/theme';

interface NamePromptProps {
  tempName: string;
  setTempName: (name: string) => void;
  error: string | null;
  onSave: (name: string) => void;
}

/**
 * Component for initial name entry screen
 */
const NamePrompt: FC<NamePromptProps> = ({ tempName, setTempName, error, onSave }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    onSave(tempName);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>☕ Sip&Link</div>
        <p style={{ fontSize: '24px', marginBottom: 20, textAlign: 'center' }}>Welcome! ☕</p>

        {error && <div style={errorAlertStyle}>{error}</div>}

        <input
          ref={inputRef}
          placeholder="What's your name?"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            ...inputStyle,
            marginBottom: 12,
            fontSize: '16px',
            padding: '12px'
          }}
        />

        <button
          onClick={handleSave}
          style={{
            ...buttonPrimaryStyle,
            width: '100%',
            padding: '12px',
            fontSize: '16px'
          }}
        >
          Let's Go ☕
        </button>
      </div>
    </div>
  );
};

export default NamePrompt;
