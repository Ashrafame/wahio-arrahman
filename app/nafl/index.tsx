import React, { useMemo } from 'react';
import { SectionList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { NAFL_SECTIONS, RULING_META, PrayerRuling, NaflPrayer } from '../../src/data/naflPrayers';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';

// Distinct accent per ruling so the "weight" of each prayer reads at a glance.
const RULING_COLOR: Record<PrayerRuling, string> = {
  fard_ayn: '#B23A48',
  fard_kifayah: '#2E5A88',
  sunnah_muakkadah: '#1F7A5A',
  sunnah: '#9A6A1C',
};

interface Section {
  id: string;
  title: string;
  icon: string;
  intro?: string;
  data: NaflPrayer[];
}

export default function NaflIndexScreen() {
  const { isRTL, t, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const sections = useMemo<Section[]>(
    () =>
      NAFL_SECTIONS.map((s) => ({
        id: s.id,
        title: isRTL ? s.title : s.titleEn,
        icon: s.icon,
        intro: isRTL ? s.intro : s.introEn,
        data: s.prayers,
      })),
    [isRTL]
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('naflPrayers')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrap}>
            <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons name={section.icon as any} size={18} color={palette.primary} />
              <Text style={[styles.sectionTitle, { color: palette.text, fontFamily: isRTL ? 'Cairo-Variable' : undefined }]}>
                {section.title}
              </Text>
            </View>
            {section.intro ? (
              <Text style={[styles.sectionIntro, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(12) }]}>
                {section.intro}
              </Text>
            ) : null}
          </View>
        )}
        renderItem={({ item }) => {
          const color = RULING_COLOR[item.ruling];
          return (
            <Pressable
              onPress={() => router.push(`/nafl/${item.id}`)}
              style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.rulingDot, { backgroundColor: color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.prayerName, { color: palette.text, textAlign: isRTL ? 'right' : 'left', fontSize: scaleFont(15), fontFamily: isRTL ? 'Cairo-Variable' : undefined }]}>
                  {isRTL ? item.name : item.nameEn}
                </Text>
                <View style={[styles.badge, { backgroundColor: color + '1E', borderColor: color + '55', alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.badgeText, { color }]}>
                    {isRTL ? RULING_META[item.ruling].ar : RULING_META[item.ruling].en}
                  </Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={palette.textMuted} />
            </Pressable>
          );
        }}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  sectionHeaderWrap: { marginTop: 18, marginBottom: 8 },
  sectionHeader: { alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionIntro: { marginTop: 4, lineHeight: 18 },
  row: {
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  rulingDot: { width: 10, height: 10, borderRadius: 5 },
  prayerName: { fontWeight: '700' },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
