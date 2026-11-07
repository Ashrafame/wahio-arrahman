// A floating "stop the recitation" button for screens that have no player of
// their own (home, tools, settings, search, Juz lists…). It appears only while a
// recitation is playing, and one tap stops it and hides the button at once.
// The surah reader and the Libyan Awqaf Mushaf have their own controls, so the
// button is not shown there.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentAudioKey, stopAudio, subscribeAudio } from '../lib/audio';
import { useSettings } from '../store/SettingsContext';

const SCREENS_WITH_A_PLAYER = [/^\/surah\//, /^\/mushaf\//];

export function NowPlayingStop() {
  const { palette, isRTL } = useSettings();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(
    () => subscribeAudio((key, isPlaying) => setPlaying(!!key && isPlaying)),
    [],
  );
  useEffect(() => {
    if (getCurrentAudioKey() === null) setPlaying(false);
  }, [pathname]);

  const visible = playing && !SCREENS_WITH_A_PLAYER.some((re) => re.test(pathname));

  // A slow pulse around the button, so it reads as "something is playing".
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  if (!visible) return null;

  const stop = () => {
    setPlaying(false); // hide at once, without waiting for the player
    stopAudio();
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 18 }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            borderColor: palette.accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
          },
        ]}
      />
      <Pressable
        onPress={stop}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={isRTL ? 'إيقاف التلاوة' : 'Stop the recitation'}
        style={[styles.button, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      >
        <Ionicons name="stop" size={18} color={palette.primaryText} />
        <Text style={[styles.label, { color: palette.primaryText }]}>{isRTL ? 'إيقاف التلاوة' : 'Stop recitation'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', top: -4, bottom: -4, left: -4, right: -4, borderRadius: 30, borderWidth: 2 },
  button: {
    alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 18, borderRadius: 23,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  label: { fontSize: 15, fontWeight: '700' },
});
