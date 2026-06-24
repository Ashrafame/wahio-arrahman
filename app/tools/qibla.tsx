import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Circle, Defs, G, LinearGradient, Path,
  RadialGradient, Stop, Text as SvgText,
} from 'react-native-svg';
import { useSettings } from '../../src/store/SettingsContext';
import { getCurrentCoords } from '../../src/lib/location';
import { IslamicPatternBackground } from '../../src/components/IslamicPatternBackground';
import { computeQiblaBearing } from '../../src/lib/prayerTimes';

// ── Compass constants ─────────────────────────────────────────────────────────

const SIZE    = 290;
const CC      = SIZE / 2;
const R_OUT   = 138;   // outer metallic bezel
const R_IN    = 124;   // bezel inner edge / face outer edge
const R_TICK  = 120;   // outermost tick end
const R_LABEL = 104;   // cardinal label centre

const GOLD       = '#C9A84C';
const NORTH_RED  = '#E63946';

const CARDINALS_EN = ['N', 'E', 'S', 'W'];
const CARDINALS_AR = ['ش', 'شرق', 'ج', 'غ'];
const CARDINAL_ANGLES = [0, 90, 180, 270];

// Pre-compute all 72 tick marks (every 5°)
interface Tick { deg: number; innerR: number; sw: number; op: number }
const TICKS: Tick[] = [];
for (let deg = 0; deg < 360; deg += 5) {
  const isCard  = deg % 90 === 0;
  const isICard = deg % 45 === 0 && !isCard;
  const isMaj   = deg % 30 === 0 && !isICard && !isCard;
  const isMin   = deg % 10 === 0 && !isMaj   && !isICard && !isCard;
  TICKS.push({
    deg,
    innerR: R_TICK - (isCard ? 22 : isICard ? 14 : isMaj ? 9 : isMin ? 6 : 4),
    sw:     isCard ? 2.5 : isICard ? 1.8 : isMaj ? 1.2 : isMin ? 0.8 : 0.5,
    op:     isCard ? 1.0 : isICard ? 0.85 : isMaj ? 0.6 : isMin ? 0.4 : 0.2,
  });
}

// SVG arc helper (clockwise)
function arc(cx: number, cy: number, r: number, a1Deg: number, a2Deg: number) {
  const r1 = (a1Deg * Math.PI) / 180, r2 = (a2Deg * Math.PI) / 180;
  const x1 = cx + r * Math.sin(r1), y1 = cy - r * Math.cos(r1);
  const x2 = cx + r * Math.sin(r2), y2 = cy - r * Math.cos(r2);
  const lg = a2Deg - a1Deg > 180 ? 1 : 0;
  return `M ${x1},${y1} A ${r},${r} 0 ${lg},1 ${x2},${y2}`;
}

// ── 3-D Compass component ─────────────────────────────────────────────────────

