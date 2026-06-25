import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getChapter, parseDirectReference, SearchResult, searchQuran } from '../src/lib/quranData';
import { useSettings } from '../src/store/SettingsContext';
import { IslamicPatternBackground } from '../src/components/IslamicPatternBackground';

export default function SearchScreen() {
  const { isRTL, t, qiraah, palette, language, scaleFont } = useSettings();
  const insets = useSafeAreaInsets();
  const { q: initialQuery } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(initialQuery ?? '');

  const directRef = useMemo(() => parseDirectReference(query), [query]);
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || directRef) return [];
    return searchQuran(query, qiraah, 200);
  }, [query, qiraah, directRef]);

  const firstArabic = results.find(r => r.matchedIn === 'arabic');
  const totalAyahCount = firstArabic?.countInQuran ?? 0;
  const totalSurahCount = firstArabic?.totalSurahCount ?? 0;

  const goTo = (chapter: number, verse?: number) => {
    router.push({
      pathname: '/surah/[number]',
      params: { number: String(chapter), verse: verse ? String(verse) : undefined },
    });
  };

  const statsLine = useMemo(() => {
    if (!query.trim() || !totalAyahCount) return null;
    if (isRTL) {
      return `وُجِدت في ${totalAyahCount} آية • ${totalSurahCount} سورة`;
    }
    return `Found in ${totalAyahCount} verse${totalAyahCount !== 1 ? 's' : ''} across ${totalSurahCount} surah${totalSurahCount !== 1 ? 's' : ''}`;
  }, [query, totalAyahCount, totalSurahCount, isRTL]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('search')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="search-outline" size={18} color={palette.textMuted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={palette.textMuted}
          style={[
            styles.searchInput,
            { color: palette.text, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
          ]}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </Pressable>
        )}
      </View>

      {statsLine ? (
        <View style={[styles.statsBar, { backgroundColor: palette.surfaceAlt ?? palette.surface, borderColor: palette.border }]}>
          <Ionicons name="stats-chart-outline" size={14} color={palette.primary} />
          <Text style={[styles.statsText, { color: palette.primary }]}>{statsLine}</Text>
        </View>
      ) : null}

      {directRef ? (
        <Pressable
          onPress={() => goTo(directRef.chapter, 'verse' in directRef ? directRef.verse : undefined)}
          style={[styles.directCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Ionicons name="arrow-forward-circle" size={20} color={palette.accent} />
          <Text style={{ color: palette.text, marginLeft: 8 }}>
            {t('jumpTo')} {getChapter(directRef.chapter)?.nameArabic}
            {'verse' in directRef ? ` : ${directRef.verse}` : ''}
          </Text>
        </Pressable>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => `${item.chapter}:${item.verse}:${idx}`}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => goTo(item.chapter, item.verse)}
              style={[styles.resultCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <View style={[styles.resultHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.resultRef, { color: palette.accent }]}>
                  {getChapter(item.chapter)?.nameArabic}  {item.chapter}:{item.verse}
                </Text>
                {item.matchedIn === 'arabic' && item.countInSurah > 1 ? (
                  <View style={[styles.badge, { backgroundColor: palette.primary + '22', borderColor: palette.primary + '44' }]}>
                    <Text style={[styles.badgeText, { color: palette.primary }]}>
                      {isRTL ? `×${item.countInSurah} في السورة` : `×${item.countInSurah} in surah`}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.resultText,
                  item.matchedIn === 'arabic'
                    ? { color: palette.text, textAlign: 'right', writingDirection: 'rtl', fontFamily: 'Amiri-Regular', fontSize: scaleFont(19) }
                    : { color: palette.textMuted, textAlign: 'left', fontSize: scaleFont(14) },
                ]}
                numberOfLines={3}
              >
                {item.snippet}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            query.trim() ? <Text style={[styles.empty, { color: palette.textMuted }]}>{t('noResults')}</Text> : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  searchBox: {
    alignItems: 'center',
    margin: 12,
    marginBottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  statsText: { fontSize: 13, fontWeight: '600' },
  directCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
  },
  resultRef: { fontSize: 12, fontWeight: '700', flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  resultText: { lineHeight: 26 },
  empty: { textAlign: 'center', marginTop: 40 },
});
