import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { StringKey } from '../../src/i18n/translations';

type ToolItem = {
  titleKey: StringKey;
  route: string;
  color: string;
} & (
  | { image: ImageSourcePropType; icon?: never }
  | { icon: keyof typeof Ionicons.glyphMap; image?: never }
);

const TOOLS: ToolItem[] = [
  { titleKey: 'prayerTimes', image: require('../../assets/icons/prayer_times.png'), route: '/tools/prayer-times', color: '#0F6B5C' },
  { titleKey: 'qibla', image: require('../../assets/icons/qibla.png'), route: '/tools/qibla', color: '#2E4374' },
  { titleKey: 'tasbih', image: require('../../assets/icons/tasbih.png'), route: '/tools/tasbih', color: '#B07D2B' },
  { titleKey: 'azkar', image: require('../../assets/icons/azkar.png'), route: '/tools/azkar', color: '#0F4C3A' },
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
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.route}
            onPress={() => router.push(tool.route as any)}
            style={styles.card}
          >
            {tool.image ? (
              <Image source={tool.image} style={[styles.toolImage, { tintColor: tool.color }]} />
            ) : (
              <Ionicons name={tool.icon!} size={40} color={tool.color} />
            )}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  toolImage: { width: 48, height: 48 },
  cardLabel: { fontSize: 14, fontWeight: '600' },
});
