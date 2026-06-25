import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Open-book + magnifying glass icon representing "search inside Quran".
 * Matches the custom icon provided for the home-screen header.
 */
export function BookSearchIcon({ size = 24, color = '#ffffff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 480" fill="none">

      {/* ── LEFT PAGE ─────────────────────────────────────────── */}
      <Path
        d="M 46 64
           C 46 48 58 40 88 36
           L 232 28
           C 244 28 250 34 250 46
           L 250 390
           C 210 406 120 414 72 400
           C 54 394 46 382 46 368
           Z"
        stroke={color}
        strokeWidth={26}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Text lines – left page */}
      <Line x1="86"  y1="90"  x2="222" y2="84"  stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="86"  y1="142" x2="222" y2="136" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="86"  y1="194" x2="222" y2="188" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="86"  y1="246" x2="222" y2="240" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="86"  y1="298" x2="222" y2="292" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="86"  y1="350" x2="185" y2="345" stroke={color} strokeWidth={20} strokeLinecap="round" />

      {/* ── RIGHT PAGE ────────────────────────────────────────── */}
      <Path
        d="M 466 64
           C 466 48 454 40 424 36
           L 280 28
           C 268 28 262 34 262 46
           L 262 390
           C 302 406 392 414 440 400
           C 458 394 466 382 466 368
           Z"
        stroke={color}
        strokeWidth={26}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Text lines – right page (top only; lower rows sit behind magnifier) */}
      <Line x1="290" y1="84"  x2="426" y2="90"  stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="290" y1="136" x2="426" y2="142" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="290" y1="188" x2="426" y2="194" stroke={color} strokeWidth={20} strokeLinecap="round" />
      <Line x1="290" y1="240" x2="380" y2="244" stroke={color} strokeWidth={20} strokeLinecap="round" />

      {/* ── MAGNIFYING GLASS ──────────────────────────────────── */}
      {/* Outer circle */}
      <Circle
        cx={368}
        cy={336}
        r={88}
        stroke={color}
        strokeWidth={28}
      />
      {/* Small reflection arc inside circle (top-left of lens) */}
      <Path
        d="M 318 290 A 42 42 0 0 1 358 268"
        stroke={color}
        strokeWidth={18}
        strokeLinecap="round"
      />
      {/* Handle */}
      <Line
        x1="432"
        y1="402"
        x2="488"
        y2="462"
        stroke={color}
        strokeWidth={36}
        strokeLinecap="round"
      />
    </Svg>
  );
}
