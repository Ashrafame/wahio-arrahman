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

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme, ready } = useSettings();
  const palette = getPalette(theme);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

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
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="tools/index" options={{ headerShown: false }} />
        <Stack.Screen name="tools/prayer-times" options={{ headerShown: false }} />
        <Stack.Screen name="tools/qibla" options={{ headerShown: false }} />
        <Stack.Screen name="tools/tasbih" options={{ headerShown: false }} />
        <Stack.Screen name="tools/azkar/index" options={{ headerShown: false }} />
        <Stack.Screen name="tools/azkar/[category]" options={{ headerShown: false }} />
        <Stack.Screen name="tools/hijri-calendar" options={{ headerShown: false }} />
        <Stack.Screen name="tools/riwayat" options={{ headerShown: false }} />
      </Stack>
      <SplashOverlay />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'ScheherazadeNew-Regular': require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
    'ScheherazadeNew-Bold': require('../assets/fonts/ScheherazadeNew-Bold.ttf'),
    'Cairo-Variable': require('../assets/fonts/Cairo-Variable.ttf'),
    'ReemKufi-Regular': require('../assets/fonts/ReemKufi-Regular.ttf'),
    'Jomhuria-Regular': require('../assets/fonts/Jomhuria-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <RootStack />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
