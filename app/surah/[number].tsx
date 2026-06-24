import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Ayah, getChapter, getSurahAyahs, getVerseCount } from '../../src/lib/quranData';
import { Palette } from '../../src/theme/colors';
import { JUZ_DATA_HAFS, JUZ_DATA_QALOON } from '../../src/data/juz';
import { fetchSurahTafsir, TAFSIR_EDITIONS } from '../../src/lib/tafsirRemote';
import { useSettings } from '../../src/store/SettingsContext';
import { AyahCard } from '../../src/components/AyahCard';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { getAyahAudioUrl, getRecitersForQiraah } from '../../src/lib/reciters';
import { getCurrentAudioKey, getCurrentSequenceId, pauseAudio, resumeAudio, playAudio, playSequence, stopAudio, subscribeAudio, subscribePosition } from '../../src/lib/audio';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const BISMILLAH_EN = 'In the name of Allah, the Most Gracious, the Most Merciful';

export default function SurahScreen() {
  const params = useLocalSearchParams<{ number: string; verse?: string; juz?: string }>();
  const chapterNumber = Number(params.number);
  const targetVerse = params.verse ? Number(params.verse) : undefined;
  const fromJuz = params.juz ? Number(params.juz) : undefined;

  const {
    isRTL,
    t,
    theme,
    qiraah,
    setQiraah,
    showTranslation,
    setShowTranslation,
    tafsirEdition,
    setTafsirEdition,
    hafsReciter,
    qaloonReciter,
    setHafsReciter,
    setQaloonReciter,
    language,
    setLanguage,
    palette,
  } = useSettings();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Ayah>>(null);
  const qaloonLastScrolledVerse = useRef<number | null>(null);

  const chapter = getChapter(chapterNumber);
  const ayahs = useMemo(() => getSurahAyahs(chapterNumber, qiraah), [chapterNumber, qiraah]);

  // Proportional boundaries for Qaloon — used only for auto-scroll (not for highlighting)
  const qaloonBoundaries = useMemo(() => {
    if (qiraah !== 'qaloon') return null;
    const textWeights = ayahs.map((a) => Math.max(1, (a.textQaloon || '').replace(/\s+/g, '').length));
    const totalText = textWeights.reduce((s, w) => s + w, 0);
    const INTRO = (chapterNumber === 1 || chapterNumber === 9) ? 12 : 32;
    const PAUSE = 6;
    const totalWeight = INTRO + totalText + PAUSE * ayahs.length;
    let acc = INTRO;
    return ayahs.map((a, i) => {
      const start = acc / totalWeight;
      acc += textWeights[i] + PAUSE;
      return { verse: a.verse, start, end: Math.min(0.999, acc / totalWeight) };
    });
  }, [ayahs, qiraah, chapterNumber]);

  // Resolve the effective tafsir edition: auto-switch to English when app language is English
  const effectiveTafsirEdition = useMemo(() => {
    if (language !== 'ar') return 'en-ibnkathir'; // only English tafsir available in English mode
    if (tafsirEdition === 'en-ibnkathir') return 'ibnkathir'; // safety: no English edition in Arabic mode
    return tafsirEdition;
  }, [tafsirEdition, language]);

  const [openTafsirVerses, setOpenTafsirVerses] = useState<Set<number>>(new Set());
  const [tafsirMap, setTafsirMap] = useState<Record<number, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reciterPickerOpen, setReciterPickerOpen] = useState(false);
  const [juzPickerOpen, setJuzPickerOpen] = useState(false);
  const [highlightVerse, setHighlightVerse] = useState<number | undefined>(targetVerse);
  const [playingKey, setPlayingKey] = useState<string | null>(getCurrentAudioKey());
  const [currentSeqId, setCurrentSeqId] = useState<string | null>(getCurrentSequenceId());
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const reciterId = qiraah === 'hafs' ? hafsReciter : qaloonReciter;
  const setReciterId = qiraah === 'hafs' ? setHafsReciter : setQaloonReciter;
  const reciterOptions = getRecitersForQiraah(qiraah);
  const qaloonSurahKey = `${chapterNumber}:${reciterId}`;

  useEffect(() => {
    return subscribeAudio((key, isPlaying) => {
      setPlayingKey(key);
      setCurrentSeqId(isPlaying ? getCurrentSequenceId() : null);
      setIsActuallyPlaying(isPlaying);
    });
  }, []);

  // Auto-scroll to the currently playing ayah whenever the key advances in a Hafs sequence
  useEffect(() => {
    if (qiraah !== 'hafs' || !playingKey) return;
    const parts = playingKey.split(':');
    if (parts.length !== 3 || Number(parts[0]) !== chapterNumber) return;
    const verse = Number(parts[1]);
    const index = ayahs.findIndex((a) => a.verse === verse);
    if (index < 0) return;
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
  }, [playingKey, qiraah, chapterNumber, ayahs]);

  // Auto-scroll for Qaloon using proportional position estimate (no highlighting, just scroll)
  useEffect(() => {
    if (qiraah !== 'qaloon') return;
    qaloonLastScrolledVerse.current = null;
    return subscribePosition((posMs, durMs) => {
      if (playingKey !== qaloonSurahKey || durMs <= 0 || !qaloonBoundaries) return;
      const frac = Math.min(0.99999, posMs / durMs);
      const active = qaloonBoundaries.find((b) => frac >= b.start && frac < b.end);
      if (!active || qaloonLastScrolledVerse.current === active.verse) return;
      qaloonLastScrolledVerse.current = active.verse;
      const index = ayahs.findIndex((a) => a.verse === active.verse);
      if (index < 0) return;
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
    });
  }, [qiraah, qaloonBoundaries, playingKey, qaloonSurahKey, ayahs]);

  useEffect(() => {
    let cancelled = false;
    const edition = TAFSIR_EDITIONS.find((e) => e.id === effectiveTafsirEdition);
    if (!edition) return;

    if (edition.bundled) {
      const map: Record<number, string> = {};
      for (const ayah of ayahs) map[ayah.verse] = ayah.tafsirMuyassar;
      setTafsirMap(map);
      setTafsirError(false);
      return;
    }

    setTafsirLoading(true);
    setTafsirError(false);
    setTafsirMap({});
    fetchSurahTafsir(edition.slug, chapterNumber)
      .then((map) => {
        if (!cancelled) setTafsirMap(map);
      })
      .catch(() => {
        if (!cancelled) setTafsirError(true);
      })
      .finally(() => {
        if (!cancelled) setTafsirLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveTafsirEdition, chapterNumber, ayahs]);

  useEffect(() => {
    if (!targetVerse) return;
    const index = ayahs.findIndex((a) => a.verse === targetVerse);
    if (index < 0) return;

    setHighlightVerse(targetVerse);

    // First: scroll without animation to get items rendered
    const t1 = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.2 });
    }, 300);
    // Second: smooth scroll after items are rendered
    const t2 = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
    }, 900);
    const t3 = setTimeout(() => setHighlightVerse(undefined), 4000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [targetVerse, ayahs]);

  if (!chapter) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <Text style={{ color: palette.text, margin: 16 }}>404</Text>
      </View>
    );
  }

  const toggleTafsir = (verse: number) => {
    setOpenTafsirVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verse)) next.delete(verse);
      else next.add(verse);
      return next;
    });
  };

  const currentEditionName = (lang: 'ar' | 'en') => {
    const edition = TAFSIR_EDITIONS.find((e) => e.id === effectiveTafsirEdition);
    return edition ? (lang === 'ar' ? edition.nameArabic : edition.nameEnglish) : '';
  };

  const currentReciterName = (lang: 'ar' | 'en') => {
    const reciter = reciterOptions.find((r) => r.id === reciterId);
    return reciter ? (lang === 'ar' ? reciter.nameAr : reciter.nameEn) : '';
  };

  // ── Hafs: sequence of per-ayah files ────────────────────────────────────
  const hafsSeqId = `surah:${chapterNumber}:hafs:${hafsReciter}`;
  const hafsIsPlaying = currentSeqId === hafsSeqId;

  const handlePlayHafsSurah = () => {
    if (hafsIsPlaying) { pauseAudio(); return; }
    // Resume if same sequence is paused mid-way
    if (!isActuallyPlaying && getCurrentSequenceId() === hafsSeqId) {
      resumeAudio();
      return;
    }
    const items = ayahs
      .map((a) => {
        const audio = getAyahAudioUrl(chapterNumber, a.verse, 'hafs', hafsReciter);
        if (!audio) return null;
        return { key: `${chapterNumber}:${a.verse}:${hafsReciter}`, url: audio.url };
      })
      .filter((x): x is { key: string; url: string } => x !== null);
    playSequence(hafsSeqId, items);
  };

  // ── Qaloon: whole-surah file ─────────────────────────────────────────────
  const qaloonSurahIsPlaying = playingKey === qaloonSurahKey && isActuallyPlaying;

  const handlePlayQaloonSurah = () => {
    if (qaloonSurahIsPlaying) { pauseAudio(); return; }
    const audio = getAyahAudioUrl(chapterNumber, 1, 'qaloon', reciterId);
    if (!audio) return;
    // playAudio resumes if same key is paused, starts fresh otherwise
    playAudio(qaloonSurahKey, audio.url);
  };

  const surahIsPlaying = qiraah === 'hafs' ? hafsIsPlaying : qaloonSurahIsPlaying;
  const handlePlaySurah = qiraah === 'hafs' ? handlePlayHafsSurah : handlePlayQaloonSurah;

  const handlePlayAyah = (verse: number) => {
    const audio = getAyahAudioUrl(chapterNumber, verse, qiraah, reciterId);
    if (!audio) return;
    playAudio(`${chapterNumber}:${verse}:${reciterId}`, audio.url);
  };

  const isAyahPlaying = (verse: number) =>
    qiraah === 'hafs' && playingKey === `${chapterNumber}:${verse}:${reciterId}`;

  const handleQiraahChange = (newQiraah: 'hafs' | 'qaloon') => {
    setQiraah(newQiraah);
    if (!fromJuz) return;
    const juzData = newQiraah === 'qaloon' ? JUZ_DATA_QALOON : JUZ_DATA_HAFS;
    const juz = juzData.find((j) => j.number === fromJuz);
    if (!juz) return;
    if (juz.startSurah === chapterNumber) {
      router.setParams({ verse: juz.startAyah.toString() });
    } else {
      router.replace({
        pathname: '/surah/[number]',
        params: { number: juz.startSurah.toString(), verse: juz.startAyah.toString(), juz: fromJuz.toString() },
      });
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.headerTitle, { color: palette.primaryText, fontFamily: 'Amiri-Bold' }]}>
              {chapter.nameArabic}
            </Text>
            {!fromJuz ? (
              <Pressable onPress={handlePlaySurah} hitSlop={8}>
                <Ionicons name={surahIsPlaying ? 'pause-circle' : 'play-circle'} size={22} color={palette.primaryText} />
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.headerSubtitle, { color: palette.primaryText }]}>
            {fromJuz ? (isRTL ? `الجزء ${fromJuz} · ` : `Juz ${fromJuz} · `) : ''}
            {(!isRTL || showTranslation) ? `${chapter.nameTranslationEn} · ` : ''}
            {getVerseCount(chapterNumber, qiraah)} {t('verses')}
          </Text>
        </View>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
          {fromJuz ? (
            <Pressable onPress={() => setJuzPickerOpen(true)} style={styles.iconButton} hitSlop={8}>
              <Ionicons name="aperture-outline" size={22} color={palette.primaryText} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.toolbar, { backgroundColor: palette.surface, borderColor: palette.border }]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.toolbarChips}>
        <SegmentedToggle
          options={[
            { id: 'hafs', label: isRTL ? 'حفص' : 'Hafs' },
            { id: 'qaloon', label: isRTL ? 'قالون' : 'Qaloon' },
          ]}
          value={qiraah}
          onChange={(v) => handleQiraahChange(v as 'hafs' | 'qaloon')}
          palette={palette}
        />
        <ToolbarChip
          icon="language-outline"
          active={showTranslation}
          label={t('translation')}
          onPress={() => setShowTranslation(!showTranslation)}
          palette={palette}
        />
        <ToolbarChip
          icon="book-outline"
          active={false}
          label={currentEditionName(isRTL ? 'ar' : 'en')}
          onPress={() => setPickerOpen(true)}
          palette={palette}
        />
        <ToolbarChip
          icon="mic-outline"
          active={false}
          label={currentReciterName(isRTL ? 'ar' : 'en')}
          onPress={() => setReciterPickerOpen(true)}
          palette={palette}
        />
        <ToolbarChip
          icon="globe-outline"
          active={false}
          label={language === 'ar' ? 'EN' : 'عربي'}
          onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          palette={palette}
        />
        <ToolbarChip
          icon="options-outline"
          active={false}
          label={t('fontSize')}
          onPress={() => router.push('/settings')}
          palette={palette}
        />
        </View>
      </ScrollView>

      <FlatList
        ref={listRef}
        data={ayahs}
        keyExtractor={(item) => item.key}
        initialNumToRender={targetVerse ? Math.max(15, (ayahs.findIndex(a => a.verse === targetVerse) ?? 0) + 5) : 15}
        ListHeaderComponent={
          // Show Bismillah header for all surahs except At-Tawbah (9).
          // For Al-Fatiha in Hafs, verse 1 already IS the Bismillah so skip the header.
          // For Al-Fatiha in Qaloon, verse 1 is Al-Hamd so we must add the header manually.
          chapterNumber !== 9 && (chapterNumber !== 1 || qiraah === 'qaloon') ? (
            <View style={styles.bismillahBlock}>
              <Text style={[styles.bismillah, { color: palette.text, fontFamily: 'Amiri-Bold' }]}>
                {BISMILLAH}
              </Text>
              {showTranslation ? (
                <Text style={[styles.bismillahTranslation, { color: palette.textMuted }]}>
                  {BISMILLAH_EN}
                </Text>
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <AyahCard
            ayah={item}
            highlighted={highlightVerse === item.verse}
            isJuzStart={item.chapter === chapterNumber && item.verse === targetVerse}
            showTafsir={openTafsirVerses.has(item.verse)}
            onToggleTafsir={() => toggleTafsir(item.verse)}
            tafsirText={tafsirMap[item.verse]}
            tafsirLoading={tafsirLoading}
            tafsirError={tafsirError}
            isPlaying={isAyahPlaying(item.verse)}
            onPlayAudio={qiraah === 'hafs' ? () => handlePlayAyah(item.verse) : undefined}
          />
        )}
        onScrollToIndexFailed={(info) => {
          // Scroll to estimated offset first, then retry scrollToIndex
          const offset = info.averageItemLength * info.index;
          listRef.current?.scrollToOffset({ offset, animated: false });
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.2 });
          }, 300);
        }}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 30 }}
      />

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('selectTafsir')}</Text>
            {TAFSIR_EDITIONS.filter((e) => isRTL ? !e.isEnglish : !!e.isEnglish).map((edition) => (
              <Pressable
                key={edition.id}
                onPress={() => {
                  if (!edition.isEnglish) setTafsirEdition(edition.id);
                  setPickerOpen(false);
                }}
                style={[
                  styles.modalRow,
                  {
                    backgroundColor: effectiveTafsirEdition === edition.id ? palette.surfaceAlt : 'transparent',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                {effectiveTafsirEdition === edition.id ? (
                  <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
                ) : (
                  <View style={{ width: 18 }} />
                )}
                <Text style={{ color: palette.text, fontSize: 15 }}>
                  {isRTL ? edition.nameArabic : edition.nameEnglish}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={reciterPickerOpen} transparent animationType="fade" onRequestClose={() => setReciterPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setReciterPickerOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('selectReciter')}</Text>
            {reciterOptions.map((reciter) => (
              <Pressable
                key={reciter.id}
                onPress={() => {
                  setReciterId(reciter.id);
                  setReciterPickerOpen(false);
                }}
                style={[
                  styles.modalRow,
                  {
                    backgroundColor: reciterId === reciter.id ? palette.surfaceAlt : 'transparent',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                {reciterId === reciter.id ? (
                  <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
                ) : (
                  <View style={{ width: 18 }} />
                )}
                <Text style={{ color: palette.text, fontSize: 15 }}>
                  {isRTL ? reciter.nameAr : reciter.nameEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={juzPickerOpen} animationType="slide" onRequestClose={() => setJuzPickerOpen(false)}>
        <View style={[styles.juzPickerContainer, { backgroundColor: palette.background, paddingTop: insets.top }]}>
          <View style={[styles.juzPickerHeader, { backgroundColor: palette.primary }]}>
            <Pressable onPress={() => setJuzPickerOpen(false)} style={styles.iconButton} hitSlop={8}>
              <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
            </Pressable>
            <Text style={[styles.juzPickerTitle, { color: palette.primaryText }]}>
              {isRTL ? `أجزاء القرآن ${qiraah === 'qaloon' ? '(قالون)' : '(حفص)'}` : `Quran Juz (${qiraah === 'qaloon' ? 'Qaloon' : 'Hafs'})`}
            </Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }} showsVerticalScrollIndicator={false}>
            {(qiraah === 'qaloon' ? JUZ_DATA_QALOON : JUZ_DATA_HAFS).map((juz) => (
              <Pressable
                key={juz.number}
                onPress={() => {
                  setJuzPickerOpen(false);
                  router.push({
                    pathname: '/surah/[number]',
                    params: { number: juz.startSurah.toString(), verse: juz.startAyah.toString(), juz: juz.number.toString() },
                  });
                }}
                style={[
                  styles.juzCard,
                  {
                    backgroundColor: fromJuz === juz.number ? palette.surfaceAlt : palette.surface,
                    borderColor: fromJuz === juz.number ? palette.accent : palette.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={[styles.juzBadge, { backgroundColor: palette.primary }]}>
                  <Text style={{ color: palette.primaryText, fontWeight: '800', fontSize: 14 }}>
                    {juz.number}
                  </Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={{ color: palette.text, fontWeight: '700', fontSize: 15, fontFamily: 'Amiri-Bold' }}>
                    {isRTL ? juz.nameAr : juz.nameEn}
                  </Text>
                  <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 3 }}>
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

function SegmentedToggle({
  options,
  value,
  onChange,
  palette,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  palette: Palette;
}) {
  return (
    <View style={[styles.segmented, { borderColor: palette.border }]}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => onChange(opt.id)}
          style={[styles.segmentedOption, { backgroundColor: value === opt.id ? palette.primary : 'transparent' }]}
        >
          <Text style={{ color: value === opt.id ? palette.primaryText : palette.text, fontFamily: 'Amiri-Bold', fontSize: 14, lineHeight: 20 }}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ToolbarChip({
  icon,
  label,
  active,
  onPress,
  palette,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
  palette: Palette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: palette.border, backgroundColor: active ? palette.surfaceAlt : palette.surface },
      ]}
    >
      <Ionicons name={icon} size={15} color={active ? palette.accent : palette.textMuted} />
      <Text style={{ color: active ? palette.accent : palette.textMuted, fontSize: 12, lineHeight: 16, marginLeft: 4 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 20 },
  headerSubtitle: { fontSize: 11, opacity: 0.85, marginTop: 2 },
  toolbar: {
    borderBottomWidth: 1,
    height: 54,
  },
  toolbarChips: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    height: 38,
  },
  segmentedOption: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bismillahBlock: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  bismillah: {
    textAlign: 'center',
    fontSize: 26,
  },
  bismillahTranslation: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalRow: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  juzPickerContainer: { flex: 1 },
  juzPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  juzPickerTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Amiri-Bold' },
  juzCard: { borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  juzBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
