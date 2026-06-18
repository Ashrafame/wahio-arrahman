import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Polygon, Line, Rect } from 'react-native-svg';
import { useSettings } from '../store/SettingsContext';
import { getPalette } from '../theme/colors';

/**
 * Subtle Islamic geometric (khatam 8-pointed star) background pattern.
 * Absolutely positioned, pointer events disabled — drop inside any root View.
 */
export function IslamicPatternBackground() {
  const { theme } = useSettings();
  const palette = getPalette(theme);
  const { width, height } = useWindowDimensions();

  // Warm brown that complements both themes
  const color = theme === 'light' ? '#7A4F2A' : '#C49A6C';
  const opacity = theme === 'light' ? 0.09 : 0.07;

  // 80×80 tile — 8-pointed star at center (40,40), outer radius 20
  // Diamond:  (40,20)(60,40)(40,60)(20,40)
  // Square:   (25.86,25.86)(54.14,25.86)(54.14,54.14)(25.86,54.14)
  // Inner octagon (intersections of the two shapes)
  // Cardinal lines from star tips to tile edges
  // Diagonal lines from square corners to tile corners

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        <Pattern
          id="khatam"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          {/* Diamond (rotated square) */}
          <Polygon
            points="40,20 60,40 40,60 20,40"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
          />
          {/* Axis-aligned square */}
          <Polygon
            points="25.86,25.86 54.14,25.86 54.14,54.14 25.86,54.14"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
          />
          {/* Inner octagon (adds the classic Rub el-Hizb detail) */}
          <Polygon
            points="45.86,25.86 54.14,34.14 54.14,45.86 45.86,54.14 34.14,54.14 25.86,45.86 25.86,34.14 34.14,25.86"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
          />
          {/* Cardinal lines: star tips → tile edges */}
          <Line x1="40" y1="0"  x2="40" y2="20" stroke={color} strokeWidth="0.9" />
          <Line x1="60" y1="40" x2="80" y2="40" stroke={color} strokeWidth="0.9" />
          <Line x1="40" y1="60" x2="40" y2="80" stroke={color} strokeWidth="0.9" />
          <Line x1="20" y1="40" x2="0"  y2="40" stroke={color} strokeWidth="0.9" />
          {/* Diagonal lines: square corners → tile corners */}
          <Line x1="0"  y1="0"  x2="25.86" y2="25.86" stroke={color} strokeWidth="0.9" />
          <Line x1="80" y1="0"  x2="54.14" y2="25.86" stroke={color} strokeWidth="0.9" />
          <Line x1="80" y1="80" x2="54.14" y2="54.14" stroke={color} strokeWidth="0.9" />
          <Line x1="0"  y1="80" x2="25.86" y2="54.14" stroke={color} strokeWidth="0.9" />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#khatam)" opacity={opacity} />
    </Svg>
  );
}
