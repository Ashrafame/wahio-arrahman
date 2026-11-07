// The home screen's «مصحف الأوقاف الليبي» card: the lightest shade of the
// app's colour (it follows the colour chosen in Settings), with a band of light
// that sweeps across it every few seconds so it catches the eye.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../store/SettingsContext';

/** Turn the passing shine on or off. */
const SHINE = true;
const SHINE_EVERY_MS = 5000; // pause between two passes
const SHINE_PASS_MS = 1300; // one pass across the card
const BAND_W = 90;

/** Mix a '#RRGGBB' colour with another; t = share of the other (0…1). */
function mix(hex: string, other: string, t: number): string {
  const p = (h: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
    const n = m ? parseInt(m[1], 16) : 0x0f4c3a;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = p(hex);
  const b = p(other);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

export function MushafHomeCard({ onPress }: { onPress: () => void }) {
  const { palette, isRTL, scaleFont } = useSettings();
  const [w, setW] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;

  // Lightest shade of the app colour for the card; its own colour, deepened,
  // for the text, so it always reads well on the light card (also in dark mode).
  const bg = mix(palette.primary, '#FFFFFF', 0.88);
  const border = mix(palette.primary, '#FFFFFF', 0.55);
  const ink = mix(palette.primary, '#000000', 0.45);
  const inkSoft = mix(palette.primary, '#000000', 0.3);

  useEffect(() => {
    if (!SHINE || !w) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(SHINE_EVERY_MS),
        Animated.timing(sweep, { toValue: 1, duration: SHINE_PASS_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [w, sweep]);

  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderColor: border, flexDirection: isRTL ? 'row-reverse' : 'row', opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="مصحف الأوقاف الليبي، رواية قالون عن نافع"
    >
      <View style={[styles.icon, { backgroundColor: palette.primary }]}>
        <Ionicons name="book" size={20} color={palette.primaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: ink, fontWeight: '700', fontSize: scaleFont(16), textAlign: isRTL ? 'right' : 'left' }}>
          مصحف الأوقاف الليبي
        </Text>
        <Text style={{ color: inkSoft, fontSize: scaleFont(12), marginTop: 2, textAlign: isRTL ? 'right' : 'left' }}>
          رواية قالون عن نافع · صفحات المصحف كما طُبع
        </Text>
      </View>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={inkSoft} />

      {SHINE && w ? (
        // A slanted band of light sweeping across, like light on polished metal.
        <Animated.View
          pointerEvents="none"
          style={[
            styles.band,
            {
              transform: [
                { translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-BAND_W * 1.5, w + BAND_W * 0.5] }) },
                { skewX: '-20deg' },
              ],
            },
          ]}
        >
          <Svg width={BAND_W} height="100%">
            <Defs>
              <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={BAND_W} height="100%" fill="url(#shine)" />
          </Svg>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center', gap: 12, marginHorizontal: 12, marginTop: 10, marginBottom: 4,
    padding: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden',
  },
  icon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', top: -10, bottom: -10, left: 0, width: BAND_W },
});
