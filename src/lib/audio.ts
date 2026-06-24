import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

type PlaybackListener = (key: string | null, isPlaying: boolean) => void;
type PositionListener = (positionMs: number, durationMs: number) => void;

const listeners = new Set<PlaybackListener>();
const positionListeners = new Set<PositionListener>();
let currentKey: string | null = null;
let _seqItems: { key: string; url: string }[] = [];
let _seqIdx = 0;
let _seqId: string | null = null;

function notify(isPlaying: boolean) {
  for (const l of listeners) l(currentKey, isPlaying);
}
function notifyPosition(posMs: number, durMs: number) {
  for (const l of positionListeners) l(posMs, durMs);
}

// ── solo player (single-file playback) ────────────────────────────────────────
let _solo: AudioPlayer | null = null;
function getSolo(): AudioPlayer {
  if (!_solo) _solo = createAudioPlayer(null, { updateInterval: 250 });
  return _solo;
}

// ── gapless sequence: two alternating players ─────────────────────────────────
//
// Pattern: one player is "active" (currently playing), the other is "buffer"
// (silently pre-loading the next ayah). On transition we just call play() on
// the already-loaded buffer — no replace(), no decode startup, no gap.
//
// Critically: replace() is only ever called on the BUFFER player, not the
// active one. On Android, replace() triggers a spurious didJustFinish for the
// old track; because the active player's listener never sees replace(), that
// spurious event is naturally discarded without any guards.
let _pA: AudioPlayer | null = null;
let _pB: AudioPlayer | null = null;
let _isA = true;         // true → pA active, pB buffer
let _sub: { remove: () => void } | null = null;
let _bufLoadedFor = -1; // _seqIdx whose next track is already loaded in buffer()

function _active(): AudioPlayer | null { return _isA ? _pA : _pB; }
function _buffer(): AudioPlayer | null { return _isA ? _pB : _pA; }

function _ensureSeqPlayers(): void {
  if (!_pA) _pA = createAudioPlayer(null, { updateInterval: 250 });
  if (!_pB) _pB = createAudioPlayer(null, { updateInterval: 250 });
}

function _attachSeqListener(): void {
  _sub?.remove();
  _sub = null;
  const a = _active();
  if (!a) return;
  _sub = a.addListener('playbackStatusUpdate', (status) => {
    if (status.playing && status.currentTime > 0) {
      notifyPosition(
        Math.round(status.currentTime * 1000),
        Math.round((status.duration || 0) * 1000),
      );

      // On the first status update for this ayah, load the NEXT ayah into
      // the buffer player. This gives it the full duration of the current
      // ayah to decode and buffer before we need it.
      const nextIdx = _seqIdx + 1;
      if (
        _seqItems.length > 0 &&
        nextIdx < _seqItems.length &&
        _bufLoadedFor !== _seqIdx
      ) {
        _bufLoadedFor = _seqIdx;
        const buf = _buffer();
        if (buf) {
          buf.replace({ uri: _seqItems[nextIdx].url });
          // On Android, replace() internally calls play() after setting the
          // source (ExoPlayer behavior). Immediately pause so the buffer
          // player loads silently without producing sound.
          buf.pause();
        }
      }
    }

    if (status.didJustFinish) {
      const nextIdx = _seqIdx + 1;
      if (_seqItems.length > 0 && nextIdx < _seqItems.length) {
        _seqIdx = nextIdx;
        currentKey = _seqItems[_seqIdx].key;
        notify(true);

        // Swap roles: the pre-loaded buffer becomes the new active player
        _isA = !_isA;

        // play() on an already-loaded player is instant — no decode startup
        _active()!.play();

        // Move the listener to the new active player.
        // Its first callback will buffer the next-next ayah into the new buffer.
        _attachSeqListener();
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

// ── public API ────────────────────────────────────────────────────────────────

export function playAudio(key: string, url: string) {
  _stopSeq();
  const p = getSolo();
  if (currentKey === key) {
    if (p.playing) { p.pause(); notify(false); }
    else { p.play(); notify(true); }
    return;
  }
  currentKey = key;
  p.replace({ uri: url });
  p.play();
  notify(true);
}

function _stopSeq() {
  _sub?.remove(); _sub = null;
  if (_seqItems.length > 0) {
    _pA?.pause();
    _pB?.pause();
    _seqItems = [];
    _seqIdx = 0;
    _seqId = null;
    _bufLoadedFor = -1;
  }
}

/** Pause without resetting position or sequence state. */
export function pauseAudio() {
  if (_seqItems.length > 0) _active()?.pause();
  else _solo?.pause();
  notify(false);
}

/** Resume a paused player (single file or sequence) from where it stopped. */
export function resumeAudio() {
  if (!currentKey) return;
  if (_seqItems.length > 0) _active()?.play();
  else _solo?.play();
  notify(true);
}

export function playSequence(seqId: string, items: { key: string; url: string }[]) {
  if (!items.length) return;
  _solo?.pause();
  _ensureSeqPlayers();
  _seqItems = items;
  _seqIdx = 0;
  _seqId = seqId;
  _isA = true;
  _bufLoadedFor = -1;
  currentKey = items[0].key;
  _active()!.replace({ uri: items[0].url });
  _active()!.play();
  notify(true);
  // The listener will buffer items[1] into the buffer player on its first callback
  _attachSeqListener();
}

export function stopAudio() {
  _sub?.remove(); _sub = null;
  _seqItems = [];
  _seqIdx = 0;
  _seqId = null;
  _bufLoadedFor = -1;
  _pA?.pause();
  _pB?.pause();
  _solo?.pause();
  currentKey = null;
  notify(false);
}

export function getCurrentAudioKey(): string | null { return currentKey; }
export function getCurrentSequenceId(): string | null { return _seqId; }

export function subscribeAudio(listener: PlaybackListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function subscribePosition(listener: PositionListener): () => void {
  positionListeners.add(listener);
  return () => positionListeners.delete(listener);
}

export async function seekTo(positionSeconds: number): Promise<void> {
  const p = _seqItems.length > 0 ? _active() : _solo;
  if (!p) return;
  try { await p.seekTo(positionSeconds); } catch { /* ignore */ }
}
