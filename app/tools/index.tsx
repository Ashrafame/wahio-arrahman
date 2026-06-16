import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { StringKey } from '../../src/i18n/translations';

const TOOLS: { titleKey: StringKey; icon: keyof typeof Ionicons.glyphMap; route: string; color: string }[] = [
  { titleKey: 'prayerTimes', icon: 'time-outline', route: '/tools/prayer-times', color: '#0F6B5C' },
  { titleKey: 'qibla', icon: 'compass-outline', route: '/tools/qibla', color: '#2E4374' },
  { titleKey: 'tasbih', icon: 'finger-print-outline', route: '/tools/tasbih', color: '#B07D2B' },
  { titleKey: 'azkar', icon: 'book-outline', route: '/tools/azkar', color: '#0F4C3A' },
  { titleKey: 'hijriCalendar', icon: 'calendar-outline', route: '/tools/hijri-calendar', color: '#7A2E3A' },
  { titleKey: 'riwayat', icon: 'mic-outline', route: '/tools/riwayat', color: '#3D5A6C' },
];

export default function ToolsScreen() {
  const { isRTL, t, theme, scaleFont } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('tools')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.grid}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.route}
            onPress={() => router.push(tool.route as any)}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name={tool.icon} size={32} color={tool.color} />
            <Text style={[styles.cardLabel, { color: palette.text, fontSize: scaleFont(14) }]}>{t(tool.titleKey)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 14,
  },
  card: {
    width: '46%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardLabel: { fontSize: 14, fontWeight: '600' },
});
