import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Language, StringKey, translate } from '../i18n/translations';
import { Qiraah } from '../lib/quranData';
import { DEFAULT_HAFS_RECITER_ID, DEFAULT_QALOON_RECITER_ID } from '../lib/reciters';
import { CalculationMethodId, DEFAULT_CALCULATION_METHOD } from '../lib/prayerTimes';

export type FontFamilyId = 'amiri' | 'scheherazade' | 'reemkufi' | 'jomhuria';
export type FontSizeId = 'small' | 'medium' | 'large' | 'xlarge';
export type ThemeId = 'light' | 'dark';

interface Settings {
  language: Language;
  qiraah: Qiraah;
  fontFamily: FontFamilyId;
  fontSize: FontSizeId;
  /** Scale (0 to 1) for all non-Quran UI text (tafsir, tools screens). 0 = smallest, 1 = the "medium" Quran size. */
  uiFontScale: number;
  showTranslation: boolean;
  showEnglishQuran: boolean;
  tafsirEdition: string;
  theme: ThemeId;
  hafsReciter: string;
  qaloonReciter: string;
  calculationMethod: CalculationMethodId;
}

const DEFAULT_SETTINGS: Settings = {
  language: 'ar',
  qiraah: 'hafs',
  fontFamily: 'amiri',
  fontSize: 'medium',
  uiFontScale: 0.5,
  showTranslation: false,
  showEnglishQuran: false,
  tafsirEdition: 'muyassar',
  theme: 'light',
  hafsReciter: DEFAULT_HAFS_RECITER_ID,
  qaloonReciter: DEFAULT_QALOON_RECITER_ID,
  calculationMethod: DEFAULT_CALCULATION_METHOD,
};

const STORAGE_KEY = 'wahio-arrahman:settings';

interface SettingsContextValue extends Settings {
  isRTL: boolean;
  t: (key: StringKey) => string;
  setLanguage: (language: Language) => void;
  setQiraah: (qiraah: Qiraah) => void;
  setFontFamily: (font: FontFamilyId) => void;
  setFontSize: (size: FontSizeId) => void;
  setUiFontScale: (scale: number) => void;
  /** Scales a base UI font size (px) by the user's uiFontScale setting. */
  scaleFont: (base: number) => number;
  setShowTranslation: (show: boolean) => void;
  setShowEnglishQuran: (show: boolean) => void;
  setTafsirEdition: (id: string) => void;
  setTheme: (theme: ThemeId) => void;
  setHafsReciter: (id: string) => void;
  setQaloonReciter: (id: string) => void;
  setCalculationMethod: (id: CalculationMethodId) => void;
  ready: boolean;
}

// uiFontScale ranges 0..1; 0 maps to a slightly-reduced size and 1 maps to the
// "medium" Quran font's proportions, per the requirement that this control
// must never make non-Quran text exceed the medium Quran font size's scale.
export const UI_FONT_SCALE_MIN = 0.85;
export const UI_FONT_SCALE_MAX = 1.25;
function computeScaledFont(base: number, scale: number): number {
  const clamped = Math.min(1, Math.max(0, scale));
  return Math.round(base * (UI_FONT_SCALE_MIN + clamped * (UI_FONT_SCALE_MAX - UI_FONT_SCALE_MIN)));
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const FONT_FAMILY_MAP: Record<FontFamilyId, string> = {
  amiri: 'Amiri-Regular',
  scheherazade: 'ScheherazadeNew-Regular',
  reemkufi: 'ReemKufi-Regular',
  jomhuria: 'Jomhuria-Regular',
};

export const FONT_SIZE_MAP: Record<FontSizeId, number> = {
  small: 22,
  medium: 28,
  large: 34,
  xlarge: 42,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } else {
          const deviceLang = Localization.getLocales()[0]?.languageCode;
          if (deviceLang && deviceLang !== 'ar') {
            setSettings((s) => ({ ...s, language: 'en' }));
          }
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
    }
  }, [settings, ready]);

  const value = useMemo<SettingsContextValue>(() => {
    return {
      ...settings,
      isRTL: settings.language === 'ar',
      ready,
      t: (key: StringKey) => translate(key, settings.language),
      setLanguage: (language) => setSettings((s) => ({ ...s, language })),
      setQiraah: (qiraah) => setSettings((s) => ({ ...s, qiraah })),
      setFontFamily: (fontFamily) => setSettings((s) => ({ ...s, fontFamily })),
      setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
      setUiFontScale: (uiFontScale) => setSettings((s) => ({ ...s, uiFontScale })),
      scaleFont: (base) => computeScaledFont(base, settings.uiFontScale),
      setShowTranslation: (showTranslation) => setSettings((s) => ({ ...s, showTranslation })),
      setShowEnglishQuran: (showEnglishQuran) => setSettings((s) => ({ ...s, showEnglishQuran })),
      setTafsirEdition: (tafsirEdition) => setSettings((s) => ({ ...s, tafsirEdition })),
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setHafsReciter: (hafsReciter) => setSettings((s) => ({ ...s, hafsReciter })),
      setQaloonReciter: (qaloonReciter) => setSettings((s) => ({ ...s, qaloonReciter })),
      setCalculationMethod: (calculationMethod) => setSettings((s) => ({ ...s, calculationMethod })),
    };
  }, [settings, ready]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
