import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../src/store/SettingsContext';
import { getPalette } from '../../src/theme/colors';
import { getCurrentCoords } from '../../src/lib/location';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { computeQiblaBearing } from '../../src/lib/prayerTimes';

export default function QiblaScreen() {
  const { isRTL, t, theme, scaleFont } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const coords = await getCurrentCoords();
        if (cancelled) return;
        setQiblaBearing(computeQiblaBearing(coords.latitude, coords.longitude));

        try {
          const sub = await Location.watchHeadingAsync((h) => {
            setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
          });
          subscriptionRef.current = sub;
        } catch {
          setCompassSupported(false);
        }
      } catch {
        if (!cancelled) setError(t('locationDenied'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      try {
        subscriptionRef.current?.remove();
      } catch {
        // expo-location's web heading-watcher cleanup can throw; safe to ignore.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arrowRotation = heading !== null && qiblaBearing !== null ? qiblaBearing - heading : qiblaBearing ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('qibla')}</Text>
        <Pressable onPress={() => router.push('/settings')} style={styles.iconButton} hitSlop={8}>
          <Ionicons name="settings-outline" size={22} color={palette.primaryText} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} />
          <Text style={{ color: palette.textMuted, marginTop: 10 }}>{t('locating')}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: palette.textMuted, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <View style={[styles.compassRing, { borderColor: palette.border }]}>
            <View style={{ transform: [{ rotate: `${arrowRotation}deg` }] }}>
              <Ionicons name="navigate" size={90} color={palette.primary} />
            </View>
          </View>

          {!compassSupported ? (
            <Text style={[styles.notice, { color: palette.textMuted, fontSize: scaleFont(13) }]}>{t('qiblaCompassUnsupported')}</Text>
          ) : (
            <Text style={[styles.notice, { color: palette.textMuted, fontSize: scaleFont(13) }]}>{t('qiblaInstructions')}</Text>
          )}

          {qiblaBearing !== null ? (
            <Text style={{ color: palette.text, fontSize: scaleFont(15), fontWeight: '700', marginTop: 8 }}>
              {t('qiblaBearingLabel')}: {Math.round(qiblaBearing)}°
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  compassRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  notice: { textAlign: 'center', fontSize: 13, lineHeight: 20, paddingHorizontal: 12 },
});
