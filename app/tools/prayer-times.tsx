import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { getCurrentCoords, Coords } from '../../src/lib/location';
import { CALCULATION_METHODS, computePrayerTimes, DayPrayerTimes } from '../../src/lib/prayerTimes';
import { StringKey } from '../../src/i18n/translations';

const DAYS_AHEAD = 6;

const PRAYER_KEYS: { key: keyof Omit<DayPrayerTimes, 'date'>; labelKey: StringKey }[] = [
  { key: 'fajr', labelKey: 'fajr' },
  { key: 'sunrise', labelKey: 'sunrise' },
  { key: 'dhuhr', labelKey: 'dhuhr' },
  { key: 'asr', labelKey: 'asr' },
  { key: 'maghrib', labelKey: 'maghrib' },
  { key: 'isha', labelKey: 'isha' },
];

export default function PrayerTimesScreen() {
  const { isRTL, t, theme, language, calculationMethod, setCalculationMethod } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

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
  }, [coords, calculationMethod]);

  const methodName = CALCULATION_METHODS.find((m) => m.id === calculationMethod);

  const formatTime = (d: Date) => d.toLocaleTimeString(language === 'ar' ? 'ar' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString(language === 'ar' ? 'ar' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('prayerTimes')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <Pressable
        onPress={() => setPickerOpen(true)}
        style={[styles.methodChip, { borderColor: palette.border, backgroundColor: palette.surface }]}
      >
        <Ionicons name="options-outline" size={16} color={palette.textMuted} />
        <Text style={{ color: palette.text, fontSize: 13 }}>
          {methodName ? (isRTL ? methodName.nameAr : methodName.nameEn) : ''}
        </Text>
      </Pressable>

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
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          {days.map((day, index) => (
            <View key={day.date.toDateString()} style={[styles.dayCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.dayTitle, { color: palette.text }]}>
                {index === 0 ? t('today') : formatDate(day.date)}
              </Text>
              <View style={[styles.timesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {PRAYER_KEYS.map(({ key, labelKey }) => (
                  <View key={key} style={styles.timeCell}>
                    <Text style={{ color: palette.textMuted, fontSize: 11 }}>{t(labelKey)}</Text>
                    <Text style={{ color: palette.text, fontSize: 13, fontWeight: '700' }}>
                      {formatTime(day[key])}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
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
                  <Text style={{ color: palette.text, fontSize: 14 }}>
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
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  retryButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  dayCard: { borderWidth: 1, borderRadius: 14, padding: 12 },
  dayTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  timesRow: { flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  timeCell: { width: '30%', alignItems: 'center', paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  modalRow: { alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8 },
});
