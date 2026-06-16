import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { gregorianToHijri, hijriToGregorian, HIJRI_MONTH_NAMES_AR, HIJRI_MONTH_NAMES_EN } from '../../src/lib/hijri';
import { HIJRI_EVENTS } from '../../src/data/hijriEvents';

export default function HijriCalendarScreen() {
  const { isRTL, t, theme, language, scaleFont } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  const today = useMemo(() => new Date(), []);
  const hijriToday = useMemo(() => gregorianToHijri(today), [today]);

  const upcoming = useMemo(() => {
    const items = HIJRI_EVENTS.map((event) => {
      let gDate = hijriToGregorian(hijriToday.year, event.month, event.day);
      if (gDate < today) {
        gDate = hijriToGregorian(hijriToday.year + 1, event.month, event.day);
      }
      const daysRemaining = Math.round((gDate.getTime() - today.getTime()) / 86400000);
      return { event, gDate, daysRemaining };
    });
    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [hijriToday, today]);

  const monthNames = language === 'ar' ? HIJRI_MONTH_NAMES_AR : HIJRI_MONTH_NAMES_EN;
  const formatNumber = (n: number) => String(n);

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('hijriCalendar')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={[styles.todayCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={{ color: palette.textMuted, fontSize: scaleFont(12) }}>{t('hijriToday')}</Text>
          <Text style={[styles.todayDate, { color: palette.text, fontFamily: 'Amiri-Bold', fontSize: scaleFont(22) }]}>
            {formatNumber(hijriToday.day)} {monthNames[hijriToday.month - 1]} {formatNumber(hijriToday.year)} هـ
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(14) }]}>
          {t('upcomingOccasions')}
        </Text>

        {upcoming.map(({ event, daysRemaining }) => (
          <View
            key={`${event.month}-${event.day}`}
            style={[styles.eventCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={[styles.eventRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.eventTitle, { color: palette.text, fontSize: scaleFont(14) }]}>
                {isRTL ? event.titleAr : event.titleEn}
              </Text>
              <Text style={{ color: palette.accent, fontSize: scaleFont(12), fontWeight: '700' }}>
                {daysRemaining === 0 ? t('today') : `${formatNumber(daysRemaining)} ${t('days')} ${t('daysRemaining')}`}
              </Text>
            </View>
            {(isRTL ? event.noteAr : event.noteEn) ? (
              <Text style={{ color: palette.textMuted, fontSize: scaleFont(12), marginTop: 6, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? event.noteAr : event.noteEn}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  todayCard: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  todayDate: { fontSize: 22, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  eventCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  eventRow: { justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
