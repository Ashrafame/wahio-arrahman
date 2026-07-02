import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from '../src/store/SettingsContext';
import { getPalette } from '../src/theme/colors';
import { SplashOverlay } from '../src/components/SplashOverlay';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { KeepAwakeWhilePlaying } from '../src/components/KeepAwakeWhilePlaying';
import { NotificationsManager } from '../src/components/NotificationsManager';
import { ensureAudioMode } from '../src/lib/audio';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme, ready } = useSettings();
  const palette = getPalette(theme);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  // Configure the audio session for background + silent-mode playback once at
  // startup, so the session category is already 'playback' before any tap —
  // avoids a race where playback could start in a non-background category.
  useEffect(() => {
    ensureAudioMode();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.primary },
          headerTintColor: palette.primaryText,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="surah/[number]" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="asbab" options={{ headerShown: false }} />
        <Stack.Screen name="nafl/index" options={{ headerShown: false }} />
        <Stack.Screen name="nafl/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="tools/index" options={{ headerShown: false }} />
        <Stack.Screen name="tools/prayer-times" options={{ headerShown: false }} />
        <Stack.Screen name="tools/qibla" options={{ headerShown: false }} />
        <Stack.Screen name="tools/tasbih" options={{ headerShown: false }} />
        <Stack.Screen name="tools/azkar/index" options={{ headerShown: false }} />
        <Stack.Screen name="tools/azkar/[category]" options={{ headerShown: false }} />
        <Stack.Screen name="tools/hijri-calendar" options={{ headerShown: false }} />
        <Stack.Screen name="tools/riwayat" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
      </Stack>
      <KeepAwakeWhilePlaying />
      <NotificationsManager />
      <SplashOverlay />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'ScheherazadeNew-Regular': require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
    'ScheherazadeNew-Bold': require('../assets/fonts/ScheherazadeNew-Bold.ttf'),
    'Cairo-Variable': require('../assets/fonts/Cairo-Variable.ttf'),
    'Rakkas-Regular': require('../assets/fonts/Rakkas-Regular.ttf'),
    'ArefRuqaa-Regular': require('../assets/fonts/ArefRuqaa-Regular.ttf'),
  });

  // Safety net: never block the whole app on the splash forever if native font
  // loading stalls in a release build. After a short wait we render anyway and
  // fall back to system fonts (custom fonts apply once they finish loading).
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const canRender = fontsLoaded || !!fontError || fontTimedOut;

  // Hide the native splash as soon as we're willing to render, so a stalled
  // dependency downstream can never keep it up indefinitely.
  useEffect(() => {
    if (canRender) SplashScreen.hideAsync().catch(() => {});
  }, [canRender]);

  if (!canRender) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider>
            <RootStack />
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
