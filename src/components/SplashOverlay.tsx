import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet } from 'react-native';

const SPLASH_DURATION_MS = 1800;
const FADE_DURATION_MS   = 600;
const BG_COLOR           = '#183018';

/**
 * In-app splash overlay shown on top of the app briefly, then faded out.
 *   • iOS   → the full-screen ornate artwork (bridges the native storyboard).
 *   • Android → nothing: the native splash + its green/medallion window
 *     background already cover the whole JS-load window, so a JS overlay here
 *     would just show the medallion a SECOND time. Rendering null keeps Android
 *     to a single medallion-on-green, then the app.
 */
export function SplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') return;
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setHidden(true));
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (Platform.OS === 'android' || hidden) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image source={require('../../assets/splash.png')} style={styles.image} resizeMode="cover" />
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
