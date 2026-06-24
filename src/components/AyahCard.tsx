import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Ayah } from '../lib/quranData';
import { FONT_FAMILY_MAP, FONT_SIZE_MAP, useSettings } from '../store/SettingsContext';

// ArefRuqaa and Rakkas lack certain Quran-specific Unicode characters (Koranic
// annotation signs U+06D6-U+06ED, Extended-A tanween U+08F0-U+08F2, and the
// small-high sukun U+06E1 used by Rakkas). When the shaping engine encounters a
// missing glyph, it splits the Arabic text run at that point, causing surrounding
// letters to lose their medial forms and appear disconnected. We normalize the
// text for those fonts: replace Extended-A chars with their standard equivalents
// and remove annotation marks that are absent from the font's glyph set.
const QURAN_CHAR_NORMALIZE: Record<number, string> = {
  0x08F0: 'ً', // open fathatan → fathatan
  0x08F1: 'ٌ', // open dammatan → dammatan
  0x08F2: 'ٍ', // open kasratan → kasratan
  0x06E1: 'ْ', // small high sukun (missing in Rakkas) → standard sukun
  0x065C: '',
  0x06D6: '', 0x06D7: '', 0x06D8: '', 0x06DA: '', 0x06DB: '',
  0x06DC: '', 0x06DE: '', 0x06E0: '', 0x06E2: '', 0x06E4: '',
  0x06E5: '', 0x06E6: '', 0x06E7: '', 0x06E8: '', 0x06E9: '',
  0x06EC: '', 0x06ED: '',
};

function normalizeForGenericFont(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    out += code in QURAN_CHAR_NORMALIZE ? QURAN_CHAR_NORMALIZE[code] : ch;
  }
  return out;
}

interface Props {
  ayah: Ayah;
  highlighted?: boolean;
  isJuzStart?: boolean;
  tafsirText?: string | null;
  tafsirLoading?: boolean;
  tafsirError?: boolean;
  showTafsir: boolean;
  onToggleTafsir: () => void;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
}

export function AyahCard({
  ayah,
  highlighted,
  isJuzStart,
  tafsirText,
  tafsirLoading,
  tafsirError,
  showTafsir,
  onToggleTafsir,
  isPlaying,
  onPlayAudio,
}: Props) {
  const { isRTL, t, theme, qiraah, fontFamily, fontSize, showTranslation, showEnglishQuran, scaleFont, palette } = useSettings();
  const rawArabicText = qiraah === 'hafs' ? ayah.textHafs : ayah.textQaloon;
  const arabicText = (fontFamily === 'ruqa' || fontFamily === 'diwan')
    ? normalizeForGenericFont(rawArabicText)
    : rawArabicText;
  const englishMode = !isRTL && showEnglishQuran;

  // Warm text shadow that matches the Islamic pattern color — gives the floating depth
  const arabicTextShadow = {
    textShadowColor: theme === 'light' ? 'rgba(122,79,42,0.13)' : 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  };

  const handleCopyAyah = async () => {
    const fullText = `${arabicText}${showTranslation && ayah.translationEn ? '\n\n' + ayah.translationEn : ''}`;
    await Clipboard.setStringAsync(fullText);
    Alert.alert('✓', 'تم نسخ الآية');
  };

  return (
    <Pressable
      onLongPress={handleCopyAyah}
      style={[
        styles.card,
        isJuzStart && styles.juzStartCard,
        highlighted && !isPlaying && { backgroundColor: palette.accent + '12' },
      ]}
    >
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View
          style={[
            styles.numberBadge,
            { backgroundColor: isPlaying ? palette.accent : palette.primary },
          ]}
        >
          <Text style={{ color: palette.primaryText, fontSize: 12, fontWeight: '700' }}>
            {ayah.verse}
          </Text>
        </View>
        <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {onPlayAudio ? (
            <Pressable onPress={onPlayAudio} style={styles.actionButton} hitSlop={8}>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle-outline'}
                size={20}
                color={isPlaying ? palette.accent : palette.textMuted}
              />
            </Pressable>
          ) : null}
          <Pressable onPress={onToggleTafsir} style={styles.actionButton} hitSlop={8}>
            <Ionicons
              name={showTafsir ? 'book' : 'book-outline'}
              size={18}
              color={showTafsir ? palette.accent : palette.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {englishMode && ayah.translationEn ? (
        <Text
          style={[
            styles.englishPrimaryText,
            {
              color: palette.text,
              fontSize: FONT_SIZE_MAP[fontSize] * 0.65,
              lineHeight: FONT_SIZE_MAP[fontSize] * 0.65 * 1.5,
            },
          ]}
        >
          {ayah.translationEn}
        </Text>
      ) : (
        <Text
          style={[
            styles.arabicText,
            {
              color: palette.text,
              fontFamily: FONT_FAMILY_MAP[fontFamily],
              fontSize: FONT_SIZE_MAP[fontSize],
              lineHeight: FONT_SIZE_MAP[fontSize] * 1.8,
              ...arabicTextShadow,
            },
          ]}
        >
          {arabicText}
        </Text>
      )}

      {!englishMode && showTranslation && ayah.translationEn ? (
        <Text style={[styles.translationText, { color: palette.textMuted, fontSize: scaleFont(14) }]}>
          {ayah.translationEn}
        </Text>
      ) : null}

      {showTafsir ? (
        <View style={[styles.tafsirBox, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
          {tafsirLoading ? (
            <ActivityIndicator color={palette.primary} />
          ) : tafsirError ? (
            <Text style={{ color: palette.textMuted, fontSize: scaleFont(13) }}>{t('tafsirError')}</Text>
          ) : (
            <Text
              style={[
                styles.tafsirText,
                {
                  color: palette.text,
                  textAlign: isRTL ? 'right' : 'left',
                  writingDirection: isRTL ? 'rtl' : 'ltr',
                  fontFamily: isRTL ? 'Cairo-Variable' : undefined,
                  fontSize: scaleFont(15),
                  lineHeight: scaleFont(15) * 1.6,
                },
              ]}
            >
              {tafsirText}
            </Text>
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    marginHorizontal: 0,
    marginVertical: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139,94,60,0.18)',
  },
  juzStartCard: {
    borderTopWidth: 1.5,
    borderTopColor: '#2A9D8F',
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: { alignItems: 'center', gap: 6 },
  actionButton: { padding: 4 },
  arabicText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  englishPrimaryText: {
    textAlign: 'left',
  },
  translationText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  tafsirBox: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  tafsirText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
