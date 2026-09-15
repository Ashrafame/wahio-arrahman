import asbabRaw from '../../assets/data/asbab_nuzul.json';

// Asbab al-Nuzul (أسباب النزول) — the occasions/reasons a verse was revealed.
//
// These are INDEPENDENT of the qiraah: the historical event is identical
// whether the verse is read in Hafs, Qaloon, or any other narration, so a
// single text serves all riwayat.
//
// Source: Tafsir Center for Quranic Studies (مركز تفسير) — an Ahl al-Sunnah
// institution. Each entry holds the narration together with its full isnad
// (chain of transmission), exactly as compiled, without programmatic
// segmentation between sanad and matn.
//
// Coverage is sparse by nature — only ~201 verses across 83 surahs have a
// recorded sabab — so most lookups intentionally return null and no icon is
// shown for those ayahs. Keyed by "surah:ayah".
const asbabMap = asbabRaw as Record<string, string>;

export function getAsbabNuzul(chapter: number, verse: number): string | null {
  return asbabMap[`${chapter}:${verse}`] ?? null;
}

export function hasAsbabNuzul(chapter: number, verse: number): boolean {
  return !!asbabMap[`${chapter}:${verse}`];
}

export interface AsbabSurahGroup {
  chapter: number;
  /** Ayah numbers in this surah that have a recorded sabab, ascending. */
  verses: number[];
}

/**
 * All verses that have a recorded sabab, grouped by surah and sorted —
 * used to build the Asbab al-Nuzul index screen.
 */
export function getAsbabIndex(): AsbabSurahGroup[] {
  const bySurah: Record<number, number[]> = {};
  for (const key of Object.keys(asbabMap)) {
    const [s, a] = key.split(':').map(Number);
    (bySurah[s] ??= []).push(a);
  }
  return Object.keys(bySurah)
    .map(Number)
    .sort((a, b) => a - b)
    .map((chapter) => ({ chapter, verses: bySurah[chapter].sort((a, b) => a - b) }));
}

/** Total number of verses that have a recorded sabab. */
export function getAsbabCount(): number {
  return Object.keys(asbabMap).length;
}
