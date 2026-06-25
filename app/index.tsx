import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { chapters, normalizeArabic, getChapter } from '../src/lib/quranData';
import { useSettings } from '../src/store/SettingsContext';
import { SurahListItem } from '../src/components/SurahListItem';
import { JUZ_DATA_HAFS, JUZ_DATA_QALOON } from '../src/data/juz';
import { IslamicPatternBackground } from '../src/components/IslamicPatternBackground';
import { BookSearchIcon } from '../src/components/BookSearchIcon';

export default function HomeScreen() {
  const { language, isRTL, t, scaleFont, qiraah, palette } = useSettings();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [juzOpen, setJuzOpen] = useState(false);

  const filteredChapters = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return chapters;
    const normalizedQuery = normalizeArabic(trimmed);
    const lowerQuery = trimmed.toLowerCase();
    return chapters.filter(
      (c) =>
        normalizeArabic(c.nameArabic).includes(normalizedQuery) ||
        c.nameTransliteration.toLowerCase().includes(lowerQuery) ||
        c.nameTranslationEn.toLowerCase().includes(lowerQuery) ||
        String(c.number) === trimmed
    );
  }, [query]);

  const handleSubmit = () => {
    if (filteredChapters.length === 1) {
      router.push({ pathname: '/surah/[number]', params: { number: String(filteredChapters[0].number) } });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.primaryText, fontFamily: 'Amiri-Bold', textAlign: isRTL ? 'right' : 'left' }]}>
            {t('appNameArabic')}
          </Text>
          <Text style={[styles.subtitle, { color: palette.primaryText, textAlign: isRTL ? 'right' : 'left' }]}>{t('appNameEnglish')}</Text>
        </View>
        <Pressable onPress={() => router.push('/search')} style={styles.iconButton} hitSlop={8}>
          <BookSearchIcon size={28} color={palette.primaryText} />
        </Pressable>
        <Pressable onPress={() => setJuzOpen(true)} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="aperture-outline" size={24} color={palette.primaryText} />
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
          placeholder={t('searchSurahPlaceholder')}
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
          query.trim() ? (
            <Text style={[styles.empty, { color: palette.textMuted }]}>{t('noResults')}</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <Modal visible={juzOpen} animationType="slide" onRequestClose={() => setJuzOpen(false)}>
        <View style={[styles.juzContainer, { backgroundColor: palette.background, paddingTop: insets.top }]}>
          <View style={[styles.juzHeader, { backgroundColor: palette.primary }]}>
            <Pressable onPress={() => setJuzOpen(false)} style={styles.iconButton} hitSlop={8}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
            </Pressable>
            <Text style={[styles.juzTitle, { color: palette.primaryText }]}>
              أجزاء القرآن {qiraah === 'qaloon' ? '(قالون)' : '(حفص)'}
            </Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }} showsVerticalScrollIndicator={false}>
            {(qiraah === 'qaloon' ? JUZ_DATA_QALOON : JUZ_DATA_HAFS).map((juz) => (
                <Pressable
                  key={juz.number}
                  onPress={() => {
                    setJuzOpen(false);
                    router.push({
                      pathname: '/surah/[number]',
                      params: { number: juz.startSurah.toString(), verse: juz.startAyah.toString(), juz: juz.number.toString() },
                    });
                  }}
                  style={[styles.juzCard, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <View style={[styles.juzBadge, { backgroundColor: palette.primary }]}>
                    <Text style={{ color: palette.primaryText, fontWeight: '800', fontSize: scaleFont(14) }}>
                      {juz.number}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={{ color: palette.text, fontWeight: '700', fontSize: scaleFont(15), fontFamily: 'Amiri-Bold' }}>
                      {isRTL ? juz.nameAr : juz.nameEn}
                    </Text>
                    <Text style={{ color: palette.textMuted, fontSize: scaleFont(12), marginTop: 3 }}>
                      {isRTL
                        ? `سورة ${getChapter(juz.startSurah)?.nameArabic} · الآية ${juz.startAyah}`
                        : `Surah ${getChapter(juz.startSurah)?.nameTranslationEn} · Verse ${juz.startAyah}`}
                    </Text>
                  </View>
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={palette.textMuted} />
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </Modal>
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
  juzContainer: { flex: 1 },
  juzHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  juzTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Amiri-Bold' },
  juzCard: { borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  juzBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
