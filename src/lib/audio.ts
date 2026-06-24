import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

type PlaybackListener = (key: string | null, isPlaying: boolean) => void;
type PositionListener = (positionMs: number, durationMs: number) => void;

let player: AudioPlayer | null = null;
let currentKey: string | null = null;
const listeners = new Set<PlaybackListener>();
const positionListeners = new Set<PositionListener>();
let _seqItems: { key: string; url: string }[] = [];
let _seqIdx = 0;
let _seqId: string | null = null;
let _hasPlayedCurrentItem = false;

// Gapless pre-fetch: remote URL → local cached path (in-memory index)
const _audioCache = new Map<string, string>();
let _preloadingUrl: string | null = null;

async function preloadNextUrl(url: string): Promise<void> {
  if (_audioCache.has(url) || _preloadingUrl === url) return;
  _preloadingUrl = url;
  try {
    const raw = url.split('?')[0].split('/').pop() ?? 'audio.mp3';
    const name = raw.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destFile = new File(Paths.cache, name);
    if (!destFile.exists) {
      await File.downloadFileAsync(url, destFile);
    }
    _audioCache.set(url, destFile.uri);
  } catch {
    // Ignore — transition will fall back to streaming the remote URL
  } finally {
    if (_preloadingUrl === url) _preloadingUrl = null;
  }
}

function localUri(url: string): string {
  return _audioCache.get(url) ?? url;
}

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
        const posMs = Math.round(status.currentTime * 1000);
        const durMs = Math.round((status.duration || 0) * 1000);
        notifyPosition(posMs, durMs);

        // Confirm the current item has genuinely played (> 0.5 s of real audio)
        if (status.currentTime > 0.5) _hasPlayedCurrentItem = true;

        // When 3 s remain, pre-download the next ayah to local cache so the
        // transition fires from disk — zero network latency at the boundary.
        const nextIdx = _seqIdx + 1;
        if (
          _seqItems.length > 0 &&
          nextIdx < _seqItems.length &&
          durMs > 0 &&
          durMs - posMs <= 3000
        ) {
          preloadNextUrl(_seqItems[nextIdx].url);
        }
      }

      if (status.didJustFinish) {
        // On Android, player.replace() triggers a spurious didJustFinish before
        // the new track has played any audio. Guard: only advance the sequence
        // when we have confirmed real playback of the current item (> 0.5 s).
        // Spurious events from replace() always fire before the new file plays,
        // so _hasPlayedCurrentItem is still false at that point.
        if (!_hasPlayedCurrentItem) return;
        _hasPlayedCurrentItem = false;

        if (_seqItems.length > 0 && _seqIdx + 1 < _seqItems.length) {
          _seqIdx++;
          currentKey = _seqItems[_seqIdx].key;
          notify(true);
          // Use the locally cached file if pre-fetch completed in time;
          // otherwise stream the remote URL directly (still no added delay).
          player!.replace({ uri: localUri(_seqItems[_seqIdx].url) });
          player!.play();
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
  _hasPlayedCurrentItem = false;
  const p = ensurePlayer();
  currentKey = items[0].key;
  // Eagerly pre-fetch the second ayah so it is ready the moment the first ends
  if (items.length > 1) preloadNextUrl(items[1].url);
  p.replace({ uri: localUri(items[0].url) });
  p.play();
  notify(true);
}

export function stopAudio() {
  _seqItems = [];
  _seqIdx = 0;
  _seqId = null;
  _hasPlayedCurrentItem = false;
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
