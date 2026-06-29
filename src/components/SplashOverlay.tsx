import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

const SPLASH_DURATION_MS = 1800;
const FADE_DURATION_MS   = 600;
const BG_COLOR           = '#324B1A';

/**
 * In-app splash overlay that shows the full-screen splash artwork on top of the
 * app for 7 seconds, then fades out. Works in Expo Go and production alike since
 * the native config-plugin splash may not be applied in dev.
 */
export function SplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);

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

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image
        source={require('../../assets/splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG_COLOR,
    zIndex: 999,
    elevation: 999,
  },
  image: { width: '100%', height: '100%' },
});
