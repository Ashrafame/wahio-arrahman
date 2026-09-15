import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Asbab al-Nuzul icon: an open book receiving a descending arrow ("the
 * revelation coming down"), with emphasis sparks. Stroke-based so it tints
 * cleanly via the `color` prop, matching the other tool icons.
 */
export function AsbabIcon({ size = 48, color = '#0F4C3A' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      {/* ── Descending revelation arrow ─────────────────────────── */}
      {/* shaft */}
      <Line
        x1="216" y1="40" x2="216" y2="250"
        stroke={color}
        strokeWidth={28}
        strokeLinecap="round"
      />
      {/* arrowhead pointing down into the book */}
      <Path
        d="M 162 196 L 216 256 L 270 196"
        stroke={color}
        strokeWidth={28}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Emphasis sparks (top-right) ─────────────────────────── */}
      <Line x1="320" y1="96"  x2="300" y2="150" stroke={color} strokeWidth={24} strokeLinecap="round" />
      <Line x1="392" y1="150" x2="344" y2="186" stroke={color} strokeWidth={24} strokeLinecap="round" />
      <Line x1="420" y1="222" x2="362" y2="232" stroke={color} strokeWidth={24} strokeLinecap="round" />

      {/* ── Open book ───────────────────────────────────────────── */}
      {/* left page */}
      <Path
        d="M 56 312
           C 120 286 184 286 240 320
           L 240 432
           C 184 398 120 398 56 424
           Z"
        stroke={color}
        strokeWidth={26}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* right page */}
      <Path
        d="M 456 312
           C 392 286 328 286 272 320
           L 272 432
           C 328 398 392 398 456 424
           Z"
        stroke={color}
        strokeWidth={26}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
