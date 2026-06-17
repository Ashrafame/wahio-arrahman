import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

/**
 * In-app splash overlay that shows the full-screen splash artwork on top of the
 * app, then fades out. This guarantees the branded splash is visible even in
 * Expo Go, where the native (config-plugin) splash image is not applied.
 */
export function SplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }).start(() => setHidden(true));
    }, 1600);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (hidden) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image source={require('../../assets/splash.png')} style={StyleSheet.absoluteFill} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0D402F', zIndex: 999, elevation: 999 },
});
