import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { useSettings } from '../store/SettingsContext';
import { ensureAudioMode } from '../lib/audio';

// Full-length athan recordings (played in-app). Keyed by the `athanSound` id,
// matching MUEZZINS / ATHAN_SOUNDS. Add licensed recordings here as they ship.
const ATHAN_FULL: Record<string, any> = {
  ash: require('../../assets/sounds/athan_ash.mp3'),
};

/**
 * Plays the FULL athan in-app when a prayer notification arrives while the app
 * is open, or when the user taps a prayer notification. (The background/closed
 * case is handled by the ≤30s notification clip, since iOS/Android can't play a
 * long sound while the app is killed.) Renders nothing.
 */
export function AthanPlayer() {
  const { athanMode, athanSound } = useSettings();
  const modeRef = useRef(athanMode);
  const soundRef = useRef(athanSound);
  modeRef.current = athanMode;
  soundRef.current = athanSound;
  const lastPlayed = useRef(0);
  const playerRef = useRef<AudioPlayer | null>(null);

  const playFullAthan = async () => {
    if (modeRef.current !== 'athan') return;
    const src = ATHAN_FULL[soundRef.current];
    if (!src) return;
    const now = Date.now();
    if (now - lastPlayed.current < 60_000) return; // guard against double-trigger
    lastPlayed.current = now;
    try {
      await ensureAudioMode();
      try {
        playerRef.current?.remove();
      } catch {
        /* ignore */
      }
      const p = createAudioPlayer(src);
      playerRef.current = p;
      p.play();
    } catch {
      /* best effort */
    }
  };

  useEffect(() => {
    const isPrayerAthan = (n: Notifications.Notification) =>
      (n.request.content.data as any)?.athan === true;

    const received = Notifications.addNotificationReceivedListener((n) => {
      if (isPrayerAthan(n)) playFullAthan();
    });
    const response = Notifications.addNotificationResponseReceivedListener((r) => {
      if (isPrayerAthan(r.notification)) playFullAthan();
    });
    return () => {
      received.remove();
      response.remove();
      try {
        playerRef.current?.remove();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
