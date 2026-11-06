import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Rect } from 'react-native-svg';
import { useSettings } from '../../src/store/SettingsContext';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { chapters } from '../../src/lib/quranData';
import {
  PagePaths,
  QALOON_PAGE_COUNT,
  ayahAt,
  loadPage,
  pageAyahs,
  pageViewBox,
  pageSurahs,
  surahName,
  surahStartPage,
} from '../../src/lib/qaloonMushaf';

const LAST_PAGE_KEY = 'wahio-arrahman:qaloon-libya:last-page';
const BOOKMARKS_KEY = 'wahio-arrahman:qaloon-libya:bookmarks';
const WEIGHT_KEY = 'wahio-arrahman:qaloon-libya:weight';

// Line weight added to the printed text, in page units, so it stays legible when
// a whole page is scaled down to a phone. Drawn in the text colour around the
// original outlines; the letters and marks themselves are not changed.
const WEIGHTS = [
  { stroke: 0, label: 'الأصل' },
  { stroke: 1.6, label: 'متوسط' },
  { stroke: 2.6, label: 'عريض' },
];
const DEFAULT_WEIGHT = 1;
const PAGES = Array.from({ length: QALOON_PAGE_COUNT }, (_, i) => i + 1);

interface PageColors {
  text: string;
  ornament: string;
  highlight: string;
  /** Covers hidden ayahs in memorisation mode. */
  cover: string;
}

interface Selected {
  page: number;
  surah: number;
  ayah: number;
}

