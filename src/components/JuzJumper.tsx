// Juz picker for the Libyan Awqaf Mushaf: a bubble tucked at the right edge of
// the page; tapping it slides out a bar with «الجزء», a 1–30 counter (30 by
// default) and a button that opens the page where that juz starts.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../store/SettingsContext';
import { QALOON_JUZ_COUNT } from '../lib/qaloonMushaf';

// Narrow enough to sit in the page's blank side margin (about 17 pt on a phone),
// so the closed bubble never covers a letter of the text.
const BUBBLE_W = 20;

export function JuzJumper({ top, onGo }: { top: number; onGo: (juz: number) => void }) {
  const { palette } = useSettings();
  const [open, setOpen] = useState(false);
  const [juz, setJuz] = useState(QALOON_JUZ_COUNT);
  const [barW, setBarW] = useState(260);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: open ? 1 : 0, friction: 9, tension: 60, useNativeDriver: true }).start();
  }, [open, slide]);

  const step = (d: number) => setJuz((j) => Math.min(QALOON_JUZ_COUNT, Math.max(1, j + d)));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top }]}>
      {/* The bar, sliding in from the right edge. */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        onLayout={(e) => setBarW(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            backgroundColor: palette.surface,
            borderColor: palette.primary,
            opacity: slide,
            transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [barW + 20, 0] }) }],
          },
        ]}
      >
        <Pressable onPress={() => setOpen(false)} hitSlop={8} style={styles.small} accessibilityLabel="إغلاق">
          <Ionicons name="close" size={18} color={palette.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => { setOpen(false); onGo(juz); }}
          style={[styles.go, { backgroundColor: palette.primary }]}
          accessibilityLabel={`افتح الجزء ${juz}`}
        >
          <Ionicons name="book-outline" size={16} color={palette.primaryText} />
          <Text style={[styles.goText, { color: palette.primaryText }]}>افتح</Text>
        </Pressable>
        <Pressable
          onPress={() => step(1)}
          disabled={juz >= QALOON_JUZ_COUNT}
          hitSlop={6}
          style={[styles.stepBtn, { borderColor: palette.border, opacity: juz >= QALOON_JUZ_COUNT ? 0.35 : 1 }]}
          accessibilityLabel="الجزء التالي"
        >
          <Ionicons name="add" size={20} color={palette.primary} />
        </Pressable>
        <Text style={[styles.value, { color: palette.text }]}>{juz}</Text>
        <Pressable
          onPress={() => step(-1)}
          disabled={juz <= 1}
          hitSlop={6}
          style={[styles.stepBtn, { borderColor: palette.border, opacity: juz <= 1 ? 0.35 : 1 }]}
          accessibilityLabel="الجزء السابق"
        >
          <Ionicons name="remove" size={20} color={palette.primary} />
        </Pressable>
        <Text style={[styles.label, { color: palette.text }]}>الجزء</Text>
      </Animated.View>

      {/* The bubble at the edge. */}
      <Animated.View
        pointerEvents={open ? 'none' : 'auto'}
        style={{
          opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [0, BUBBLE_W] }) }],
        }}
      >
        <Pressable
          onPress={() => setOpen(true)}
          hitSlop={{ top: 10, bottom: 10, left: 22 }}
          style={[styles.bubble, { backgroundColor: palette.primary, borderColor: palette.accent }]}
          accessibilityLabel="الانتقال إلى جزء"
        >
          <Ionicons name="layers" size={13} color={palette.primaryText} />
          <Text style={[styles.bubbleText, { color: palette.primaryText }]}>ج</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 0, alignItems: 'flex-end' },
  bubble: {
    width: BUBBLE_W, paddingVertical: 9, borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    borderWidth: 1, borderRightWidth: 0, alignItems: 'center', gap: 1,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: -1, height: 2 }, elevation: 5,
  },
  bubbleText: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  bar: {
    position: 'absolute', top: 0, right: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  label: { fontSize: 16, fontWeight: '700', marginLeft: 2 },
  value: { fontSize: 20, fontWeight: '800', minWidth: 30, textAlign: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  go: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 34, borderRadius: 17 },
  goText: { fontSize: 14, fontWeight: '700' },
  small: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
});
