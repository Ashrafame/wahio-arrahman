import React, { useMemo } from 'react';
import { SectionList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getChapter, getAyahText } from '../src/lib/quranData';
import { getAsbabIndex, getAsbabCount } from '../src/lib/asbabNuzul';
import { useSettings } from '../src/store/SettingsContext';
import { IslamicPatternBackground } from '../src/components/IslamicPatternBackground';
import { AsbabIcon } from '../src/components/AsbabIcon';

interface VerseRow {
  chapter: number;
  verse: number;
}

interface Section {
  chapter: number;
  title: string;
  data: VerseRow[];
}

export default function AsbabScreen() {
  const { isRTL, t, qiraah, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const sections = useMemo<Section[]>(() => {
    return getAsbabIndex().map((group) => {
      const chapter = getChapter(group.chapter);
      const name = chapter?.nameArabic ?? `${group.chapter}`;
      return {
        chapter: group.chapter,
        title: name,
        data: group.verses.map((verse) => ({ chapter: group.chapter, verse })),
      };
    });
  }, []);

  const totalCount = useMemo(() => getAsbabCount(), []);

  const goToVerse = (chapter: number, verse: number) => {
    router.push({
      pathname: '/surah/[number]',
      params: { number: String(chapter), verse: String(verse) },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AsbabIcon size={22} color={palette.primaryText} />
          <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('asbabNuzul')}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <View style={[styles.statsBar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <Ionicons name="document-text-outline" size={14} color={palette.primary} />
        <Text style={[styles.statsText, { color: palette.primary }]}>
          {isRTL
            ? `${totalCount} آية لها سبب نزول في ${sections.length} سورة`
            : `${totalCount} verses with a recorded reason across ${sections.length} surahs`}
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.chapter}:${item.verse}`}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { color: palette.text, fontFamily: 'Amiri-Bold' }]}>
              سورة {section.title}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: palette.primary + '22', borderColor: palette.primary + '44' }]}>
              <Text style={[styles.countBadgeText, { color: palette.primary }]}>{section.data.length}</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const preview = getAyahText(item.chapter, item.verse, qiraah);
          return (
            <Pressable
              onPress={() => goToVerse(item.chapter, item.verse)}
              style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.verseBadge, { backgroundColor: palette.primary }]}>
                <Text style={{ color: palette.primaryText, fontSize: scaleFont(12), fontWeight: '700' }}>
                  {item.verse}
                </Text>
              </View>
              <Text
                style={[styles.versePreview, { color: palette.text, fontFamily: 'Amiri-Regular', fontSize: scaleFont(17) }]}
                numberOfLines={1}
              >
                {preview}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={palette.textMuted} />
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: 30 }}
        initialNumToRender={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statsText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  sectionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  countBadge: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
  row: {
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  verseBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versePreview: { flex: 1, textAlign: 'right', writingDirection: 'rtl' },
});
