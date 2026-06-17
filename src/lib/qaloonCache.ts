import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';
import { JUZ_DATA_QALOON } from '../data/juz';

const ARCHIVE_BASE =
  'https://archive.org/download/128kb--quran--ahmad--khedr--altrabolsy---by---qaloon-----6236---ayaat-----__ve';

const CACHE_DIR = `${FileSystem.documentDirectory}qaloon_trablsi/`;

const activeDownloads = new Set<number>();

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function pad3(n: number) {
  return String(n).padStart(3, '0');
}

function getJuzForAyah(chapter: number, verse: number): number {
  for (let i = JUZ_DATA_QALOON.length - 1; i >= 0; i--) {
    const j = JUZ_DATA_QALOON[i];
    if (chapter > j.startSurah || (chapter === j.startSurah && verse >= j.startAyah)) {
      return j.number;
    }
  }
  return 1;
}

/** Returns local URI if the ayah is already cached, null otherwise. */
export async function getTrablsiCachedUri(chapter: number, verse: number): Promise<string | null> {
  const path = `${CACHE_DIR}${pad3(chapter)}${pad3(verse)}.mp3`;
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

/**
 * Fire-and-forget: downloads and extracts the Juz ZIP that contains this ayah.
 * Safe to call multiple times — deduplicates concurrent downloads.
 */
export function triggerJuzDownload(chapter: number, verse: number): void {
  const juz = getJuzForAyah(chapter, verse);
  if (activeDownloads.has(juz)) return;
  activeDownloads.add(juz);
  _downloadAndExtractJuz(juz).finally(() => activeDownloads.delete(juz));
}

async function _downloadAndExtractJuz(juz: number): Promise<void> {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

    const zipPath = `${CACHE_DIR}_juz${pad2(juz)}.zip`;
    await FileSystem.downloadAsync(
      `${ARCHIVE_BASE}/${pad2(juz)}.zip`,
      zipPath,
    );

    // Read entire ZIP as base64 then hand to JSZip
    const base64 = await FileSystem.readAsStringAsync(zipPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = new JSZip();
    await zip.loadAsync(base64, { base64: true });

    // Files live in a folder matching the juz number, e.g. "01/001001.mp3"
    const folder = zip.folder(pad2(juz));
    if (!folder) return;

    // Extract one file at a time to keep peak memory low
    const entries: { name: string; obj: JSZip.JSZipObject }[] = [];
    folder.forEach((relPath, fileObj) => {
      if (!fileObj.dir && /^\d{6}\.mp3$/.test(relPath)) {
        entries.push({ name: relPath, obj: fileObj });
      }
    });

    for (const { name, obj } of entries) {
      const data = await obj.async('base64');
      await FileSystem.writeAsStringAsync(`${CACHE_DIR}${name}`, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // Delete ZIP after extraction to free device storage
    await FileSystem.deleteAsync(zipPath, { idempotent: true });
  } catch (e) {
    // Fail silently — playback falls back to whole-surah URL
    console.warn(`[qaloonCache] Failed to download Juz ${juz}:`, e);
  }
}
