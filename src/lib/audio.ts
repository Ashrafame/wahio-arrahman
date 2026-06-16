import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type PlaybackListener = (key: string | null, isPlaying: boolean) => void;

let player: AudioPlayer | null = null;
let currentKey: string | null = null;
const listeners = new Set<PlaybackListener>();

function notify(isPlaying: boolean) {
  for (const listener of listeners) listener(currentKey, isPlaying);
}

function ensurePlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null);
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        currentKey = null;
        notify(false);
      }
    });
  }
  return player;
}

/** Plays the given url; `key` identifies the playable item (e.g. an ayah key) so the UI can show which one is active. */
export function playAudio(key: string, url: string) {
  const p = ensurePlayer();
  if (currentKey === key && p.playing) {
    p.pause();
    notify(false);
    return;
  }
  currentKey = key;
  p.replace({ uri: url });
  p.play();
  notify(true);
}

export function stopAudio() {
  if (!player) return;
  player.pause();
  currentKey = null;
  notify(false);
}

export function getCurrentAudioKey(): string | null {
  return currentKey;
}

export function subscribeAudio(listener: PlaybackListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
