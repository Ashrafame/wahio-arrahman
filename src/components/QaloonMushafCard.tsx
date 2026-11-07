import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../store/SettingsContext';
import {
  DownloadState,
  QALOON_DOWNLOAD_MB,
  QALOON_MUSHAF_SOURCE,
  QALOON_PAGE_COUNT,
  cancelDownload,
  deleteDownloadedMushaf,
  downloadWholeMushaf,
  getDownloadState,
  onDownloadChange,
} from '../lib/qaloonMushaf';

/** Settings card: open the Libyan Awqaf Qaloon Mushaf and manage its offline copy. */
export function QaloonMushafCard() {
  const { palette } = useSettings();
  const [dl, setDl] = useState<DownloadState>(() => getDownloadState());

  useEffect(() => onDownloadChange(setDl), []);

  const complete = !dl.running && dl.done >= QALOON_PAGE_COUNT;
  const percent = Math.round((dl.done / QALOON_PAGE_COUNT) * 100);

  const confirmDelete = () =>
    Alert.alert('حذف المصحف من الجهاز', 'ستُحذف الصفحات المحفوظة، ويمكنك تنزيلها مرة أخرى في أي وقت.', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => { deleteDownloadedMushaf(); setDl(getDownloadState()); } },
    ]);

  return (
    <View style={{ gap: 10 }}>
      <Pressable
        onPress={() => router.push('/mushaf/qaloon')}
        style={[styles.row, { backgroundColor: palette.primary }]}
      >
        <Ionicons name="book" size={20} color={palette.primaryText} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.primaryText }]}>{QALOON_MUSHAF_SOURCE.nameAr}</Text>
          <Text style={[styles.sub, { color: palette.primaryText }]}>تصفّح صفحات المصحف كما طُبع</Text>
        </View>
        <Ionicons name="chevron-back" size={18} color={palette.primaryText} />
      </Pressable>

      <View style={[styles.box, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={styles.boxHead}>
          <Ionicons
            name={complete ? 'checkmark-circle' : 'cloud-download-outline'}
            size={28}
            color={complete ? palette.primary : palette.accent}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: palette.text }]}>
              {complete ? 'المصحف محفوظ على جهازك' : 'تنزيل المصحف كاملاً للقراءة دون إنترنت'}
            </Text>
            <Text style={[styles.sub, { color: palette.textMuted }]}>
              {complete
                ? `${QALOON_PAGE_COUNT} صفحة · يعمل دون إنترنت`
                : `${QALOON_PAGE_COUNT} صفحة · نحو ${QALOON_DOWNLOAD_MB} ميغابايت · ${dl.done ? `محفوظ ${dl.done} صفحة` : 'تُنزَّل الصفحات عادةً عند فتحها'}`}
            </Text>
          </View>
        </View>

        {dl.running || (dl.done > 0 && !complete) ? (
          <View style={[styles.track, { backgroundColor: palette.surfaceAlt }]}>
            <View style={[styles.fillBar, { width: `${percent}%`, backgroundColor: palette.accent }]} />
          </View>
        ) : null}
        {dl.error ? (
          <Text style={[styles.sub, { color: '#C62828' }]}>
            تعذّر تنزيل {dl.error} صفحة. تحقق من الاتصال ثم أعد المحاولة.
          </Text>
        ) : null}

        <View style={styles.actions}>
          {dl.running ? (
            <Pressable onPress={cancelDownload} style={[styles.btn, { borderColor: palette.border }]}>
              <Ionicons name="pause" size={16} color={palette.text} />
              <Text style={{ color: palette.text, fontWeight: '700' }}>إيقاف ({percent}%)</Text>
            </Pressable>
          ) : !complete ? (
            <Pressable onPress={() => downloadWholeMushaf()} style={[styles.btn, { backgroundColor: palette.accent, borderColor: palette.accent }]}>
              <Ionicons name="cloud-download" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{dl.done ? 'متابعة التنزيل' : 'تنزيل المصحف كاملاً'}</Text>
            </Pressable>
          ) : null}
          {!dl.running && dl.done > 0 ? (
            <Pressable onPress={confirmDelete} style={[styles.btn, { borderColor: palette.border }]}>
              <Ionicons name="trash-outline" size={16} color={palette.textMuted} />
              <Text style={{ color: palette.textMuted, fontWeight: '700' }}>حذف من الجهاز</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  box: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  boxHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  title: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  sub: { fontSize: 12, marginTop: 2, textAlign: 'right' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fillBar: { height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  btn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
});
