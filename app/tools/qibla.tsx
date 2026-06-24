import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { useSettings } from '../../src/store/SettingsContext';
import { getCurrentCoords } from '../../src/lib/location';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { computeQiblaBearing } from '../../src/lib/prayerTimes';

// ── Compass SVG ───────────────────────────────────────────────────────────────

const COMPASS_SIZE = 264;
const CC = COMPASS_SIZE / 2;
const CR = 120; // ring radius

const CARDINALS_EN = ['N', 'E', 'S', 'W'];
const CARDINALS_AR = ['ش', 'شرق', 'ج', 'غ'];
const CARDINAL_ANGLES = [0, 90, 180, 270];
const INTER_ANGLES = [45, 135, 225, 315];

function CompassRose({
  heading,
  isRTL,
  ringColor,
  northColor,
}: {
  heading: number;
  isRTL: boolean;
  ringColor: string;
  northColor: string;
}) {
  const labels = isRTL ? CARDINALS_AR : CARDINALS_EN;
  return (
    <Svg
      width={COMPASS_SIZE}
      height={COMPASS_SIZE}
      style={{ transform: [{ rotate: `${-heading}deg` }] }}
    >
      {/* Outer ring */}
      <Circle cx={CC} cy={CC} r={CR} fill="none" stroke={ringColor} strokeWidth={1.5} opacity={0.65} />

      {/* Intercardinal ticks (NE / SE / SW / NW) */}
      {INTER_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <Line
            key={angle}
            x1={CC + (CR - 1) * Math.sin(rad)}  y1={CC - (CR - 1) * Math.cos(rad)}
            x2={CC + (CR - 10) * Math.sin(rad)} y2={CC - (CR - 10) * Math.cos(rad)}
            stroke={ringColor} strokeWidth={1} opacity={0.45}
          />
        );
      })}

      {/* Cardinal ticks + labels */}
      {CARDINAL_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const isNorth = angle === 0;
        const tickColor = isNorth ? northColor : ringColor;
        const labelR = CR - 30;
        const lx = CC + labelR * Math.sin(rad);
        const ly = CC - labelR * Math.cos(rad);
        return (
          <G key={angle}>
            <Line
              x1={CC + (CR - 1) * Math.sin(rad)}  y1={CC - (CR - 1) * Math.cos(rad)}
              x2={CC + (CR - 18) * Math.sin(rad)} y2={CC - (CR - 18) * Math.cos(rad)}
              stroke={tickColor} strokeWidth={isNorth ? 3 : 2}
            />
            <SvgText
              x={lx} y={ly + 5}
              textAnchor="middle"
              fontSize={isNorth ? 15 : 13}
              fontWeight="800"
              fill={tickColor}
            >
              {labels[i]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Localized reverse geocoding via Nominatim ─────────────────────────────────

async function fetchLocalizedAddress(lat: number, lon: number, lang: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`,
      { headers: { 'User-Agent': 'WahioArrahman/1.0' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.county ?? '';
    const country = a.country ?? '';
    const sep = lang === 'ar' ? '، ' : ', ';
    return [city, country].filter(Boolean).join(sep) || null;
  } catch {
    return null;
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function QiblaScreen() {
  const { isRTL, t, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState(true);
  const [locationName, setLocationName] = useState<string | null>(null);
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

        // Localized city name: try Nominatim first (supports accept-language),
        // then fall back to expo-location (returns device-locale name).
        const lang = isRTL ? 'ar' : 'en';
        const nominatimName = await fetchLocalizedAddress(coords.latitude, coords.longitude, lang);
        if (!cancelled) {
          if (nominatimName) {
            setLocationName(nominatimName);
          } else {
            try {
              const geo = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
              if (!cancelled && geo.length > 0) {
                const { city, region, country } = geo[0];
                setLocationName([city || region, country].filter(Boolean).join(', '));
              }
            } catch { /* ignore */ }
          }
        }

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
      try { subscriptionRef.current?.remove(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The Ionicons `navigate` icon naturally points NE (≈45° from vertical/North).
  // Subtract 45° so the visual tip aligns with the computed Qibla bearing.
  const arrowRotation =
    heading !== null && qiblaBearing !== null
      ? qiblaBearing - heading - 45
      : (qiblaBearing ?? 0) - 45;

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
          {/* Compass wrapper: SVG rose (rotates with device) + Qibla arrow overlay */}
          <View style={styles.compassWrapper}>
            <CompassRose
              heading={heading ?? 0}
              isRTL={isRTL}
              ringColor={palette.border}
              northColor="#E63946"
            />
            <View style={[StyleSheet.absoluteFill, styles.arrowLayer]}>
              <View style={{ transform: [{ rotate: `${arrowRotation}deg` }] }}>
                <Ionicons name="navigate" size={80} color={palette.primary} />
              </View>
            </View>
          </View>

          {!compassSupported ? (
            <Text style={[styles.notice, { color: palette.textMuted, fontSize: scaleFont(13) }]}>
              {t('qiblaCompassUnsupported')}
            </Text>
          ) : (
            <Text style={[styles.notice, { color: palette.textMuted, fontSize: scaleFont(13) }]}>
              {t('qiblaInstructions')}
            </Text>
          )}

          {qiblaBearing !== null ? (
            <Text style={{ color: palette.text, fontSize: scaleFont(15), fontWeight: '700', marginTop: 8 }}>
              {t('qiblaBearingLabel')}: {Math.round(qiblaBearing)}°
            </Text>
          ) : null}

          {locationName ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={15} color={palette.textMuted} />
              <Text style={{ color: palette.textMuted, fontSize: scaleFont(13) }}>{locationName}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  compassWrapper: { width: COMPASS_SIZE, height: COMPASS_SIZE, marginBottom: 24 },
  arrowLayer: { alignItems: 'center', justifyContent: 'center' },
  notice: { textAlign: 'center', fontSize: 13, lineHeight: 20, paddingHorizontal: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
});
