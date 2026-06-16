import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../../src/store/SettingsContext';
import { getPalette } from '../../../src/theme/colors';
import { AZKAR_CATEGORIES } from '../../../src/data/azkar';

export default function AzkarIndexScreen() {
  const { isRTL, t, theme } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('azkar')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={AZKAR_CATEGORIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/tools/azkar/${item.id}`)}
            style={[
              styles.row,
              { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Ionicons name={item.icon as any} size={20} color={palette.primary} />
            <Text style={{ color: palette.text, fontSize: 15, flex: 1 }}>{t(item.titleKey)}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={palette.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  row: {
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
