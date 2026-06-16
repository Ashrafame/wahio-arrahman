import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../src/store/SettingsContext';
import { getPalette } from '../../../src/theme/colors';
import { AZKAR_CATEGORIES } from '../../../src/data/azkar';

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { isRTL, t, theme } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  const data = AZKAR_CATEGORIES.find((c) => c.id === category);

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <Text style={{ color: palette.text, margin: 16 }}>404</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t(data.titleKey)}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {data.items.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text
              style={[
                styles.text,
                { color: palette.text, fontFamily: 'Amiri-Regular', textAlign: 'right', writingDirection: 'rtl' },
              ]}
            >
              {item.textAr}
            </Text>
            {item.repeat > 1 ? (
              <Text style={[styles.repeat, { color: palette.accent }]}>
                {t('repeat')}: {item.repeat}
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
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  text: { fontSize: 20, lineHeight: 34 },
  repeat: { marginTop: 10, fontSize: 13, fontWeight: '700', textAlign: 'right' },
});
