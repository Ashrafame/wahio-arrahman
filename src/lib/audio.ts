import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type PlaybackListener = (key: string | null, isPlaying: boolean) => void;
type PositionListener = (positionMs: number, durationMs: number) => void;

let player: AudioPlayer | null = null;
let currentKey: string | null = null;
const listeners = new Set<PlaybackListener>();
const positionListeners = new Set<PositionListener>();
let _seqItems: { key: string; url: string }[] = [];
let _seqIdx = 0;
let _seqId: string | null = null;

function notify(isPlaying: boolean) {
  for (const listener of listeners) listener(currentKey, isPlaying);
}

function notifyPosition(posMs: number, durMs: number) {
  for (const listener of positionListeners) listener(posMs, durMs);
}

function ensurePlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null, { updateInterval: 250 });
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.playing && status.currentTime > 0) {
        notifyPosition(Math.round(status.currentTime * 1000), Math.round((status.duration || 0) * 1000));
      }
      if (status.didJustFinish) {
        if (_seqItems.length > 0 && _seqIdx + 1 < _seqItems.length) {
          _seqIdx++;
          currentKey = _seqItems[_seqIdx].key;
          notify(true);
          const nextUrl = _seqItems[_seqIdx].url;
          setTimeout(() => {
            if (_seqItems.length > 0) {
              player!.replace({ uri: nextUrl });
              player!.play();
            }
          }, 200);
        } else {
          _seqItems = [];
          _seqIdx = 0;
          _seqId = null;
          currentKey = null;
          notify(false);
        }
      }
    });
  }
  return player;
}

export function playAudio(key: string, url: string) {
  _seqItems = [];
  _seqIdx = 0;
  _seqId = null;
  const p = ensurePlayer();
  if (currentKey === key) {
    if (p.playing) {
      p.pause();
      notify(false);
    } else {
      // Same file paused — resume from current position instead of restarting
      p.play();
      notify(true);
    }
    return;
  }
  currentKey = key;
  p.replace({ uri: url });
  p.play();
  notify(true);
}

/** Pause without resetting position or sequence state. */
export function pauseAudio() {
  if (!player) return;
  player.pause();
  notify(false);
}

/** Resume a paused player (single file or sequence) from where it stopped. */
export function resumeAudio() {
  if (!player || !currentKey) return;
  player.play();
  notify(true);
}

export function playSequence(seqId: string, items: { key: string; url: string }[]) {
  if (!items.length) return;
  _seqItems = items;
  _seqIdx = 0;
  _seqId = seqId;
  const p = ensurePlayer();
  currentKey = items[0].key;
  p.replace({ uri: items[0].url });
  p.play();
  notify(true);
}

export function stopAudio() {
  _seqItems = [];
  _seqIdx = 0;
  _seqId = null;
  if (!player) return;
  player.pause();
  currentKey = null;
  notify(false);
}

export function getCurrentAudioKey(): string | null {
  return currentKey;
}

export function getCurrentSequenceId(): string | null {
  return _seqId;
}

export function subscribeAudio(listener: PlaybackListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribePosition(listener: PositionListener): () => void {
  positionListeners.add(listener);
  return () => positionListeners.delete(listener);
}

/** Seek the current player to positionSeconds after it loads. */
export async function seekTo(positionSeconds: number): Promise<void> {
  if (!player) return;
  try {
    await player.seekTo(positionSeconds);
  } catch {
    // Ignore seek errors (e.g. called before file loads)
  }
}