function Compass3D({
  heading,
  needleRot,
  isRTL,
  isDark,
  primaryColor,
  bgColor,
}: {
  heading: number;
  needleRot: number;
  isRTL: boolean;
  isDark: boolean;
  primaryColor: string;
  bgColor: string;
}) {
  const labels = isRTL ? CARDINALS_AR : CARDINALS_EN;

  // Metallic bezel colours depend on theme
  const bHi  = isDark ? '#72727f' : '#f4e8b0';
  const bMid = isDark ? '#36363f' : '#b88c28';
  const bLow = isDark ? '#141418' : '#6a4a10';
  const rimLine = isDark ? '#48484f' : '#c8a040';

  return (
    <Svg width={SIZE} height={SIZE}>
      <Defs>
        {/* Metallic bezel – radial gradient simulates convex dome */}
        <RadialGradient id="bezel" cx="36%" cy="28%" r="78%">
          <Stop offset="0%"    stopColor={bHi}  stopOpacity={1} />
          <Stop offset="48%"   stopColor={bMid} stopOpacity={1} />
          <Stop offset="100%"  stopColor={bLow} stopOpacity={1} />
        </RadialGradient>

        {/* Glossy overlay on bezel */}
        <LinearGradient id="gloss" x1="18%" y1="4%" x2="82%" y2="96%">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.48} />
          <Stop offset="38%"  stopColor="#ffffff" stopOpacity={0.06} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0.18} />
        </LinearGradient>

        {/* Compass-face soft dome tint */}
        <RadialGradient id="dome" cx="38%" cy="27%" r="80%">
          <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.10} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0.07} />
        </RadialGradient>

        {/* Pivot jewel gradient */}
        <RadialGradient id="jewel" cx="33%" cy="28%" r="70%">
          <Stop offset="0%"   stopColor={isDark ? '#8a8a9a' : '#f0e0a0'} stopOpacity={1} />
          <Stop offset="100%" stopColor={isDark ? '#222230' : '#9a7020'} stopOpacity={1} />
        </RadialGradient>
      </Defs>

      {/* ─── Elevation shadow (two offset blurs) ─── */}
      <Circle cx={CC+2} cy={CC+5} r={R_OUT+3} fill="rgba(0,0,0,0.18)" />
      <Circle cx={CC+1} cy={CC+3} r={R_OUT+1} fill="rgba(0,0,0,0.10)" />

      {/* ─── Outer metallic bezel ─── */}
      <Circle cx={CC} cy={CC} r={R_OUT} fill="url(#bezel)" />
      <Circle cx={CC} cy={CC} r={R_OUT} fill="url(#gloss)" />

      {/* Thin bright rim separating bezel from face */}
      <Circle cx={CC} cy={CC} r={R_IN + 1} fill="none"
        stroke={rimLine} strokeWidth={1.5} opacity={0.75} />

      {/* ─── Compass face + ticks (counter-rotates to stay Earth-fixed) ─── */}
      <G transform={`rotate(${-heading}, ${CC}, ${CC})`}>
        {/* Face fill */}
        <Circle cx={CC} cy={CC} r={R_IN}   fill={bgColor} />
        <Circle cx={CC} cy={CC} r={R_IN}   fill="url(#dome)" />

        {/* 72 tick marks */}
        {TICKS.map(({ deg, innerR, sw, op }) => {
          const rad = (deg * Math.PI) / 180;
          const sin = Math.sin(rad), cos = Math.cos(rad);
          return (
            <Path
              key={deg}
              d={`M ${CC + R_TICK * sin},${CC - R_TICK * cos} L ${CC + innerR * sin},${CC - innerR * cos}`}
              stroke={GOLD} strokeWidth={sw} opacity={op}
            />
          );
        })}

        {/* Cardinal labels with North glow */}
        {CARDINAL_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const lx = CC + R_LABEL * Math.sin(rad);
          const ly = CC - R_LABEL * Math.cos(rad);
          const isN = angle === 0;
          return (
            <G key={angle}>
              {isN && <Circle cx={lx} cy={ly} r={14} fill={NORTH_RED} opacity={0.22} />}
              <SvgText
                x={lx} y={ly + 5}
                textAnchor="middle"
                fontSize={isN ? 16 : 13}
                fontWeight="900"
                fill={isN ? NORTH_RED : GOLD}
              >
                {labels[i]}
              </SvgText>
            </G>
          );
        })}

        {/* Inner-face edge shadow (creates recessed depth) */}
        <Circle cx={CC} cy={CC} r={R_IN - 1} fill="none"
          stroke="rgba(0,0,0,0.18)" strokeWidth={4} />
      </G>

      {/* ─── Specular highlight arc on bezel (glass reflection, stays static) ─── */}
      <Path
        d={arc(CC, CC, (R_OUT + R_IN) / 2, 250, 345)}
        fill="none"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth={R_OUT - R_IN - 3}
        strokeLinecap="round"
      />

      {/* ─── Qibla needle ─── */}
      <G transform={`translate(${CC}, ${CC}) rotate(${needleRot})`}>
        {/* Depth shadow (slightly offset) */}
        <Path d="M 0,-57 L 8,6 L 0,12 L -8,6 Z"
          fill="rgba(0,0,0,0.22)" transform="translate(2,4)" />
        <Path d="M 0,12 L 5,8 L 0,34 L -5,8 Z"
          fill="rgba(0,0,0,0.12)" transform="translate(2,4)" />

        {/* Tail (pointing away from Qibla) */}
        <Path d="M 0,12 L 6,8 L 0,34 L -6,8 Z"
          fill={isDark ? '#60606f' : '#aaaaaa'} />

        {/* Main Qibla tip */}
        <Path d="M 0,-57 L 8,6 L 0,12 L -8,6 Z"
          fill={primaryColor} />

        {/* Tip highlight (simulates convex metallic surface) */}
        <Path d="M 0,-57 L 3,-18 L 0,2 L -3,-18 Z"
          fill="rgba(255,255,255,0.30)" />

        {/* Pivot jewel rings */}
        <Circle cx={0} cy={0} r={13} fill="url(#jewel)" />
        <Circle cx={0} cy={0} r={13} fill="none"
          stroke={isDark ? '#505060' : '#b89030'} strokeWidth={1.5} />
        <Circle cx={0} cy={0} r={7}  fill={primaryColor} opacity={0.9} />
        {/* Jewel specular */}
        <Circle cx={-2} cy={-2} r={2.5} fill="rgba(255,255,255,0.55)" />
      </G>

      {/* ─── Outer bezel edge line ─── */}
      <Circle cx={CC} cy={CC} r={R_OUT}
        fill="none" stroke={isDark ? '#0c0c12' : '#543808'} strokeWidth={1.5} />
    </Svg>
  );
}

// ── Localized reverse geocoding ───────────────────────────────────────────────

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
  const { isRTL, t, theme, scaleFont, palette } = useSettings();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [qiblaBearing,     setQiblaBearing]     = useState<number | null>(null);
  const [heading,          setHeading]          = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState(true);
  const [locationName,     setLocationName]     = useState<string | null>(null);
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

        const lang = isRTL ? 'ar' : 'en';
        const name = await fetchLocalizedAddress(coords.latitude, coords.longitude, lang);
        if (!cancelled) {
          if (name) {
            setLocationName(name);
          } else {
            try {
              const geo = await Location.reverseGeocodeAsync({
                latitude: coords.latitude, longitude: coords.longitude,
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

  // Custom needle points straight up (0°) so no icon-offset correction needed
  const needleRot =
    heading !== null && qiblaBearing !== null
      ? qiblaBearing - heading
      : qiblaBearing ?? 0;

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
          <Compass3D
            heading={heading ?? 0}
            needleRot={needleRot}
            isRTL={isRTL}
            isDark={isDark}
            primaryColor={palette.primary}
            bgColor={palette.background}
          />

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
  container:   { flex: 1 },
  header:      { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton:  { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  notice:      { textAlign: 'center', fontSize: 13, lineHeight: 20, paddingHorizontal: 12, marginTop: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
});
