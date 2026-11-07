import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../store/SettingsContext';
import { QALOON_RECITERS, getAyahAudioUrl } from '../lib/reciters';
import {
  getCurrentAudioKey,
  pauseAudio,
  playAudio,
  resumeAudio,
  stopAudio,
  subscribeAudio,
  subscribePosition,
} from '../lib/audio';
import { useScreenBottomInset } from '../lib/insets';
import { surahName } from '../lib/qaloonMushaf';
import { hasPageTurns, pageAtTime } from '../data/qaloonPageTurns';

const keyFor = (surah: number, reciterId: string) => `qaloon-libya:${surah}:${reciterId}`;

function parseKey(key: string | null): { surah: number; reciterId: string } | null {
  const m = key?.match(/^qaloon-libya:(\d+):(.+)$/);
  return m ? { surah: Number(m[1]), reciterId: m[2] } : null;
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** '#RRGGBB' + opacity -> '#RRGGBBAA' (other formats are returned unchanged). */
const withAlpha = (color: string, alpha: number) =>
  /^#[0-9a-f]{6}$/i.test(color) ? color + Math.round(alpha * 255).toString(16).padStart(2, '0') : color;

/** While playing, the bar slides away after this long without a touch. */
const AUTO_HIDE_MS = 10_000;

// Any touch on the reader brings the bar back (the reader calls wakePlayerBar
// from its root view, so a tap does not re-render the whole page).
const wakeListeners = new Set<() => void>();
export function wakePlayerBar() {
  wakeListeners.forEach((l) => l());
}

/**
 * Recitation player for the Libyan Awqaf Mushaf. The Qaloon recordings are one
 * file per surah, so playback always starts at the beginning of a surah.
 * Reciters with page-turn timings (src/data/qaloonPageTurns.ts) turn the pages
 * automatically while `follow` is on.
 *
 * While a recitation plays, the bar is translucent and slides out of the way
 * after AUTO_HIDE_MS so it does not cover the text; a thin progress line stays.
 * Touching the screen brings it back. It stays visible while paused.
 */
export function QaloonPlayerBar({
  surahToPlay,
  onStartSurah,
  follow,
  onFollowChange,
  onFollowPage,
}: {
  /** Surah played by the play button: the selected ayah's, else the chosen surah, else the page's. */
  surahToPlay: number;
  /** Called when a surah starts, so the reader can open its first page. */
  onStartSurah: (surah: number) => void;
  /** Turn pages automatically with the recitation (when the reciter has timings). */
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
  /** Called with the page the reciter has reached. */
  onFollowPage: (page: number) => void;
}) {
  const { palette, qaloonReciter, setQaloonReciter } = useSettings();
  const insets = useSafeAreaInsets();
  const bottomInset = useScreenBottomInset();
  const reciter = QALOON_RECITERS.find((r) => r.id === qaloonReciter) ?? QALOON_RECITERS[0];

  const [now, setNow] = useState(() => ({ key: getCurrentAudioKey(), playing: false }));
  const [pos, setPos] = useState({ at: 0, dur: 0 });
  const [picking, setPicking] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [wake, setWake] = useState(0);
  const shown = useRef(new Animated.Value(1)).current;
  // The play button (before any recitation) slides to the left edge after
  // AUTO_HIDE_MS untouched, leaving a small tab; tapping the tab brings it back.
  const [fabOpen, setFabOpen] = useState(true);
  const [fabW, setFabW] = useState(200);
  const fabSlide = useRef(new Animated.Value(1)).current;

  useEffect(() => subscribeAudio((key, playing) => setNow({ key, playing })), []);
  useEffect(() => subscribePosition((at, dur) => setPos({ at, dur })), []);
  useEffect(() => {
    const l = () => setWake((w) => w + 1);
    wakeListeners.add(l);
    return () => {
      wakeListeners.delete(l);
    };
  }, []);

  // The single-file player does not report the end of a file; close the bar
  // when the surah has played to its end.
  useEffect(() => {
    if (pos.dur > 0 && pos.at >= pos.dur - 400 && parseKey(getCurrentAudioKey())) stopAudio();
  }, [pos]);

  const current = parseKey(now.key);
  const active = !!current;
  const canFollow = !!current && hasPageTurns(current.reciterId, current.surah);

  // Show on a touch, and whenever playback is paused or the reciter list is open;
  // hide again after AUTO_HIDE_MS of playing untouched.
  useEffect(() => {
    setHidden(false);
    if (!active || !now.playing || picking) return;
    const t = setTimeout(() => setHidden(true), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [wake, active, now.playing, picking]);

  useEffect(() => {
    Animated.timing(shown, {
      toValue: hidden ? 0 : 1,
      duration: hidden ? 450 : 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, shown]);

  // Show the play button again when the surah it would play changes (a new
  // page or a tapped ayah) or when a recitation ends; tuck it away after a while.
  useEffect(() => {
    if (!active) setFabOpen(true);
  }, [surahToPlay, active]);
  useEffect(() => {
    if (active || !fabOpen) return;
    const t = setTimeout(() => setFabOpen(false), AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [active, fabOpen, surahToPlay]);
  useEffect(() => {
    Animated.spring(fabSlide, { toValue: fabOpen ? 1 : 0, friction: 9, tension: 55, useNativeDriver: true }).start();
  }, [fabOpen, fabSlide]);

  // Automatic page turning: show the page the reciter has reached.
  useEffect(() => {
    if (!current || !follow || !now.playing) return;
    const page = pageAtTime(current.reciterId, current.surah, pos.at);
    if (page) onFollowPage(page);
  }, [pos.at, follow, now.playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (surah: number, reciterId: string) => {
    const audio = getAyahAudioUrl(surah, 1, 'qaloon', reciterId);
    if (!audio) return;
    setPos({ at: 0, dur: 0 });
    playAudio(keyFor(surah, reciterId), audio.url);
    onStartSurah(surah);
  };

  const togglePlay = () => {
    if (!current) return start(surahToPlay, reciter.id);
    if (now.playing) pauseAudio();
    else resumeAudio();
  };

  const chooseReciter = (id: string) => {
    setQaloonReciter(id);
    setPicking(false);
    if (current) start(current.surah, id); // switch voice, same surah
  };

  if (!active) {
    // The button says which surah it will play, so a page shared by two surahs
    // is never ambiguous.
    return (
      <>
        <Animated.View
          pointerEvents={fabOpen ? 'auto' : 'none'}
          onLayout={(e) => setFabW(e.nativeEvent.layout.width)}
          style={[
            styles.fabWrap,
            {
              bottom: bottomInset + 16,
              transform: [{ translateX: fabSlide.interpolate({ inputRange: [0, 1], outputRange: [-(fabW + 30), 0] }) }],
            },
          ]}
        >
          <Pressable
            onPress={togglePlay}
            style={[styles.fab, { backgroundColor: palette.primary }]}
            accessibilityLabel={`تلاوة ${surahName(surahToPlay)} بصوت ${reciter.nameAr}`}
          >
            <Ionicons name="play" size={22} color={palette.primaryText} />
            <Text numberOfLines={1} style={[styles.fabText, { color: palette.primaryText }]}>
              {surahName(surahToPlay)}
            </Text>
          </Pressable>
        </Animated.View>

        {/* The tab left at the screen edge while the button is tucked away. */}
        <Animated.View
          pointerEvents={fabOpen ? 'none' : 'auto'}
          style={[
            styles.tabWrap,
            {
              bottom: bottomInset + 16,
              opacity: fabSlide.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0, 0] }),
              transform: [{ translateX: fabSlide.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
            },
          ]}
        >
          <Pressable
            onPress={() => setFabOpen(true)}
            hitSlop={{ top: 10, bottom: 10, right: 14 }}
            style={[styles.tab, { backgroundColor: palette.primary, borderColor: palette.accent }]}
            accessibilityLabel={`إظهار زر تلاوة ${surahName(surahToPlay)}`}
          >
            <Ionicons name="play" size={15} color={palette.primaryText} />
            <Ionicons name="chevron-forward" size={13} color={palette.primaryText} style={{ marginTop: -2 }} />
          </Pressable>
        </Animated.View>
      </>
    );
  }

  const progress = pos.dur > 0 ? Math.min(1, pos.at / pos.dur) : 0;

  return (
    <>
      {/* Thin progress line left on screen while the bar is hidden. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.miniTrack,
          { bottom: bottomInset, backgroundColor: withAlpha(palette.surfaceAlt, 0.7) },
          { opacity: shown.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
        ]}
      >
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: palette.accent }]} />
      </Animated.View>

      <Animated.View
        pointerEvents={hidden ? 'none' : 'auto'}
        style={[
          styles.bar,
          {
            backgroundColor: withAlpha(palette.surface, 0.82),
            borderColor: withAlpha(palette.border, 0.8),
            bottom: bottomInset + 10,
            opacity: shown,
            transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }],
          },
        ]}
      >
        <View style={[styles.track, { backgroundColor: withAlpha(palette.surfaceAlt, 0.8) }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: palette.accent }]} />
        </View>
        <View style={styles.row}>
          <Pressable onPress={stopAudio} hitSlop={10} style={styles.btn} accessibilityLabel="إيقاف التلاوة">
            <Ionicons name="close" size={22} color={palette.textMuted} />
          </Pressable>
          {canFollow ? (
            <Pressable
              onPress={() => onFollowChange(!follow)}
              hitSlop={8}
              style={styles.btn}
              accessibilityLabel={follow ? 'إيقاف قلب الصفحات تلقائياً' : 'قلب الصفحات تلقائياً مع التلاوة'}
            >
              <Ionicons name={follow ? 'book' : 'book-outline'} size={20} color={follow ? palette.accent : palette.textMuted} />
            </Pressable>
          ) : null}
          <Pressable onPress={togglePlay} hitSlop={10} style={[styles.playBtn, { backgroundColor: palette.primary }]}>
            <Ionicons name={now.playing ? 'pause' : 'play'} size={22} color={palette.primaryText} />
          </Pressable>
          <Pressable onPress={() => setPicking(true)} style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>
              {surahName(current.surah)}
            </Text>
            <Text numberOfLines={1} style={[styles.sub, { color: palette.textMuted }]}>
              {reciter.nameAr} ▾ · {fmt(pos.at)}{pos.dur ? ` / ${fmt(pos.dur)}` : ''}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <Modal visible={picking} transparent animationType="fade" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(false)}>
          <View style={[styles.sheet, { backgroundColor: palette.surface, paddingBottom: insets.bottom + 12 }]}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>القارئ · رواية قالون عن نافع</Text>
            <ScrollView>
              {QALOON_RECITERS.map((r) => (
                <Pressable key={r.id} onPress={() => chooseReciter(r.id)} style={[styles.option, { borderColor: palette.border }]}>
                  <Ionicons
                    name={r.id === reciter.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={r.id === reciter.id ? palette.primary : palette.textMuted}
                  />
                  <Text style={{ color: palette.text, flex: 1, textAlign: 'right', fontSize: 15 }}>{r.nameAr}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', left: 18 },
  tabWrap: { position: 'absolute', left: 0 },
  tab: {
    width: 30, height: 52, borderTopRightRadius: 16, borderBottomRightRadius: 16,
    borderWidth: 1, borderLeftWidth: 0, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 1, height: 2 }, elevation: 5,
  },
  fab: {
    height: 52, maxWidth: 220, borderRadius: 26, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  fabText: { fontSize: 16, fontWeight: '700' },
  bar: {
    position: 'absolute', left: 12, right: 12, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  miniTrack: { position: 'absolute', left: 0, right: 0, height: 3 },
  track: { height: 3 },
  fill: { height: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  sub: { fontSize: 12, marginTop: 2, textAlign: 'right' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '70%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: 10 },
  option: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
});
