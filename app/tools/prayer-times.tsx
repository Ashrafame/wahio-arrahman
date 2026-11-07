import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getCurrentCoords, Coords } from '../../src/lib/location';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { CALCULATION_METHODS, computePrayerTimes, DayPrayerTimes } from '../../src/lib/prayerTimes';
import { StringKey } from '../../src/i18n/translations';

const DAYS_AHEAD = 6;

type PrayerKey = keyof Omit<DayPrayerTimes, 'date'>;

// isPrayer=false → shown in the list but excluded from the "next prayer" countdown.
const PRAYER_META: { key: PrayerKey; labelKey: StringKey; icon: string; isPrayer: boolean }[] = [
  { key: 'fajr', labelKey: 'fajr', icon: 'cloudy-night-outline', isPrayer: true },
  { key: 'sunrise', labelKey: 'sunrise', icon: 'partly-sunny-outline', isPrayer: false },
  { key: 'dhuhr', labelKey: 'dhuhr', icon: 'sunny-outline', isPrayer: true },
  { key: 'asr', labelKey: 'asr', icon: 'sunny-outline', isPrayer: true },
  { key: 'maghrib', labelKey: 'maghrib', icon: 'cloudy-night-outline', isPrayer: true },
  { key: 'isha', labelKey: 'isha', icon: 'moon-outline', isPrayer: true },
];

