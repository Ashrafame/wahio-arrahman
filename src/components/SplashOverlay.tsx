import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, useWindowDimensions } from 'react-native';

const SPLASH_DURATION_MS = 1800;
const FADE_DURATION_MS   = 600;
const BG_COLOR           = '#183018';

/**
 * In-app splash overlay shown on top of the app briefly, then faded out. Works
 * in Expo Go and production alike since the native config-plugin splash may not
 * be applied in dev.
 *   • iOS   → the full-screen ornate artwork (matches the native storyboard).
 *   • Android → the medallion centered on the green background (matches the
 *     native Android 12 splash), so Android shows only medallion-on-green.
 */
export function SplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setHidden(true));
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (hidden) return null;

  const isAndroid = Platform.OS === 'android';
  const medallion = Math.min(width * 0.72, 420);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      {isAndroid ? (
        <Image
          source={require('../../assets/android-splash-icon.png')}
          style={{ width: medallion, height: medallion }}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={require('../../assets/splash.png')}
          style={styles.image}
          resizeMode="cover"
        />
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
