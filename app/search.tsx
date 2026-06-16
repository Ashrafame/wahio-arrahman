import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getChapter, parseDirectReference, SearchResult, searchQuran } from '../src/lib/quranData';
import { useSettings } from '../src/store/SettingsContext';
import { getPalette } from '../src/theme/colors';

export default function SearchScreen() {
  const { isRTL, t, theme, qiraah } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const directRef = useMemo(() => parseDirectReference(query), [query]);
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || directRef) return [];
    return searchQuran(query, qiraah, 150);
  }, [query, qiraah, directRef]);

  const goTo = (chapter: number, verse?: number) => {
    router.push({
      pathname: '/surah/[number]',
      params: { number: String(chapter), verse: verse ? String(verse) : undefined },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
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
      </View>

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
              <Text style={[styles.resultRef, { color: palette.accent }]}>
                {getChapter(item.chapter)?.nameArabic} {item.chapter}:{item.verse}
              </Text>
              <Text
                style={[
                  styles.resultText,
                  item.matchedIn === 'arabic'
                    ? { color: palette.text, textAlign: 'right', writingDirection: 'rtl', fontFamily: 'Amiri-Regular', fontSize: 19 }
                    : { color: palette.textMuted, textAlign: 'left' },
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  directCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
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
  resultRef: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  resultText: { fontSize: 14, lineHeight: 20 },
  empty: { textAlign: 'center', marginTop: 40 },
});
