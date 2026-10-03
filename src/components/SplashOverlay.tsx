import React, { useCallback, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const SPLASH_DURATION_MS = 1800;
const FADE_DURATION_MS   = 600;
const BG_COLOR           = '#183018';

/**
 * In-app splash shown on top of the app, then faded out.
 *   • iOS   → the full-screen ornate artwork (matches the native storyboard).
 *   • Android → the medallion centered on green (matches the native splash).
 *
 * The native splash is hidden from THIS overlay's onLayout — i.e. only once the
 * overlay has actually painted — so there is never a white window between the
 * native splash and the first JS frame. The overlay then stays until the app
 * screen has mounted underneath it and fades out, so there's no white after it
 * either.
 */
export function SplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);
  const started = useRef(false);
  const { width } = useWindowDimensions();

  const onLayout = useCallback(() => {
    if (started.current) return;
    started.current = true;
    SplashScreen.hideAsync().catch(() => {});
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setHidden(true));
    }, SPLASH_DURATION_MS);
  }, [opacity]);

  if (hidden) return null;

  const isAndroid = Platform.OS === 'android';
  const medW = Math.min(width * 0.72, 340);

  return (
    <Animated.View
      pointerEvents="none"
      onLayout={onLayout}
      style={[StyleSheet.absoluteFill, styles.container, { opacity }]}
    >
      {isAndroid ? (
        <Image
          source={require('../../assets/android-splash-icon.png')}
          style={{ width: medW, aspectRatio: 460 / 542 }}
          resizeMode="contain"
        />
      ) : (
        <Image source={require('../../assets/splash.png')} style={styles.image} resizeMode="cover" />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  image: { width: '100%', height: '100%' },
});
