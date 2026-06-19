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

// ── Appearance customisation ──────────────────────────────────────────────────

export type PrimaryColorId = 'forest' | 'teal' | 'navy' | 'brown' | 'purple' | 'crimson';
export type BgColorId = 'cream' | 'warm' | 'parchment' | 'mint' | 'sky';
export type PatternStyleId = 'khatam' | 'arabesque' | 'diamonds' | 'geometric' | 'none';

export const PRIMARY_COLORS: Record<PrimaryColorId, {
  labelAr: string; labelEn: string; light: string; dark: string;
}> = {
  forest:  { labelAr: 'أخضر',    labelEn: 'Forest',  light: '#0F4C3A', dark: '#2E8B6F' },
  teal:    { labelAr: 'فيروزي',  labelEn: 'Teal',    light: '#006064', dark: '#00969F' },
  navy:    { labelAr: 'كحلي',    labelEn: 'Navy',    light: '#1A3460', dark: '#4A6FA8' },
  brown:   { labelAr: 'بني',     labelEn: 'Umber',   light: '#5C3317', dark: '#8B6040' },
  purple:  { labelAr: 'بنفسجي', labelEn: 'Purple',  light: '#4A1A8C', dark: '#7B52C0' },
  crimson: { labelAr: 'أحمر',   labelEn: 'Crimson', light: '#8B1A1A', dark: '#B85050' },
};

export const BG_PRESETS: Record<BgColorId, {
  labelAr: string; labelEn: string;
  light: Pick<Palette, 'background' | 'surface' | 'surfaceAlt' | 'border'>;
  dark:  Pick<Palette, 'background' | 'surface' | 'surfaceAlt' | 'border'>;
}> = {
  cream: {
    labelAr: 'كريمي', labelEn: 'Cream',
    light: { background: '#FAF7F0', surface: '#FFFFFF', surfaceAlt: '#F1EAD9', border: '#E3DBC8' },
    dark:  { background: '#0D1512', surface: '#16221C', surfaceAlt: '#1E2D25', border: '#2A3A32' },
  },
  warm: {
    labelAr: 'دافئ', labelEn: 'Warm',
    light: { background: '#FFF9EC', surface: '#FFFDF5', surfaceAlt: '#F5EDD0', border: '#EDE0C0' },
    dark:  { background: '#1A1205', surface: '#251808', surfaceAlt: '#302010', border: '#3C2C18' },
  },
  parchment: {
    labelAr: 'رقّ',  labelEn: 'Parchment',
    light: { background: '#F7EDDA', surface: '#FBF5E8', surfaceAlt: '#EDDFBE', border: '#DCCFA8' },
    dark:  { background: '#18120A', surface: '#241A0C', surfaceAlt: '#302212', border: '#3C2E1C' },
  },
  mint: {
    labelAr: 'نعناعي', labelEn: 'Mint',
    light: { background: '#EFF7F2', surface: '#F6FBF8', surfaceAlt: '#DFEFE6', border: '#C8E4D0' },
    dark:  { background: '#0A1510', surface: '#121F18', surfaceAlt: '#182820', border: '#243A2C' },
  },
  sky: {
    labelAr: 'سماوي', labelEn: 'Sky',
    light: { background: '#EEF4FB', surface: '#F6FAFF', surfaceAlt: '#DEE8F5', border: '#C8D8EE' },
    dark:  { background: '#0A1220', surface: '#121A2E', surfaceAlt: '#182438', border: '#243044' },
  },
};

export const PATTERN_STYLES: Record<PatternStyleId, { labelAr: string; labelEn: string }> = {
  khatam:    { labelAr: 'الخاتم',      labelEn: 'Khatam'    },
  arabesque: { labelAr: 'أرابيسك',    labelEn: 'Arabesque' },
  diamonds:  { labelAr: 'المعيّن',    labelEn: 'Diamonds'  },
  geometric: { labelAr: 'هندسي',      labelEn: 'Geometric' },
  none:      { labelAr: 'بدون زخرفة', labelEn: 'None'      },
};

export function buildPalette(
  theme: 'light' | 'dark',
  primaryColorId: PrimaryColorId,
  bgColorId: BgColorId,
): Palette {
  const base = theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  const pc = PRIMARY_COLORS[primaryColorId];
  const bg = BG_PRESETS[bgColorId];
  const bgColors = theme === 'dark' ? bg.dark : bg.light;
  const primary = theme === 'dark' ? pc.dark : pc.light;
  // primaryText is always white in light mode; in dark mode it matches the bg
  const primaryText = theme === 'dark' ? bgColors.background : '#FFFFFF';
  return { ...base, ...bgColors, primary, primaryText };
}
