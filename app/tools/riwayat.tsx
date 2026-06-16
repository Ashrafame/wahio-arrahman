import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { FEATURED_RIWAYAT, OTHER_NARRATIONS_AR, OTHER_NARRATIONS_EN } from '../../src/data/riwayat';

export default function RiwayatScreen() {
  const { isRTL, t, theme } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();
  const otherList = isRTL ? OTHER_NARRATIONS_AR : OTHER_NARRATIONS_EN;

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('riwayat')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {FEATURED_RIWAYAT.map((riwayah) => (
          <View key={riwayah.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.cardTitle, { color: palette.primary, textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? riwayah.titleAr : riwayah.titleEn}
            </Text>
            <Section label={isRTL ? 'سند الرواية' : 'Chain of transmission'} isRTL={isRTL} palette={palette}>
              {isRTL ? riwayah.chainAr : riwayah.chainEn}
            </Section>
            <Section label={isRTL ? 'انتشارها' : 'Geographic spread'} isRTL={isRTL} palette={palette}>
              {isRTL ? riwayah.originAr : riwayah.originEn}
            </Section>
            <Section label={isRTL ? 'سبب التسمية' : 'Naming'} isRTL={isRTL} palette={palette}>
              {isRTL ? riwayah.namingAr : riwayah.namingEn}
            </Section>
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.cardTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('otherNarrations')}
          </Text>
          {otherList.map((line, index) => (
            <Text
              key={index}
              style={[styles.listItem, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' }]}
            >
              {'• '}
              {line}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Section({
  label,
  children,
  isRTL,
  palette,
}: {
  label: string;
  children: string;
  isRTL: boolean;
  palette: ReturnType<typeof getPalette>;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: palette.accent, fontSize: 12, fontWeight: '700', textAlign: isRTL ? 'right' : 'left' }}>
        {label}
      </Text>
      <Text style={{ color: palette.text, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  listItem: { fontSize: 13, lineHeight: 22, marginTop: 6 },
});
