import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { ensureAudioMode } from './audio';

// Full-length athan recordings, keyed by the `athanSound` id (matches MUEZZINS
// and ATHAN_SOUNDS). Add licensed recordings here as they ship.
export const ATHAN_FULL: Record<string, any> = {
  ash: require('../../assets/sounds/athan_ash.mp3'),
};

// ── Preview player (Settings: tap to hear an athan, tap again to stop) ─────────
let _preview: AudioPlayer | null = null;
let _previewId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function notify(id: string | null) {
  for (const l of listeners) l(id);
}

/** Subscribe to preview changes; callback gets the currently-playing id or null. */
export function onAthanPreviewChange(cb: (id: string | null) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function currentAthanPreview(): string | null {
  return _previewId;
}

export function stopAthanPreview(): void {
  const p = _preview;
  _preview = null;
  _previewId = null;
  notify(null);
  // pause() actually halts the audio; remove() only releases the player and
  // does NOT reliably stop playback on its own.
  try {
    p?.pause();
  } catch {
    /* ignore */
  }
  try {
    p?.remove();
  } catch {
    /* ignore */
  }
}

/** Play the athan for `id`, or stop it if it's already the one playing. */
export async function toggleAthanPreview(id: string): Promise<void> {
  if (_previewId === id) {
    stopAthanPreview();
    return;
  }
  stopAthanPreview();
  const src = ATHAN_FULL[id];
  if (!src) return;
  try {
    await ensureAudioMode();
    const p = createAudioPlayer(src, { updateInterval: 300 });
    _preview = p;
    _previewId = id;
    notify(id);
    let started = false;
    p.addListener('playbackStatusUpdate', (status) => {
      if (_preview !== p) return; // a newer preview replaced this one
      if (status.didJustFinish) {
        stopAthanPreview();
        return;
      }
      // Start only once the asset is actually loaded — calling play() before
      // the bundled mp3 finishes loading is a silent no-op.
      if (!started && status.isLoaded) {
        started = true;
        try { p.play(); } catch { /* ignore */ }
      }
    });
    try { p.play(); } catch { /* in case it's already loaded */ }
  } catch {
    stopAthanPreview();
  }
}
