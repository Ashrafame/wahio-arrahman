import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getNaflPrayer, RULING_META, PrayerRuling } from '../../src/data/naflPrayers';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';

const RULING_COLOR: Record<PrayerRuling, string> = {
  fard_ayn: '#B23A48',
  fard_kifayah: '#2E5A88',
  sunnah_muakkadah: '#1F7A5A',
  sunnah: '#9A6A1C',
};

export default function NaflDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isRTL, t, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const found = getNaflPrayer(id ?? '');
  if (!found) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <Text style={{ color: palette.text, margin: 16 }}>404</Text>
      </View>
    );
  }
  const { prayer } = found;
  const color = RULING_COLOR[prayer.ruling];
  const align = isRTL ? 'right' : 'left';
  const arFont = isRTL ? 'Cairo-Variable' : undefined;

  const Block = ({ icon, label, body }: { icon: string; label: string; body: string }) => (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={[styles.cardHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
        <Text style={[styles.cardLabel, { color, fontFamily: arFont }]}>{label}</Text>
      </View>
      <Text style={[styles.cardBody, { color: palette.text, textAlign: align, writingDirection: isRTL ? 'rtl' : 'ltr', fontFamily: arFont, fontSize: scaleFont(15), lineHeight: scaleFont(15) * 1.85 }]}>
        {body}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]} numberOfLines={1}>
          {isRTL ? prayer.name : prayer.nameEn}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Title + ruling badge */}
        <View style={[styles.titleBlock, { backgroundColor: color + '14', borderColor: color + '44' }]}>
          <Text style={[styles.title, { color: palette.text, textAlign: 'center', fontFamily: isRTL ? 'Amiri-Bold' : undefined, fontSize: scaleFont(22) }]}>
            {isRTL ? prayer.name : prayer.nameEn}
          </Text>
          <View style={[styles.badge, { backgroundColor: color, alignSelf: 'center' }]}>
            <Text style={styles.badgeText}>{isRTL ? RULING_META[prayer.ruling].ar : RULING_META[prayer.ruling].en}</Text>
          </View>
          {prayer.rakaat ? (
            <Text style={[styles.rakaat, { color: palette.textMuted, fontFamily: arFont, fontSize: scaleFont(13) }]}>
              {isRTL ? prayer.rakaat : prayer.rakaatEn}
            </Text>
          ) : null}
        </View>

        <Block icon="body-outline" label={t('naflHow')} body={isRTL ? prayer.how : prayer.howEn} />
        <Block icon="book-outline" label={t('naflEvidence')} body={isRTL ? prayer.evidence : prayer.evidenceEn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  titleBlock: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center', gap: 8, marginBottom: 16 },
  title: { fontWeight: '800' },
  badge: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  rakaat: { marginTop: 2, fontWeight: '600' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  cardHead: { alignItems: 'center', gap: 8, marginBottom: 10 },
  cardLabel: { fontSize: 14, fontWeight: '800' },
  cardBody: {},
});
