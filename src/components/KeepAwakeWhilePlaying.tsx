import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { subscribeAudio, getCurrentAudioKey } from '../lib/audio';

const TAG = 'quran-audio';

/**
 * Keeps the screen awake ONLY while recitation is actively playing, so a user
 * following the highlighted ayah isn't cut off by auto-lock. When playback
 * pauses or stops, normal auto-lock resumes. (Background playback keeps the
 * audio going even if the screen does lock — this only governs the display.)
 *
 * Renders nothing.
 */
export function KeepAwakeWhilePlaying() {
  useEffect(() => {
    const apply = (isPlaying: boolean) => {
      if (isPlaying) activateKeepAwakeAsync(TAG).catch(() => {});
      else deactivateKeepAwake(TAG).catch(() => {});
    };
    // Reflect current state on mount, then follow updates.
    apply(!!getCurrentAudioKey());
    const unsub = subscribeAudio((_key, isPlaying) => apply(isPlaying));
    return () => {
      unsub();
      deactivateKeepAwake(TAG).catch(() => {});
    };
  }, []);

  return null;
}
