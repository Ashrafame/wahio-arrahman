// Surah number in an eight-pointed star (two overlapping squares, the shape of
// the rub' al-hizb mark ۞ printed in the Mushaf), in the app's colour with a
// gold outline and inner ring.

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Outline of the star: 8 outer points and 8 inner corners, centred at (c, c). */
function starPath(c: number, r: number): string {
  const inner = r * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
  const pts: string[] = [];
  for (let k = 0; k < 16; k++) {
    const rad = k % 2 === 0 ? r : inner;
    const a = (k * Math.PI) / 8 - Math.PI / 2;
    pts.push(`${(c + rad * Math.cos(a)).toFixed(2)},${(c + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

export const SurahNumberBadge = memo(function SurahNumberBadge({
  number,
  size = 42,
  fill,
  gold,
  textColor,
  fontSize,
}: {
  number: number;
  size?: number;
  /** Star colour (the app's primary colour). */
  fill: string;
  /** Outline and inner ring (the app's accent, gold by default). */
  gold: string;
  textColor: string;
  fontSize: number;
}) {
  const c = size / 2;
  const r = c - 1.5;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Path d={starPath(c, r)} fill={fill} stroke={gold} strokeWidth={1.4} strokeLinejoin="round" />
        <Circle cx={c} cy={c} r={r * 0.62} fill="none" stroke={gold} strokeWidth={0.9} strokeOpacity={0.85} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.text, { color: textColor, fontSize }]}
        >
          {number}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700', includeFontPadding: false, textAlign: 'center' },
});
