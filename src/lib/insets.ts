// Bottom insets.
//
// Since Expo SDK 54, Android apps are drawn edge-to-edge: the system navigation
// bar (three buttons or the gesture handle) sits ON TOP of the app. The root
// stack (app/_layout.tsx) therefore pads every screen by the navigation bar's
// height on Android, so nothing in a screen ends up under it. iOS is unchanged.

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of Android's navigation bar (0 on iOS). Use inside full-screen
 *  modals and bottom sheets, which are not padded by the root stack. */
export function useAndroidNavBarInset(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' ? insets.bottom : 0;
}

/** Bottom inset a screen of the root stack still has to leave for itself:
 *  the iOS home indicator. On Android the root stack has already padded it. */
export function useScreenBottomInset(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios' ? insets.bottom : 0;
}