export default function QaloonMushafScreen() {
  const params = useLocalSearchParams<{ page?: string; surah?: string }>();
  const { palette, isRTL } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const listRef = useRef<FlatList<number>>(null);

  // The page is drawn on the app's own background and colours, like the Hafs reader.
  const colors: PageColors = {
    text: palette.text,
    ornament: palette.accent,
    highlight: palette.accent,
    cover: palette.surfaceAlt,
  };

  const [page, setPage] = useState<number | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [hifz, setHifz] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const [indexOpen, setIndexOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);

  // Opening page: explicit page › surah start › last read › 1.
  useEffect(() => {
    (async () => {
      let start = Number(params.page) || (params.surah ? surahStartPage(Number(params.surah)) : 0);
      if (!start) start = Number(await AsyncStorage.getItem(LAST_PAGE_KEY).catch(() => null)) || 1;
      setPage(Math.min(Math.max(start, 1), QALOON_PAGE_COUNT));
      const saved = await AsyncStorage.getItem(BOOKMARKS_KEY).catch(() => null);
      if (saved) setBookmarks(JSON.parse(saved));
      const w = await AsyncStorage.getItem(WEIGHT_KEY).catch(() => null);
      if (w !== null && WEIGHTS[Number(w)]) setWeight(Number(w));
    })();
  }, [params.page, params.surah]);

  useEffect(() => {
    if (page) AsyncStorage.setItem(LAST_PAGE_KEY, String(page)).catch(() => {});
  }, [page]);

  // The page uses the full screen width (the text is already small on a phone);
  // if that makes it taller than the screen, it scrolls vertically. On iOS it can
  // also be pinch-zoomed.
  const headerH = 56;
  const pageW = screenW - 8;

  const cycleWeight = () => {
    const next = (weight + 1) % WEIGHTS.length;
    setWeight(next);
    AsyncStorage.setItem(WEIGHT_KEY, String(next)).catch(() => {});
  };

  const goTo = useCallback((p: number) => {
    setPage(p);
    setSelected(null);
    listRef.current?.scrollToIndex({ index: p - 1, animated: false });
  }, []);

  const toggleBookmark = () => {
    if (!page) return;
    const next = bookmarks.includes(page) ? bookmarks.filter((b) => b !== page) : [...bookmarks, page].sort((a, b) => a - b);
    setBookmarks(next);
    AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)).catch(() => {});
  };

  const onTap = useCallback((p: number, x: number, y: number) => {
    if (hifz) {
      // Memorisation: each tap reveals the next hidden ayah on the page.
      setRevealed((r) => ({ ...r, [p]: Math.min((r[p] ?? 0) + 1, pageAyahs(p).length) }));
      return;
    }
    const hit = ayahAt(p, x, y);
    setSelected((s) => (hit && !(s && s.page === p && s.surah === hit.surah && s.ayah === hit.ayah)
      ? { page: p, surah: hit.surah, ayah: hit.ayah }
      : null));
  }, [hifz]);

  const headerSurahs = page ? pageSurahs(page) : [];
  const title = headerSurahs.map(surahName).join(' — ');

  if (!page) {
    return <View style={[styles.fill, { backgroundColor: palette.background }]}><ActivityIndicator style={styles.fill} color={palette.primary} /></View>;
  }

  return (
    <View style={[styles.fill, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, height: headerH, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <View style={styles.titleBox}>
          <Text numberOfLines={1} style={[styles.title, { color: palette.primaryText }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.primaryText }]}>
            صفحة {page} · مصحف الأوقاف الليبي · قالون
          </Text>
        </View>
        <Pressable onPress={cycleWeight} hitSlop={8} style={styles.iconBtn} accessibilityLabel={`سُمك الخط: ${WEIGHTS[weight].label}`}>
          <Text style={{ color: palette.primaryText, fontSize: 17, fontWeight: weight === 0 ? '400' : weight === 1 ? '700' : '900' }}>أ</Text>
        </Pressable>
        <Pressable onPress={() => { setHifz(!hifz); setSelected(null); }} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name={hifz ? 'eye-off' : 'eye-off-outline'} size={22} color={palette.primaryText} />
        </Pressable>
        <Pressable onPress={toggleBookmark} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name={bookmarks.includes(page) ? 'bookmark' : 'bookmark-outline'} size={22} color={palette.primaryText} />
        </Pressable>
        <Pressable onPress={() => setIndexOpen(true)} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="list" size={24} color={palette.primaryText} />
        </Pressable>
      </View>

      {hifz ? (
        <View style={[styles.hifzBar, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
          <Text style={{ color: palette.text, flex: 1, textAlign: 'right' }}>وضع التحفيظ: سمِّع ثم اضغط على الصفحة لإظهار الآية التالية</Text>
          <Pressable onPress={() => setRevealed((r) => ({ ...r, [page]: 0 }))} hitSlop={8}>
            <Text style={{ color: palette.primary, fontWeight: '700' }}>إخفاء الكل</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={PAGES}
        horizontal
        inverted // page 1 on the right; next pages to the left, as in a printed Mushaf
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => String(p)}
        initialScrollIndex={page - 1}
        getItemLayout={(_, i) => ({ length: screenW, offset: screenW * i, index: i })}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.x / screenW) + 1;
          if (p !== page) {
            setPage(p);
            setSelected(null);
          }
        }}
        renderItem={({ item }) => (
          <ScrollView
            style={{ width: screenW }}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 6 }}
            showsVerticalScrollIndicator={false}
            maximumZoomScale={Platform.OS === 'ios' ? 3 : 1}
            minimumZoomScale={1}
            bouncesZoom
            centerContent
          >
            <MushafPage
              page={item}
              width={pageW}
              height={pageW * (pageViewBox(item)[3] / pageViewBox(item)[2])}
              stroke={WEIGHTS[weight].stroke}
              colors={colors}
              selected={selected && selected.page === item ? selected : null}
              hiddenFrom={hifz ? revealed[item] ?? 0 : null}
              onTap={onTap}
            />
          </ScrollView>
        )}
      />

      {selected ? (
        <View style={[styles.ayahBar, { backgroundColor: palette.surface, borderColor: palette.border, bottom: insets.bottom + 12 }]}>
          <Text style={{ color: palette.text, fontWeight: '700' }}>
            {surahName(selected.surah)} · الآية {selected.ayah}
          </Text>
        </View>
      ) : null}

      <IndexModal
        visible={indexOpen}
        onClose={() => setIndexOpen(false)}
        onPick={(p) => { setIndexOpen(false); goTo(p); }}
        bookmarks={bookmarks}
        currentPage={page}
      />
    </View>
  );
}

