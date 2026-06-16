import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type PlaybackListener = (key: string | null, isPlaying: boolean) => void;

let player: AudioPlayer | null = null;
let currentKey: string | null = null;
const listeners = new Set<PlaybackListener>();
let _seqItems: { key: string; url: string }[] = [];
let _seqIdx = 0;
let _seqId: string | null = null;

function notify(isPlaying: boolean) {
  for (const listener of listeners) listener(currentKey, isPlaying);
}

function ensurePlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null);
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        if (_seqItems.length > 0 && _seqIdx + 1 < _seqItems.length) {
          _seqIdx++;
          currentKey = _seqItems[_seqIdx].key;
          notify(true);
          // Delay replace+play so the event loop clears before loading the next track
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

/** Plays the given url; `key` identifies the playable item (e.g. an ayah key) so the UI can show which one is active. */
export function playAudio(key: string, url: string) {
  _seqItems = [];
  _seqIdx = 0;
  _seqId = null;
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

/** Plays a sequence of items one by one. `seqId` uniquely identifies this sequence so UI can track it. */
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