export default function PrayerTimesScreen() {
  const { isRTL, t, language, calculationMethod, setCalculationMethod, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  // Tick every second to drive the live countdown.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadLocation = () => {
    setLoading(true);
    setError(null);
    getCurrentCoords()
      .then(setCoords)
      .catch(() => setError(t('locationDenied')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = useMemo(() => {
    if (!coords) return [];
    const result: DayPrayerTimes[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      result.push(computePrayerTimes(coords.latitude, coords.longitude, date, calculationMethod));
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, calculationMethod]);

  const methodName = CALCULATION_METHODS.find((m) => m.id === calculationMethod);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(language === 'ar' ? 'ar' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString(language === 'ar' ? 'ar' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatDayShort = (d: Date) =>
    d.toLocaleDateString(language === 'ar' ? 'ar' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  // Next actual prayer (fajr/dhuhr/asr/maghrib/isha), searching today then following days.
  const next = useMemo(() => {
    if (days.length === 0) return null;
    const prayerKeys = PRAYER_META.filter((p) => p.isPrayer);
    for (let d = 0; d < days.length; d++) {
      for (const p of prayerKeys) {
        const time = days[d][p.key];
        if (time.getTime() > now.getTime()) {
          return { key: p.key, labelKey: p.labelKey, icon: p.icon, time };
        }
      }
    }
    return null;
  }, [days, now]);

  const countdown = useMemo(() => {
    if (!next) return '';
    let ms = next.time.getTime() - now.getTime();
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [next, now]);

  const today = days[0];

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('prayerTimes')}</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} />
          <Text style={{ color: palette.textMuted, marginTop: 10 }}>{t('locating')}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: palette.textMuted, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
          <Pressable onPress={loadLocation} style={[styles.retryButton, { backgroundColor: palette.primary }]}>
            <Text style={{ color: palette.primaryText }}>{t('retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          {/* ── Hero: next prayer + live countdown ─────────────────── */}
          {next ? (
            <View style={[styles.hero, { backgroundColor: palette.primary }]}>
              <Text style={[styles.heroLabel, { color: palette.primaryText }]}>{t('nextPrayer')}</Text>
              <View style={[styles.heroPrayerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name={next.icon as any} size={30} color={palette.primaryText} />
                <Text style={[styles.heroPrayer, { color: palette.primaryText, fontFamily: isRTL ? 'Amiri-Bold' : undefined }]}>
                  {t(next.labelKey)}
                </Text>
              </View>
              <Text style={[styles.heroTime, { color: palette.primaryText }]}>{formatTime(next.time)}</Text>
              <View style={styles.heroCountWrap}>
                <Text style={[styles.heroCountLabel, { color: palette.primaryText }]}>{t('remainingTime')}</Text>
                <Text style={[styles.heroCount, { color: palette.primaryText }]}>{countdown}</Text>
              </View>
            </View>
          ) : null}

          {/* ── Method chip ────────────────────────────────────────── */}
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[styles.methodChip, { borderColor: palette.border, backgroundColor: palette.surface, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <Ionicons name="options-outline" size={15} color={palette.textMuted} />
            <Text style={{ color: palette.text, fontSize: scaleFont(12), flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              {methodName ? (isRTL ? methodName.nameAr : methodName.nameEn) : ''}
            </Text>
            <Ionicons name="chevron-down" size={14} color={palette.textMuted} />
          </Pressable>

          {/* ── Today's prayers ────────────────────────────────────── */}
          {today ? (
            <View style={[styles.todayCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.todayHeading, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(12) }]}>
                {t('today')} · {formatDate(today.date)}
              </Text>
              {PRAYER_META.map(({ key, labelKey, icon, isPrayer }, i) => {
                const time = today[key];
                const isNext = next?.key === key;
                const passed = time.getTime() < now.getTime() && !isNext;
                const accent = isNext ? palette.primary : palette.text;
                return (
                  <View
                    key={key}
                    style={[
                      styles.prayerRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row', borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: palette.border },
                      isNext && { backgroundColor: palette.primary + '14', borderRadius: 12 },
                    ]}
                  >
                    <Ionicons name={icon as any} size={19} color={isNext ? palette.primary : palette.textMuted} />
                    <Text
                      style={[
                        styles.prayerName,
                        { color: passed ? palette.textMuted : accent, fontSize: scaleFont(15), fontWeight: isNext ? '800' : '600', fontFamily: isRTL ? 'Cairo-Variable' : undefined },
                      ]}
                    >
                      {t(labelKey)}
                    </Text>
                    {isNext ? (
                      <View style={[styles.nextPill, { backgroundColor: palette.primary }]}>
                        <Text style={[styles.nextPillText, { color: palette.primaryText }]}>{t('nextPrayer')}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.prayerTime, { color: passed ? palette.textMuted : accent, fontSize: scaleFont(15), fontWeight: isNext ? '800' : '700' }]}>
                      {formatTime(time)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* ── Upcoming days ──────────────────────────────────────── */}
          {days.length > 1 ? (
            <>
              <Text style={[styles.sectionLabel, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(14) }]}>
                {t('comingDays')}
              </Text>
              {days.slice(1).map((day) => (
                <View key={day.date.toDateString()} style={[styles.dayCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Text style={[styles.dayTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(13) }]}>
                    {formatDayShort(day.date)}
                  </Text>
                  <View style={[styles.timesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {PRAYER_META.filter((p) => p.isPrayer).map(({ key, labelKey }) => (
                      <View key={key} style={styles.timeCell}>
                        <Text style={{ color: palette.textMuted, fontSize: scaleFont(10) }}>{t(labelKey)}</Text>
                        <Text style={{ color: palette.text, fontSize: scaleFont(12), fontWeight: '700', marginTop: 2 }}>
                          {formatTime(day[key])}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </ScrollView>
      )}

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('calculationMethod')}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {CALCULATION_METHODS.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => {
                    setCalculationMethod(method.id);
                    setPickerOpen(false);
                  }}
                  style={[
                    styles.modalRow,
                    {
                      backgroundColor: calculationMethod === method.id ? palette.surfaceAlt : 'transparent',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  {calculationMethod === method.id ? (
                    <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
                  ) : (
                    <View style={{ width: 18 }} />
                  )}
                  <Text style={{ color: palette.text, fontSize: scaleFont(14) }}>
                    {isRTL ? method.nameAr : method.nameEn}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  retryButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },

  hero: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroLabel: { fontSize: 13, fontWeight: '700', opacity: 0.85, letterSpacing: 0.5 },
  heroPrayerRow: { alignItems: 'center', gap: 10, marginTop: 8 },
  heroPrayer: { fontSize: 30, fontWeight: '800' },
  heroTime: { fontSize: 17, fontWeight: '600', opacity: 0.9, marginTop: 2 },
  heroCountWrap: { alignItems: 'center', marginTop: 14 },
  heroCountLabel: { fontSize: 12, opacity: 0.8 },
  heroCount: { fontSize: 34, fontWeight: '800', letterSpacing: 2, fontVariant: ['tabular-nums'], marginTop: 2 },

  methodChip: {
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  todayCard: { marginTop: 14, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  todayHeading: { fontWeight: '700', marginTop: 10, marginBottom: 4 },
  prayerRow: { alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 6 },
  prayerName: { flex: 1 },
  prayerTime: { fontVariant: ['tabular-nums'] },
  nextPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  nextPillText: { fontSize: 10, fontWeight: '800' },

  sectionLabel: { fontWeight: '800', marginTop: 22, marginBottom: 6 },
  dayCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 8 },
  dayTitle: { fontWeight: '700', marginBottom: 8 },
  timesRow: { flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  timeCell: { width: '30%', alignItems: 'center', paddingVertical: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  modalRow: { alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8 },
});
