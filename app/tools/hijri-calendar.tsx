import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import {
  gregorianToHijri,
  hijriToGregorian,
  daysInHijriMonth,
  HIJRI_MONTH_NAMES_AR,
  HIJRI_MONTH_NAMES_EN,
} from '../../src/lib/hijri';
import { HIJRI_EVENTS, HijriEvent } from '../../src/data/hijriEvents';

const GREG_MONTHS_AR = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
];
// Week starts Saturday. JS getDay(): 0=Sun..6=Sat → offset = (getDay()+1)%7
const DAY_LABELS_AR = ['س','ح','ن','ث','ر','خ','ج']; // Sat Sun Mon Tue Wed Thu Fri
const DAY_LABELS_EN = ['Sa','Su','Mo','Tu','We','Th','Fr'];

export default function HijriCalendarScreen() {
  const { isRTL, t, language, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const today = useMemo(() => new Date(), []);
  const hijriToday = useMemo(() => gregorianToHijri(today), [today]);

  const [viewYear, setViewYear] = useState(hijriToday.year);
  const [viewMonth, setViewMonth] = useState(hijriToday.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(hijriToday.day);
  const [modalEvent, setModalEvent] = useState<HijriEvent | null>(null);

  const monthNames = language === 'ar' ? HIJRI_MONTH_NAMES_AR : HIJRI_MONTH_NAMES_EN;
  const dayLabels = language === 'ar' ? DAY_LABELS_AR : DAY_LABELS_EN;

  const daysCount = useMemo(() => daysInHijriMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const firstDayOffset = useMemo(() => {
    const g = hijriToGregorian(viewYear, viewMonth, 1);
    return (g.getDay() + 1) % 7;
  }, [viewYear, viewMonth]);

  const monthEvents = useMemo(
    () => HIJRI_EVENTS.filter((e) => e.month === viewMonth),
    [viewMonth]
  );

  const selectedGregorian = useMemo(
    () => (selectedDay !== null ? hijriToGregorian(viewYear, viewMonth, selectedDay) : null),
    [viewYear, viewMonth, selectedDay]
  );

  const selectedDayEvent = useMemo(
    () => (selectedDay !== null ? (monthEvents.find((e) => e.day === selectedDay) ?? null) : null),
    [selectedDay, monthEvents]
  );

  const upcoming = useMemo(() => {
    return HIJRI_EVENTS.map((event) => {
      let gDate = hijriToGregorian(hijriToday.year, event.month, event.day);
      if (gDate < today) {
        gDate = hijriToGregorian(hijriToday.year + 1, event.month, event.day);
      }
      const daysLeft = Math.round((gDate.getTime() - today.getTime()) / 86400000);
      return { event, daysLeft };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [hijriToday, today]);

  const gridRows = useMemo(() => {
    const rows: (number | null)[][] = [];
    let row: (number | null)[] = Array(firstDayOffset).fill(null);
    for (let day = 1; day <= daysCount; day++) {
      row.push(day);
      if (row.length === 7) { rows.push(row); row = []; }
    }
    if (row.length > 0) {
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [firstDayOffset, daysCount]);

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setViewMonth(m);
    setViewYear(y);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setViewYear(hijriToday.year);
    setViewMonth(hijriToday.month);
    setSelectedDay(hijriToday.day);
  };

  const isToday = (day: number) =>
    day === hijriToday.day && viewMonth === hijriToday.month && viewYear === hijriToday.year;

  const formatGreg = (d: Date) => {
    if (language === 'ar') {
      return `${d.getDate()} ${GREG_MONTHS_AR[d.getMonth()]} ${d.getFullYear()}م`;
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('hijriCalendar')}</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Month navigation */}
        <View style={[styles.monthNav, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable onPress={() => navigateMonth(isRTL ? 1 : -1)} hitSlop={12} style={styles.navBtn}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.text} />
          </Pressable>
          <Pressable onPress={goToToday} style={{ alignItems: 'center' }}>
            <Text style={[styles.monthTitle, { color: palette.text, fontSize: scaleFont(16) }]}>
              {monthNames[viewMonth - 1]}
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: scaleFont(12) }}>{viewYear} هـ</Text>
          </Pressable>
          <Pressable onPress={() => navigateMonth(isRTL ? -1 : 1)} hitSlop={12} style={styles.navBtn}>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={24} color={palette.text} />
          </Pressable>
        </View>

        {/* Calendar grid */}
        <View style={[styles.calendarCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {/* Weekday headers */}
          <View style={[styles.weekRow, { borderBottomColor: palette.border }]}>
            {dayLabels.map((label, i) => (
              <View key={i} style={styles.weekCell}>
                <Text style={[styles.weekLabel, { color: i === 6 ? palette.accent : palette.textMuted, fontSize: scaleFont(11) }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          {/* Rows */}
          {gridRows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((day, ci) => {
                if (day === null) return <View key={ci} style={styles.dayCell} />;
                const todayCell = isToday(day);
                const sel = selectedDay === day;
                const hasEv = monthEvents.some((e) => e.day === day);
                return (
                  <Pressable
                    key={ci}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.dayCell,
                      todayCell && { backgroundColor: palette.primary, borderRadius: 8 },
                      sel && !todayCell && { backgroundColor: palette.accent + '30', borderRadius: 8 },
                    ]}
                  >
                    <Text style={[
                      styles.dayNum,
                      { fontSize: scaleFont(13) },
                      { color: todayCell ? palette.primaryText : sel ? palette.accent : palette.text },
                    ]}>
                      {day}
                    </Text>
                    {hasEv && (
                      <View style={[styles.eventDot, { backgroundColor: todayCell ? palette.primaryText : palette.accent }]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Selected day info */}
        {selectedDay !== null && selectedGregorian !== null && (
          <View style={[styles.infoCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[{ color: palette.text, fontFamily: 'Amiri-Bold', fontSize: scaleFont(19) }]}>
              {selectedDay} {monthNames[viewMonth - 1]} {viewYear} هـ
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: scaleFont(13), marginTop: 4 }}>
              {formatGreg(selectedGregorian)}
            </Text>
            {selectedDayEvent !== null && (
              <Pressable
                onPress={() => setModalEvent(selectedDayEvent)}
                style={[styles.eventTag, { backgroundColor: palette.accent + '18', borderColor: palette.accent + '44' }]}
              >
                <Ionicons name="star" size={12} color={palette.accent} />
                <Text style={{ color: palette.accent, fontSize: scaleFont(12), fontWeight: '600', marginStart: 4 }}>
                  {language === 'ar' ? selectedDayEvent.titleAr : selectedDayEvent.titleEn}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Today's dates */}
        <View style={[styles.todayCard, { backgroundColor: palette.primary + '12', borderColor: palette.primary + '44' }]}>
          <Ionicons name="today-outline" size={18} color={palette.primary} style={{ marginBottom: 4 }} />
          <Text style={{ color: palette.textMuted, fontSize: scaleFont(11) }}>{t('hijriToday')}</Text>
          <Text style={{ color: palette.text, fontFamily: 'Amiri-Bold', fontSize: scaleFont(16), marginTop: 3 }}>
            {hijriToday.day} {(language === 'ar' ? HIJRI_MONTH_NAMES_AR : HIJRI_MONTH_NAMES_EN)[hijriToday.month - 1]} {hijriToday.year} هـ
          </Text>
          <Text style={{ color: palette.textMuted, fontSize: scaleFont(12), marginTop: 2 }}>
            {formatGreg(today)}
          </Text>
        </View>

        {/* Upcoming occasions */}
        <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(14) }]}>
          {t('upcomingOccasions')}
        </Text>

        {upcoming.map(({ event, daysLeft }) => (
          <Pressable
            key={`${event.month}-${event.day}`}
            onPress={() => setModalEvent(event)}
            style={[styles.eventCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.eventTitle, { color: palette.text, fontSize: scaleFont(14), flex: 1 }]}>
                {language === 'ar' ? event.titleAr : event.titleEn}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginStart: 8 }}>
                <Text style={{ color: palette.accent, fontSize: scaleFont(11), fontWeight: '700' }}>
                  {daysLeft === 0 ? t('today') : `${daysLeft} ${t('days')}`}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={palette.textMuted} />
              </View>
            </View>
            {(language === 'ar' ? event.noteAr : event.noteEn) && (
              <Text style={{ color: palette.textMuted, fontSize: scaleFont(11), marginTop: 5, textAlign: isRTL ? 'right' : 'left' }}>
                {language === 'ar' ? event.noteAr : event.noteEn}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Event detail modal */}
      <Modal visible={!!modalEvent} transparent animationType="fade" onRequestClose={() => setModalEvent(null)}>
        <Pressable style={styles.backdrop} onPress={() => setModalEvent(null)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.surface }]} onPress={() => {}}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginEnd: 10 }}>
                <Text style={[styles.modalTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(17) }]}>
                  {language === 'ar' ? modalEvent?.titleAr : modalEvent?.titleEn}
                </Text>
                <Text style={{ color: palette.textMuted, fontSize: scaleFont(11), textAlign: isRTL ? 'right' : 'left', marginTop: 2 }}>
                  {language === 'ar' ? modalEvent?.titleEn : modalEvent?.titleAr}
                </Text>
              </View>
              <Pressable onPress={() => setModalEvent(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={26} color={palette.textMuted} />
              </Pressable>
            </View>
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalDesc, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(14), lineHeight: scaleFont(26) }]}>
                {language === 'ar' ? modalEvent?.descriptionAr : modalEvent?.descriptionEn}
              </Text>
            </ScrollView>
            {(language === 'ar' ? modalEvent?.noteAr : modalEvent?.noteEn) && (
              <View style={[styles.noteBox, { backgroundColor: palette.accent + '15', borderColor: palette.accent + '44' }]}>
                <Text style={{ color: palette.accent, fontSize: scaleFont(12), textAlign: isRTL ? 'right' : 'left' }}>
                  {language === 'ar' ? modalEvent?.noteAr : modalEvent?.noteEn}
                </Text>
              </View>
            )}
          </Pressable>
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
  scroll: { padding: 16, gap: 14 },
  monthNav: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  navBtn: { padding: 8 },
  monthTitle: { fontWeight: '700' },
  calendarCard: { borderWidth: 1, borderRadius: 16 },
  weekRow: { flexDirection: 'row', borderBottomWidth: 1 },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  weekLabel: { fontWeight: '700' },
  gridRow: { flexDirection: 'row' },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontWeight: '500' },
  eventDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  infoCard: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  eventTag: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 8 },
  todayCard: { borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  sectionTitle: { fontWeight: '700' },
  eventCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  eventTitle: { fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 20, padding: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  modalTitle: { fontWeight: '700', lineHeight: 26 },
  divider: { height: 1, marginVertical: 14 },
  modalDesc: {},
  noteBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12 },
});
