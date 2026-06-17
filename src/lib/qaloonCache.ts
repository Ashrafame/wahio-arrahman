import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { JUZ_DATA_QALOON } from '../data/juz';

const ARCHIVE_BASE =
  'https://archive.org/download/128kb--quran--ahmad--khedr--altrabolsy---by---qaloon-----6236---ayaat-----__ve';

const CACHE_DIR = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}qaloon_trablsi/`;

const activeDownloads = new Set<number>();

// ── Listeners so the UI can show download progress ──────────────────────────
export type DownloadEvent =
  | { juz: number; status: 'downloading'; progress: number } // 0-1
  | { juz: number; status: 'extracting' }
  | { juz: number; status: 'done' }
  | { juz: number; status: 'error'; message: string };

type DownloadListener = (event: DownloadEvent) => void;
const downloadListeners = new Set<DownloadListener>();

export function subscribeDownloads(listener: DownloadListener): () => void {
  downloadListeners.add(listener);
  return () => downloadListeners.delete(listener);
}

function emit(event: DownloadEvent) {
  for (const l of downloadListeners) l(event);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, '0'); }
function pad3(n: number) { return String(n).padStart(3, '0'); }

export function getJuzForAyah(chapter: number, verse: number): number {
  for (let i = JUZ_DATA_QALOON.length - 1; i >= 0; i--) {
    const j = JUZ_DATA_QALOON[i];
    if (chapter > j.startSurah || (chapter === j.startSurah && verse >= j.startAyah)) {
      return j.number;
    }
  }
  return 1;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Returns local file:// URI if cached, null otherwise. */
export async function getTrablsiCachedUri(chapter: number, verse: number): Promise<string | null> {
  const path = `${CACHE_DIR}${pad3(chapter)}${pad3(verse)}.mp3`;
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export function isJuzDownloading(juz: number): boolean {
  return activeDownloads.has(juz);
}

/**
 * Fire-and-forget: downloads + extracts the Juz ZIP for this ayah.
 * Safe to call multiple times — deduplicates concurrent downloads automatically.
 */
export function triggerJuzDownload(chapter: number, verse: number): void {
  const juz = getJuzForAyah(chapter, verse);
  if (activeDownloads.has(juz)) return;
  activeDownloads.add(juz);
  _downloadAndExtractJuz(juz).finally(() => activeDownloads.delete(juz));
}

// ── Internal ─────────────────────────────────────────────────────────────────

async function _downloadAndExtractJuz(juz: number): Promise<void> {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

    const zipPath = `${CACHE_DIR}_juz${pad2(juz)}.zip`;
    const zipUrl = `${ARCHIVE_BASE}/${pad2(juz)}.zip`;

    // Download with progress
    emit({ juz, status: 'downloading', progress: 0 });
    const download = FileSystem.createDownloadResumable(
      zipUrl,
      zipPath,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) {
          emit({ juz, status: 'downloading', progress: totalBytesWritten / totalBytesExpectedToWrite });
        }
      },
    );
    const result = await download.downloadAsync();
    if (!result?.uri) throw new Error('Download returned no URI');

    // Extract
    emit({ juz, status: 'extracting' });
    const base64 = await FileSystem.readAsStringAsync(zipPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = new JSZip();
    await zip.loadAsync(base64, { base64: true });

    // Collect all ######.mp3 files anywhere inside the ZIP (folder name may vary)
    const entries: { name: string; obj: JSZip.JSZipObject }[] = [];
    zip.forEach((relativePath, fileObj) => {
      if (!fileObj.dir) {
        const basename = relativePath.split('/').pop() ?? '';
        if (/^\d{6}\.mp3$/i.test(basename)) {
          entries.push({ name: basename, obj: fileObj });
        }
      }
    });

    // Write one file at a time to keep peak memory low
    for (const { name, obj } of entries) {
      const data = await obj.async('base64');
      await FileSystem.writeAsStringAsync(`${CACHE_DIR}${name}`, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    await FileSystem.deleteAsync(zipPath, { idempotent: true });
    emit({ juz, status: 'done' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn(`[qaloonCache] Juz ${juz} failed:`, message);
    emit({ juz, status: 'error', message });
  }
}