const MushafPage = memo(function MushafPage({
  page, width, height, stroke, colors, selected, hiddenFrom, onTap,
}: {
  page: number;
  width: number;
  height: number;
  /** Extra line weight for the text, in page units (0 = as printed). */
  stroke: number;
  colors: PageColors;
  selected: Selected | null;
  /** In memorisation mode: how many ayahs on this page are shown; the rest are covered. */
  hiddenFrom: number | null;
  onTap: (page: number, x: number, y: number) => void;
}) {
  const [paths, setPaths] = useState<PagePaths | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    loadPage(page)
      .then((p) => alive && setPaths(p))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [page, attempt]);

  const ayahs = useMemo(() => pageAyahs(page), [page]);
  const [vx, vy, vw, vh] = pageViewBox(page);
  const scale = width / vw;

  const handlePress = (e: GestureResponderEvent) => {
    onTap(page, vx + e.nativeEvent.locationX / scale, vy + e.nativeEvent.locationY / scale);
  };

  const rectsOf = (r: number[], fill: string, opacity: number, key: string, radius = 0) => {
    const out = [];
    for (let i = 0; i < r.length; i += 4) {
      out.push(
        <Rect key={`${key}-${i}`} x={r[i]} y={r[i + 1]} width={r[i + 2]} height={r[i + 3]} rx={radius} fill={fill} fillOpacity={opacity} />,
      );
    }
    return out;
  };

  return (
    <Pressable onPress={handlePress} style={{ width, height }}>
      {paths ? (
        <Svg width={width} height={height} viewBox={`${vx} ${vy} ${vw} ${vh}`}>
          {selected
            ? ayahs
                .filter((a) => a.surah === selected.surah && a.ayah === selected.ayah)
                .flatMap((a, i) => rectsOf(a.rects, colors.highlight, 0.25, `h${i}`, 14))
            : null}
          <Path d={paths.ornament} fill={colors.ornament} fillRule="evenodd" />
          <Path
            d={paths.text}
            fill={colors.text}
            fillRule="evenodd"
            stroke={stroke ? colors.text : undefined}
            strokeWidth={stroke || undefined}
            strokeLinejoin="round"
          />
          {hiddenFrom !== null
            ? ayahs.slice(hiddenFrom).flatMap((a, i) => rectsOf(a.rects, colors.cover, 1, `c${i}`, 14))
            : null}
        </Svg>
      ) : failed ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.ornament} />
          <Text style={{ color: colors.text, marginTop: 10, textAlign: 'center' }}>
            تعذّر تنزيل الصفحة {page}.{'\n'}تحقق من اتصالك بالإنترنت.
          </Text>
          <Pressable onPress={() => setAttempt((a) => a + 1)} style={[styles.retry, { borderColor: colors.ornament }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ornament} />
        </View>
      )}
    </Pressable>
  );
});

function IndexModal({
  visible, onClose, onPick, bookmarks, currentPage,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (page: number) => void;
  bookmarks: number[];
  currentPage: number;
}) {
  const { palette } = useSettings();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.fill, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { backgroundColor: palette.primary, height: 56 }]}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color={palette.primaryText} />
          </Pressable>
          <View style={styles.titleBox}>
            <Text style={[styles.title, { color: palette.primaryText }]}>فهرس مصحف الأوقاف الليبي</Text>
          </View>
          <View style={styles.iconBtn} />
        </View>
        <FlatList
          data={chapters}
          keyExtractor={(c) => String(c.number)}
          initialNumToRender={20}
          contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            bookmarks.length ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>العلامات المرجعية</Text>
                {bookmarks.map((b) => (
                  <Pressable key={b} onPress={() => onPick(b)} style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                    <Ionicons name="bookmark" size={18} color={palette.accent} />
                    <Text style={{ color: palette.text, flex: 1, textAlign: 'right' }}>
                      صفحة {b} · {pageSurahs(b).map(surahName).join(' — ')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const start = surahStartPage(item.number);
            const here = currentPage >= start && pageSurahs(currentPage).includes(item.number);
            return (
              <Pressable
                onPress={() => onPick(start)}
                style={[styles.row, { backgroundColor: here ? palette.surfaceAlt : palette.surface, borderColor: palette.border }]}
              >
                <Text style={{ color: palette.textMuted, width: 64, textAlign: 'left' }}>ص {start}</Text>
                <Text style={{ color: palette.text, flex: 1, textAlign: 'right', fontWeight: '600' }}>
                  {item.number}. {item.nameArabic}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleBox: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 11, opacity: 0.85, marginTop: 2 },
  hifzBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  ayahBar: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  retry: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
