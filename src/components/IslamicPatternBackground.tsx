import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Polygon, Line, Rect, Circle } from 'react-native-svg';
import { useSettings } from '../store/SettingsContext';

export function IslamicPatternBackground() {
  const { theme, patternStyleId } = useSettings();
  const { width, height } = useWindowDimensions();

  if (patternStyleId === 'none') return null;

  const color = theme === 'light' ? '#7A4F2A' : '#C49A6C';
  const opacity = theme === 'light' ? 0.09 : 0.07;
  const sw = 0.9;

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        {patternStyleId === 'khatam' ? (
          // ── 8-pointed star (Khatam) ──────────────────────────────────────
          <Pattern id="pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <Polygon points="40,20 60,40 40,60 20,40" fill="none" stroke={color} strokeWidth={sw} />
            <Polygon points="25.86,25.86 54.14,25.86 54.14,54.14 25.86,54.14" fill="none" stroke={color} strokeWidth={sw} />
            <Polygon points="45.86,25.86 54.14,34.14 54.14,45.86 45.86,54.14 34.14,54.14 25.86,45.86 25.86,34.14 34.14,25.86" fill="none" stroke={color} strokeWidth={0.6} />
            <Line x1="40" y1="0"  x2="40" y2="20" stroke={color} strokeWidth={sw} />
            <Line x1="60" y1="40" x2="80" y2="40" stroke={color} strokeWidth={sw} />
            <Line x1="40" y1="60" x2="40" y2="80" stroke={color} strokeWidth={sw} />
            <Line x1="20" y1="40" x2="0"  y2="40" stroke={color} strokeWidth={sw} />
            <Line x1="0"  y1="0"  x2="25.86" y2="25.86" stroke={color} strokeWidth={sw} />
            <Line x1="80" y1="0"  x2="54.14" y2="25.86" stroke={color} strokeWidth={sw} />
            <Line x1="80" y1="80" x2="54.14" y2="54.14" stroke={color} strokeWidth={sw} />
            <Line x1="0"  y1="80" x2="25.86" y2="54.14" stroke={color} strokeWidth={sw} />
          </Pattern>
        ) : patternStyleId === 'arabesque' ? (
          // ── Arabesque — corner quarter-circles forming 4-petal flowers ───
          <Pattern id="pat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <Circle cx="0"  cy="0"  r="30" fill="none" stroke={color} strokeWidth={sw} />
            <Circle cx="60" cy="0"  r="30" fill="none" stroke={color} strokeWidth={sw} />
            <Circle cx="0"  cy="60" r="30" fill="none" stroke={color} strokeWidth={sw} />
            <Circle cx="60" cy="60" r="30" fill="none" stroke={color} strokeWidth={sw} />
            <Circle cx="30" cy="30" r="10" fill="none" stroke={color} strokeWidth={0.6} />
          </Pattern>
        ) : patternStyleId === 'diamonds' ? (
          // ── Diamonds — rotated square grid ───────────────────────────────
          <Pattern id="pat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <Polygon points="20,0 40,20 20,40 0,20" fill="none" stroke={color} strokeWidth={sw} />
            <Line x1="20" y1="0"  x2="20" y2="40" stroke={color} strokeWidth={0.4} />
            <Line x1="0"  y1="20" x2="40" y2="20" stroke={color} strokeWidth={0.4} />
          </Pattern>
        ) : (
          // ── Geometric — interlocking squares (mashrabiya style) ───────────
          <Pattern id="pat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            {/* Axis-aligned inner square */}
            <Polygon points="12,12 48,12 48,48 12,48" fill="none" stroke={color} strokeWidth={sw} />
            {/* Rotated square (diamond) */}
            <Polygon points="30,6 54,30 30,54 6,30" fill="none" stroke={color} strokeWidth={sw} />
            {/* Lines from edge midpoints to diamond corners */}
            <Line x1="30" y1="0"  x2="30" y2="6"  stroke={color} strokeWidth={sw} />
            <Line x1="60" y1="30" x2="54" y2="30" stroke={color} strokeWidth={sw} />
            <Line x1="30" y1="60" x2="30" y2="54" stroke={color} strokeWidth={sw} />
            <Line x1="0"  y1="30" x2="6"  y2="30" stroke={color} strokeWidth={sw} />
            {/* Lines from corners to square corners */}
            <Line x1="0"  y1="0"  x2="12" y2="12" stroke={color} strokeWidth={sw} />
            <Line x1="60" y1="0"  x2="48" y2="12" stroke={color} strokeWidth={sw} />
            <Line x1="60" y1="60" x2="48" y2="48" stroke={color} strokeWidth={sw} />
            <Line x1="0"  y1="60" x2="12" y2="48" stroke={color} strokeWidth={sw} />
          </Pattern>
        )}
      </Defs>
      <Rect width={width} height={height} fill="url(#pat)" opacity={opacity} />
    </Svg>
  );
}
