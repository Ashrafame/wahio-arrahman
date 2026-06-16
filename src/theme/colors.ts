export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryText: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
}

export const LIGHT_PALETTE: Palette = {
  background: '#FAF7F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EAD9',
  primary: '#0F4C3A',
  primaryText: '#FFFFFF',
  text: '#1C2B25',
  textMuted: '#6B7A72',
  border: '#E3DBC8',
  accent: '#C8973A',
};

export const DARK_PALETTE: Palette = {
  background: '#0D1512',
  surface: '#16221C',
  surfaceAlt: '#1E2D25',
  primary: '#2E8B6F',
  primaryText: '#0D1512',
  text: '#EDEFEA',
  textMuted: '#9CA8A1',
  border: '#2A3A32',
  accent: '#D9A94B',
};

export function getPalette(theme: 'light' | 'dark'): Palette {
  return theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}
