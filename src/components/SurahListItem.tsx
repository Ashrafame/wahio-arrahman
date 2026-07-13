import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chapter } from '../lib/quranData';
import { useSettings } from '../store/SettingsContext';

interface Props {
  chapter: Chapter;
  onPress: () => void;
}

export function SurahListItem({ chapter, onPress }: Props) {
  const { language, isRTL, t, palette, scaleFont } = useSettings();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? palette.surfaceAlt : palette.surface,
          borderColor: palette.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: palette.primary }]}>
        <Text style={[styles.badgeText, { color: palette.primaryText, fontSize: scaleFont(13) }]}>
          {chapter.number}
        </Text>
      </View>
      <View style={[styles.info, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.nameArabic, { color: palette.text, fontFamily: 'Amiri-Bold', fontSize: scaleFont(20) }]}>
          {chapter.nameArabic}
        </Text>
        <Text style={[styles.meta, { color: palette.textMuted, fontSize: scaleFont(12) }]}>
          {language === 'ar'
            ? `${chapter.versesCount} ${t('verses')} · ${chapter.revelationType === 'Mecca' ? t('meccan') : t('medinan')}`
            : `${chapter.nameTranslationEn} · ${chapter.versesCount} ${t('verses')} · ${
                chapter.revelationType === 'Mecca' ? t('meccan') : t('medinan')
              }`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameArabic: {
    fontSize: 20,
    // Android adds large intrinsic vertical padding for Arabic fonts (Amiri),
    // which iOS ignores — this removes it so row heights match iOS.
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
    includeFontPadding: false,
  },
});
