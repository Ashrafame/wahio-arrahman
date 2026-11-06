import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { surahName } from '../lib/qaloonMushaf';

const keyFor = (surah: number, reciterId: string) => `qaloon-libya:${surah}:${reciterId}`;

function parseKey(key: string | null): { surah: number; reciterId: string } | null {
  const m = key?.match(/^qaloon-libya:(\d+):(.+)$/);
  return m ? { surah: Number(m[1]), reciterId: m[2] } : null;
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * Recitation player for the Libyan Awqaf Mushaf. The Qaloon recordings are one
 * file per surah, so playback always starts at the beginning of a surah. (Ayah
 * highlighting and automatic page turns need per-ayah timings, which these
 * recordings don't have yet.)
 */
export function QaloonPlayerBar({
  surahToPlay,
  onStartSurah,
}: {
  /** Surah played by the play button: the selected ayah's, else the current page's. */
  surahToPlay: number;
  /** Called when a surah starts, so the reader can open its first page. */
  onStartSurah: (surah: number) => void;
}) {
  const { palette, qaloonReciter, setQaloonReciter } = useSettings();
  const insets = useSafeAreaInsets();
  const reciter = QALOON_RECITERS.find((r) => r.id === qaloonReciter) ?? QALOON_RECITERS[0];

  const [now, setNow] = useState(() => ({ key: getCurrentAudioKey(), playing: false }));
  const [pos, setPos] = useState({ at: 0, dur: 0 });
  const [picking, setPicking] = useState(false);

  useEffect(() => subscribeAudio((key, playing) => setNow({ key, playing })), []);
  useEffect(() => subscribePosition((at, dur) => setPos({ at, dur })), []);

  // The single-file player does not report the end of a file; close the bar
  // when the surah has played to its end.
  useEffect(() => {
    if (pos.dur > 0 && pos.at >= pos.dur - 400 && parseKey(getCurrentAudioKey())) stopAudio();
  }, [pos]);

  const current = parseKey(now.key);
  const active = !!current;

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
    return (
      <Pressable
        onPress={togglePlay}
        style={[styles.fab, { backgroundColor: palette.primary, bottom: insets.bottom + 16 }]}
        accessibilityLabel={`تلاوة ${surahName(surahToPlay)} بصوت ${reciter.nameAr}`}
      >
        <Ionicons name="play" size={26} color={palette.primaryText} />
      </Pressable>
    );
  }

  const progress = pos.dur > 0 ? Math.min(1, pos.at / pos.dur) : 0;

  return (
    <>
      <View style={[styles.bar, { backgroundColor: palette.surface, borderColor: palette.border, bottom: insets.bottom + 10 }]}>
        <View style={[styles.track, { backgroundColor: palette.surfaceAlt }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: palette.accent }]} />
        </View>
        <View style={styles.row}>
          <Pressable onPress={stopAudio} hitSlop={10} style={styles.btn}>
            <Ionicons name="close" size={22} color={palette.textMuted} />
          </Pressable>
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
      </View>

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
  fab: {
    position: 'absolute', left: 18, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  bar: {
    position: 'absolute', left: 12, right: 12, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
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
