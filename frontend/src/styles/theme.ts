import { CSSProperties } from 'react';

// Modern Color Palette
export const C = {
  bg: '#F7F4EF',
  surface: '#FFFFFF',
  surface2: '#F0ECE4',
  border: 'rgba(60,40,20,0.12)',
  borderMed: 'rgba(60,40,20,0.22)',
  text: '#1C1208',
  textSoft: '#6B5A46',
  textHint: '#A89880',
  accent: '#C47B3A',
  dark: '#1C1208',
  red: '#B03A2E',
  redBg: '#FAECEA',
  warnBg: '#FEF6E7',
  warn: '#8A5A00',
  greenBg: '#EBF4EA',
  green: '#3A6B35',
} as const;

// Avatar Colors
export const AV = [
  { bg: '#FEF0DC', fg: '#8A5A00' },
  { bg: '#E0F4EF', fg: '#0A5E48' },
  { bg: '#E4EEFB', fg: '#1A4A8A' },
  { bg: '#FCEAF0', fg: '#8A2040' },
  { bg: '#EEF0FB', fg: '#3A2AB0' },
] as const;

// Legacy COLORS export for compatibility
export const COLORS = {
  primary: C.accent,
  primaryLight: C.accent,
  secondary: C.textSoft,
  accent: C.accent,
  accentLight: C.accent,
  success: C.green,
  warning: C.red,
  hostPink: C.red,
  guestBlue: C.accent,
  bg: C.bg,
  bgLight: C.bg,
  bgLighter: C.bg,
  cardBg: C.surface,
  text: C.text,
  textLight: C.textSoft,
  border: C.border,
  error: C.redBg
} as const;

export const BEVERAGE_OPTIONS = [
  '☕ Coffee',
  '🍵 Tea',
  '🍵 Rooibos',
  '🧃 Juice',
  '🥛 Oat milk / other'
] as const;

// Helper Functions
export const ini = (n: string = '?'): string => 
  (n || '?').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const avc = (n: string = 'A') => 
  AV[(n || 'A').charCodeAt(0) % AV.length];

export const same = (a: string = '', b: string = ''): boolean =>
  (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

export const hhmm = (ts: number): string =>
  new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Style Atoms - Inputs
export const I: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  color: C.text,
  outline: 'none',
  fontFamily: 'inherit',
};

export const SEL: CSSProperties = {
  ...I,
  cursor: 'pointer',
  WebkitAppearance: 'none',
};

// Buttons
export const BD = (off: boolean = false): CSSProperties => ({
  width: '100%',
  padding: 14,
  background: off ? C.textHint : C.dark,
  color: '#FAF7F2',
  border: 'none',
  borderRadius: 50,
  fontSize: 15,
  fontWeight: 500,
  cursor: off ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
});

export const BL: CSSProperties = {
  width: '100%',
  padding: 13,
  background: 'transparent',
  color: C.textSoft,
  border: `1px solid ${C.borderMed}`,
  borderRadius: 50,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginTop: 10,
};

// Overlay & Modal
export const OV: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(28,18,8,0.55)',
  zIndex: 50,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
};

export const SH: CSSProperties = {
  background: C.bg,
  borderRadius: '24px 24px 0 0',
  width: '100%',
  maxWidth: 430,
  maxHeight: '92vh',
  overflowY: 'auto',
  padding: '0 0 48px',
};

export const HDL: CSSProperties = {
  width: 36,
  height: 4,
  background: C.borderMed,
  borderRadius: 2,
  margin: '12px auto 0',
};

export const SHH: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 24px 12px',
  borderBottom: `1px solid ${C.border}`,
};

// Forms
export const FL: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: C.textSoft,
  marginBottom: 7,
};

export const FG: CSSProperties = {
  marginBottom: 20,
};

