import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Ayah } from '../lib/quranData';
import { FONT_FAMILY_MAP, FONT_SIZE_MAP, useSettings } from '../store/SettingsContext';

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
  const arabicText = qiraah === 'hafs' ? ayah.textHafs : ayah.textQaloon;
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
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  fontFamily: 'Cairo-Variable',
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
