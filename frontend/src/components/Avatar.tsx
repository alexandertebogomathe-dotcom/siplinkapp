import React, { CSSProperties } from 'react';
import { avc, ini } from '../styles/theme';

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 42 }) => {
  const c = avc(name);
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: c.bg,
    color: c.fg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.33,
    fontWeight: 600,
    flexShrink: 0,
  };

  return <div style={style}>{ini(name)}</div>;
};

interface CloseBtnProps {
  onClose: () => void;
}

export const CloseBtn: React.FC<CloseBtnProps> = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '1px solid rgba(60,40,20,0.12)',
        background: '#F0ECE4',
        cursor: 'pointer',
        fontSize: 15,
        color: '#6B5A46',
        fontFamily: 'inherit',
        marginLeft: 'auto',
      }}
    >
      ✕
    </button>
  );
};
