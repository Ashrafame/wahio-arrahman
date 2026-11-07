// Ornamental surah header: the artwork in assets/source/surah-header.png with
// each surah's own name, ayah count and order, in the app's colour.
//
// The artwork is split into layers by scripts/surah-header-layers.py: a mask of
// its green parts (tinted here with a colour derived from the app's primary
// colour), black and white shading over them, and the parts that never change
// (white, flowers, leaves, outlines). The text is drawn on top with the app's
// fonts.

import React, { memo } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSettings } from '../store/SettingsContext';
import { chapters, getVerseCount } from '../lib/quranData';

const LAYERS = {
  mask: require('../../assets/surah-header/mask.png'),
  dark: require('../../assets/surah-header/shade-dark.png'),
  light: require('../../assets/surah-header/shade-light.png'),
  fixed: require('../../assets/surah-header/fixed.png'),
};

// Geometry of the artwork (1024 × 204), as fractions of its size.
const ART_W = 1024;
const ART_H = 204;
const NAME = { left: 345 / ART_W, right: 685 / ART_W, top: 38 / ART_H, bottom: 168 / ART_H };
const CIRCLE_AYAT = { cx: 218.5 / ART_W, cy: 99 / ART_H, w: 91 / ART_W, h: 122 / ART_H };
const CIRCLE_ORDER = { cx: 802.5 / ART_W, cy: 99.5 / ART_H, w: 99 / ART_W, h: 123 / ART_H };

// ── Colour ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [number, number, number];
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}

const toHex = (rgb: [number, number, number]) =>
  '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');

// The artwork's green is the app's default green (#0F4C3A) lightened by this
// ratio; any other app colour is lightened the same way (within limits), so the
// default colour gives back the original artwork.
const LIGHTEN = 0.2392 / 0.1784;

function ornamentColour(primary: string): { tint: string; rgb: [number, number, number] } {
  const rgb = hexToRgb(primary);
  if (!rgb) return { tint: primary, rgb: [0.08, 0.4, 0.3] };
  const [h, s, l] = rgbToHsl(rgb);
  const out = hslToRgb([h, Math.min(s, 0.85), Math.min(Math.max(l * LIGHTEN, 0.2), 0.42)]);
  return { tint: toHex(out), rgb: out };
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** White or near-black, whichever reads better on the circles' colour. */
function textOn(rgb: [number, number, number]) {
  const L = relativeLuminance(rgb);
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#111111' : '#FFFFFF';
}

// ── Component ────────────────────────────────────────────────────────────────

/** Width ÷ height of the artwork. */
export const ORNAMENT_ASPECT = ART_W / ART_H;

export const SurahHeaderOrnament = memo(function SurahHeaderOrnament({
  surah,
  width,
  ayahCount,
  arabic,
  embedded,
}: {
  surah: number;
  /** Width in points (default: the screen width, up to 680). */
  width?: number;
  /** Ayah count to show (default: the Hafs count). The Libyan Mushaf passes its own (Qaloon) count. */
  ayahCount?: number;
  /** Arabic labels whatever the app language (the Libyan Mushaf is Arabic). */
  arabic?: boolean;
  /** Drawn inside a Mushaf page: no margins, touches pass through to the page. */
  embedded?: boolean;
}) {
  const { palette, isRTL } = useSettings();
  const { width: screenW } = useWindowDimensions();
  const w = width ?? Math.min(screenW - 20, 680);
  const h = w * (ART_H / ART_W);
  const ar = arabic || isRTL;

  const chapter = chapters.find((c) => c.number === surah);
  const name = chapter?.nameArabic ?? '';
  const count = ayahCount ?? getVerseCount(surah);
  const { tint, rgb } = ornamentColour(palette.primary);
  const circleText = textOn(rgb);

  const circle = (c: typeof CIRCLE_AYAT, label: string, value: number) => (
    <View
      style={{
        position: 'absolute',
        left: (c.cx - c.w / 2) * w,
        top: (c.cy - c.h / 2) * h,
        width: c.w * w,
        height: c.h * h,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, { color: circleText, fontSize: h * 0.135, lineHeight: h * 0.2 }]}>
        {label}
      </Text>
      <Text style={[styles.number, { color: circleText, fontSize: h * 0.2, lineHeight: h * 0.26 }]}>{value}</Text>
    </View>
  );

  return (
    <View
      style={[embedded ? null : styles.wrap, { width: w, height: h }]}
      pointerEvents={embedded ? 'none' : 'auto'}
      accessible
      accessibilityLabel={ar ? `${name}، آياتها ${count}، ترتيبها ${surah}` : `Surah ${surah}, ${count} verses`}
    >
      <Image source={LAYERS.mask} style={[styles.layer, { tintColor: tint }]} resizeMode="stretch" />
      <Image source={LAYERS.dark} style={styles.layer} resizeMode="stretch" />
      <Image source={LAYERS.light} style={styles.layer} resizeMode="stretch" />
      <Image source={LAYERS.fixed} style={styles.layer} resizeMode="stretch" />

      <View
        style={{
          position: 'absolute',
          left: NAME.left * w,
          top: NAME.top * h,
          width: (NAME.right - NAME.left) * w,
          height: (NAME.bottom - NAME.top) * h,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={[styles.name, { fontSize: h * 0.3, lineHeight: h * 0.6 }]}
        >
          {name}
        </Text>
      </View>

      {/* As in the artwork: ayah count on the left, the surah's order on the right. */}
      {circle(CIRCLE_AYAT, ar ? 'آياتها' : 'Verses', count)}
      {circle(CIRCLE_ORDER, ar ? 'ترتيبها' : 'Surah', surah)}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  layer: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  name: { fontFamily: 'Amiri-Bold', color: '#111111', textAlign: 'center', includeFontPadding: false },
  label: { fontFamily: 'Amiri-Regular', textAlign: 'center', includeFontPadding: false },
  number: { fontFamily: 'Amiri-Bold', textAlign: 'center', includeFontPadding: false },
});
