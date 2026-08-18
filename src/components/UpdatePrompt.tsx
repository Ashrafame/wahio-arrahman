import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../store/SettingsContext';
import { checkForAppUpdate, UpdateInfo } from '../lib/appUpdate';

const SKIP_KEY = 'update_skipped_version';

/**
 * Checks for a newer store/manifest version on launch and when the app returns
 * to the foreground, and shows a gentle, dismissible prompt. A non-mandatory
 * version the user dismisses is remembered so we don't nag; a mandatory update
 * cannot be dismissed. Renders nothing until an update is found.
 */
export function UpdatePrompt() {
  const { t, palette, isRTL } = useSettings();
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const lastCheck = useRef(0);

  const run = async () => {
    // Throttle to at most once every 6 hours of foreground activity.
    const now = Date.now();
    if (now - lastCheck.current < 6 * 60 * 60 * 1000) return;
    lastCheck.current = now;
    const found = await checkForAppUpdate();
    if (!found) return;
    if (!found.mandatory) {
      const skipped = await AsyncStorage.getItem(SKIP_KEY);
      if (skipped === found.latestVersion) return;
    }
    setInfo(found);
  };

  useEffect(() => {
    run();
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') run();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!info) return null;

  const openStore = () => {
    if (info.url) Linking.openURL(info.url).catch(() => {});
    if (!info.mandatory) setInfo(null);
  };

  const later = async () => {
    await AsyncStorage.setItem(SKIP_KEY, info.latestVersion);
    setInfo(null);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={info.mandatory ? undefined : later}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: palette.primary + '1A' }]}>
            <Ionicons name="rocket-outline" size={30} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text, fontFamily: isRTL ? 'Cairo-Variable' : undefined }]}>
            {t('updateTitle')}
          </Text>
          <Text style={[styles.body, { color: palette.textMuted, textAlign: 'center' }]}>
            {info.notes && info.notes.trim().length ? info.notes : t('updateBody')}
          </Text>
          {info.mandatory ? (
            <Text style={[styles.mandatory, { color: palette.primary }]}>{t('updateMandatory')}</Text>
          ) : null}
          <Pressable onPress={openStore} style={[styles.primaryBtn, { backgroundColor: palette.primary }]}>
            <Text style={[styles.primaryBtnText, { color: palette.primaryText }]}>{t('updateNow')}</Text>
          </Pressable>
          {!info.mandatory ? (
            <Pressable onPress={later} style={styles.laterBtn}>
              <Text style={{ color: palette.textMuted, fontSize: 14 }}>{t('updateLater')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { width: '100%', maxWidth: 360, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center' },
  iconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 21, marginBottom: 6 },
  mandatory: { fontSize: 13, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  primaryBtn: { marginTop: 18, alignSelf: 'stretch', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '800' },
  laterBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 16 },
});