// Chips
export const CHIP = (on: boolean): CSSProperties => ({
  padding: '11px 8px',
  borderRadius: 10,
  textAlign: 'center',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: on ? 500 : 400,
  fontFamily: 'inherit',
  background: on ? C.dark : C.surface,
  border: `1px solid ${on ? C.dark : C.border}`,
  color: on ? '#FAF7F2' : C.textSoft,
  transition: 'all .15s',
});

// Legacy Exports for Backward Compatibility
export const pageStyle: CSSProperties = {
  background: C.bg,
  minHeight: '100vh',
  fontFamily: "'Figtree','Segoe UI',sans-serif",
  color: C.text,
};

export const containerStyle: CSSProperties = {
  maxWidth: 430,
  margin: 'auto',
  background: C.bg,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

export const headerStyle: CSSProperties = {
  background: C.dark,
  padding: '48px 24px 22px',
  color: '#FAF7F2',
  fontSize: 32,
  fontFamily: "'Lora',Georgia,serif",
  lineHeight: 1.1,
  fontWeight: 400,
  marginBottom: 0,
};

export const subtitleStyle: CSSProperties = {
  fontSize: 13,
  color: 'rgba(250,247,242,0.5)',
  textAlign: 'left',
  marginBottom: 0,
};

export const tabStyle = (isActive: boolean): CSSProperties => ({
  flex: 1,
  padding: '11px 0',
  background: 'none',
  border: 'none',
  borderBottom: `2px solid ${isActive ? C.dark : 'transparent'}`,
  fontSize: 13,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? C.text : C.textHint,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all .15s',
});

export const buttonPrimaryStyle: CSSProperties = BD(false);

export const buttonSecondaryStyle: CSSProperties = BL;

export const buttonAccentStyle: CSSProperties = {
  ...BD(false),
  background: C.accent,
};

export const inviteCardStyle: CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 20,
  padding: 18,
  marginBottom: 12,
};

export const errorAlertStyle: CSSProperties = {
  background: C.redBg,
  color: C.red,
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 13,
  marginBottom: 12,
};

export const inputStyle: CSSProperties = I;

export const selectStyle: CSSProperties = SEL;

export const textareaStyle: CSSProperties = {
  ...I,
  minHeight: 60,
  fontFamily: 'inherit',
};

export const successNotificationStyle: CSSProperties = {
  position: 'fixed',
  top: 20,
  right: 20,
  background: C.greenBg,
  color: C.green,
  padding: '12px 20px',
  borderRadius: 8,
  zIndex: 1000,
};

export const hostEventCardStyle: CSSProperties = inviteCardStyle;

export const guestEventCardStyle: CSSProperties = inviteCardStyle;

export const loadingTextStyle: CSSProperties = {
  color: C.textHint,
  textAlign: 'center',
};

export const emptyStateStyle: CSSProperties = {
  color: C.textHint,
  textAlign: 'center',
  padding: '40px 20px',
};

export const chatModalBackdropStyle: CSSProperties = OV;

export const chatModalContentStyle: CSSProperties = {
  ...SH,
  display: 'flex',
  flexDirection: 'column',
  height: '85vh',
};

export const chatMessageStyle: CSSProperties = {
  marginBottom: 10,
  padding: 8,
  background: C.surface2,
  borderRadius: 4,
  borderLeft: `3px solid ${C.accent}`,
};

export const participantsBoxStyle: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.05)',
  padding: 8,
  borderRadius: 4,
  marginBottom: 12,
};

export const messagesBoxStyle: CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  padding: 12,
  marginBottom: 12,
  maxHeight: 200,
  overflowY: 'auto',
  minHeight: 80,
};

export const messageBubbleStyle: CSSProperties = {
  marginBottom: 10,
  padding: 8,
  background: C.surface2,
  borderRadius: 4,
  borderLeft: `3px solid ${C.accent}`,
};

export const noMessagesStyle: CSSProperties = {
  margin: 0,
  color: C.textHint,
  textAlign: 'center',
  padding: '20px 0',
};
