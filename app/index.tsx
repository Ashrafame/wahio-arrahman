import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chapters, normalizeArabic, parseDirectReference } from '../src/lib/quranData';
import { useSettings } from '../src/store/SettingsContext';
import { getPalette } from '../src/theme/colors';
import { SurahListItem } from '../src/components/SurahListItem';

export default function HomeScreen() {
  const { language, isRTL, t, theme } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filteredChapters = useMemo(() => {
    if (!query.trim()) return chapters;
    const ref = parseDirectReference(query);
    if (ref) {
      return chapters.filter((c) => c.number === ref.chapter);
    }
    const normalizedQuery = normalizeArabic(query);
    const lowerQuery = query.toLowerCase();
    return chapters.filter(
      (c) =>
        normalizeArabic(c.nameArabic).includes(normalizedQuery) ||
        c.nameTransliteration.toLowerCase().includes(lowerQuery) ||
        c.nameTranslationEn.toLowerCase().includes(lowerQuery) ||
        String(c.number) === query.trim()
    );
  }, [query]);

  const handleSubmit = () => {
    const ref = parseDirectReference(query);
    if (ref) {
      router.push({
        pathname: '/surah/[number]',
        params: { number: String(ref.chapter), verse: 'verse' in ref ? String(ref.verse) : undefined },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.primaryText, fontFamily: 'Amiri-Bold' }]}>
            {t('appNameArabic')}
          </Text>
          <Text style={[styles.subtitle, { color: palette.primaryText }]}>{t('appNameEnglish')}</Text>
        </View>
        <Pressable onPress={() => router.push('/search')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="search" size={24} color={palette.primaryText} />
        </Pressable>
        <Pressable onPress={() => router.push('/tools')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="grid-outline" size={24} color={palette.primaryText} />
        </Pressable>
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-sharp" size={24} color={palette.primaryText} />
        </Pressable>
      </View>

      <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name="search-outline" size={18} color={palette.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={palette.textMuted}
          style={[
            styles.searchInput,
            { color: palette.text, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
          ]}
        />
      </View>

      <FlatList
        data={filteredChapters}
        keyExtractor={(item) => String(item.number)}
        renderItem={({ item }) => (
          <SurahListItem
            chapter={item}
            onPress={() => router.push({ pathname: '/surah/[number]', params: { number: String(item.number) } })}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: palette.textMuted }]}>{t('noResults')}</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  title: { fontSize: 24 },
  subtitle: { fontSize: 12, opacity: 0.85, marginTop: 2 },
  iconButton: { padding: 4 },
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
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
