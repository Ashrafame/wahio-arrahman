import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { TASBIH_LIST } from '../../src/data/tasbihList';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';

const STORAGE_KEY = 'wahio-arrahman:tasbih';

interface TasbihState {
  counts: Record<string, number>;
  targets: Record<string, number>;
}

export default function TasbihScreen() {
  const { isRTL, t, theme, scaleFont } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  const [activeId, setActiveId] = useState(TASBIH_LIST[0].id);
  const [state, setState] = useState<TasbihState>({ counts: {}, targets: {} });
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');
  const [dhikrPickerOpen, setDhikrPickerOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setState(JSON.parse(stored));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const active = TASBIH_LIST.find((d) => d.id === activeId)!;
  const count = state.counts[activeId] ?? 0;
  const target = state.targets[activeId] ?? active.defaultTarget;
  const reachedTarget = count > 0 && count % target === 0;

  const increment = () => {
    setState((s) => ({ ...s, counts: { ...s.counts, [activeId]: (s.counts[activeId] ?? 0) + 1 } }));
  };

  const reset = () => {
    setState((s) => ({ ...s, counts: { ...s.counts, [activeId]: 0 } }));
  };

  const saveCustomTarget = () => {
    const n = parseInt(customTargetInput, 10);
    if (n > 0) {
      setState((s) => ({ ...s, targets: { ...s.targets, [activeId]: n } }));
    }
    setCustomizeOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('tasbih')}</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => setDhikrPickerOpen(true)}
        style={[
          styles.dhikrSelector,
          { borderColor: palette.border, backgroundColor: palette.surface, flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <Text style={{ color: palette.text, fontSize: scaleFont(14), fontWeight: '700', flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
          {isRTL ? active.textAr : active.textEn}
        </Text>
        <Ionicons name="chevron-expand" size={18} color={palette.textMuted} />
      </Pressable>

      <Pressable onPress={increment} style={styles.counterArea}>
        <Text style={[styles.dhikrText, { color: palette.text, fontFamily: 'Amiri-Bold', fontSize: scaleFont(26) }]}>
          {isRTL ? active.textAr : active.textEn}
        </Text>
        <Text style={[styles.countText, { color: palette.primary }]}>{count}</Text>
        <Text style={{ color: palette.textMuted, fontSize: scaleFont(13) }}>
          {t('tasbihTarget')}: {target}
        </Text>
        {reachedTarget ? (
          <Text style={{ color: palette.accent, fontSize: scaleFont(14), fontWeight: '700', marginTop: 6 }}>
            {t('reachedTarget')}
          </Text>
        ) : null}
      </Pressable>

      <View style={[styles.actionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable
          onPress={reset}
          style={[styles.actionButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
        >
          <Ionicons name="refresh" size={16} color={palette.textMuted} />
          <Text style={{ color: palette.text, fontSize: scaleFont(14) }}>{t('tasbihReset')}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setCustomTargetInput(String(target));
            setCustomizeOpen(true);
          }}
          style={[styles.actionButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
        >
          <Ionicons name="create-outline" size={16} color={palette.textMuted} />
          <Text style={{ color: palette.text, fontSize: scaleFont(14) }}>{t('tasbihCustomTarget')}</Text>
        </Pressable>
      </View>

      <Modal visible={customizeOpen} transparent animationType="fade" onRequestClose={() => setCustomizeOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCustomizeOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('setCustomTarget')}</Text>
            <TextInput
              value={customTargetInput}
              onChangeText={setCustomTargetInput}
              keyboardType="number-pad"
              style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            />
            <Pressable onPress={saveCustomTarget} style={[styles.saveButton, { backgroundColor: palette.primary }]}>
              <Text style={{ color: palette.primaryText, fontWeight: '700' }}>{t('save')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={dhikrPickerOpen} transparent animationType="fade" onRequestClose={() => setDhikrPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDhikrPickerOpen(false)}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('tasbih')}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {TASBIH_LIST.map((dhikr) => (
                <Pressable
                  key={dhikr.id}
                  onPress={() => {
                    setActiveId(dhikr.id);
                    setDhikrPickerOpen(false);
                  }}
                  style={[
                    styles.modalRow,
                    {
                      backgroundColor: activeId === dhikr.id ? palette.surfaceAlt : 'transparent',
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  {activeId === dhikr.id ? (
                    <Ionicons name="checkmark-circle" size={18} color={palette.primary} />
                  ) : (
                    <View style={{ width: 18 }} />
                  )}
                  <Text style={{ color: palette.text, fontSize: scaleFont(15), flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    {isRTL ? dhikr.textAr : dhikr.textEn}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
  dhikrSelector: {
    alignItems: 'center',
    gap: 8,
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  counterArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dhikrText: { fontSize: 26, textAlign: 'center', marginBottom: 20 },
  countText: { fontSize: 64, fontWeight: '800' },
  actionsRow: { justifyContent: 'center', gap: 12, paddingBottom: 24 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 12 },
  saveButton: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  modalRow: { alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8 },
});
