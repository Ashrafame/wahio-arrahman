import chaptersRaw from '../../assets/data/chapters.json';
import hafsRaw from '../../assets/data/quran_hafs.json';
import qaloonRaw from '../../assets/data/quran_qaloon.json';
import translationEnRaw from '../../assets/data/translation_en_yusufali.json';
import muyassarRaw from '../../assets/data/tafsir_muyassar.json';

export type Qiraah = 'hafs' | 'qaloon';

export interface Chapter {
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  nameTranslationEn: string;
  revelationType: string;
  versesCount: number;
}

export interface Ayah {
  chapter: number;
  verse: number;
  key: string;
  textHafs: string;
  textQaloon: string;
  translationEn: string;
  tafsirMuyassar: string;
}

export const chapters: Chapter[] = chaptersRaw as Chapter[];

// Tanzil's Uthmani rasm encodes the trailing alef of tanween-fatha/damma/kasra
// endings (e.g. قَوْمًا) as a separate token, joined by a plain space, to mirror
// the printed Madinah Mushaf's calligraphy. Generic (non-Uthmanic) fonts render
// that space as a visible gap, so we join it back for display purposes only —
// the underlying letters and diacritics are untouched.
const TANWEEN_ALEF_GAP = /([ًࣰٌࣱٍࣲ]) ا/g;
function joinTrailingTanweenAlef(map: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in map) {
    result[key] = map[key].replace(TANWEEN_ALEF_GAP, '$1ا');
  }
  return result;
}

const hafsMap = joinTrailingTanweenAlef(hafsRaw as Record<string, string>);
const qaloonMap = joinTrailingTanweenAlef(qaloonRaw as Record<string, string>);
const translationEnMap = translationEnRaw as Record<string, string>;
const muyassarMap = muyassarRaw as Record<string, string>;

export function getChapter(number: number): Chapter | undefined {
  return chapters.find((c) => c.number === number);
}

export function getAyah(chapter: number, verse: number): Ayah {
  const key = `${chapter}:${verse}`;
  return {
    chapter,
    verse,
    key,
    textHafs: hafsMap[key] ?? '',
    textQaloon: qaloonMap[key] ?? '',
    translationEn: translationEnMap[key] ?? '',
    tafsirMuyassar: muyassarMap[key] ?? '',
  };
}

export function getAyahText(chapter: number, verse: number, qiraah: Qiraah): string {
  const key = `${chapter}:${verse}`;
  return (qiraah === 'hafs' ? hafsMap : qaloonMap)[key] ?? '';
}

export function getVerseCount(chapter: number, qiraah: Qiraah = 'hafs'): number {
  const map = qiraah === 'hafs' ? hafsMap : qaloonMap;
  let count = 0;
  while (map[`${chapter}:${count + 1}`]) count++;
  return count || (getChapter(chapter)?.versesCount ?? 0);
}

export function getSurahAyahs(chapter: number, qiraah: Qiraah = 'hafs'): Ayah[] {
  const count = getVerseCount(chapter, qiraah);
  const ayahs: Ayah[] = [];
  for (let v = 1; v <= count; v++) {
    ayahs.push(getAyah(chapter, v));
  }
  return ayahs;
}

export interface SearchResult {
  chapter: number;
  verse: number;
  snippet: string;
  matchedIn: 'arabic' | 'translation';
  /** How many ayahs in this chapter match the query (Arabic only). */
  countInSurah: number;
  /** Total matching ayahs across the whole Quran (Arabic only). */
  countInQuran: number;
  /** Total distinct surahs that contain the query (Arabic only). */
  totalSurahCount: number;
}

export function searchQuran(query: string, qiraah: Qiraah, limit = 100): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const normalizedQuery = normalizeArabic(q);
  const textMap = qiraah === 'hafs' ? hafsMap : qaloonMap;

  // First pass: scan all ayahs without limit to compute accurate counts
  const arabicHits: { chapter: number; verse: number; snippet: string }[] = [];
  const translationHits: { chapter: number; verse: number; snippet: string }[] = [];

  for (const key of Object.keys(textMap)) {
    const [chapterStr, verseStr] = key.split(':');
    const chapter = Number(chapterStr);
    const verse = Number(verseStr);
    const arabicText = textMap[key];

    if (normalizedQuery && normalizeArabic(arabicText).includes(normalizedQuery)) {
      arabicHits.push({ chapter, verse, snippet: arabicText });
      continue;
    }

    const translation = translationEnMap[key];
    if (translation && translation.toLowerCase().includes(qLower)) {
      translationHits.push({ chapter, verse, snippet: translation });
    }
  }

  const countInQuran = arabicHits.length;
  const surahCounts: Record<number, number> = {};
  for (const h of arabicHits) {
    surahCounts[h.chapter] = (surahCounts[h.chapter] ?? 0) + 1;
  }
  const totalSurahCount = Object.keys(surahCounts).length;

  const all: SearchResult[] = [
    ...arabicHits.map(h => ({
      ...h,
      matchedIn: 'arabic' as const,
      countInSurah: surahCounts[h.chapter] ?? 0,
      countInQuran,
      totalSurahCount,
    })),
    ...translationHits.map(h => ({
      ...h,
      matchedIn: 'translation' as const,
      countInSurah: 0,
      countInQuran: 0,
      totalSurahCount: 0,
    })),
  ].sort((a, b) => a.chapter === b.chapter ? a.verse - b.verse : a.chapter - b.chapter);

  return all.slice(0, limit);
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[ٱآأإ]/g, 'ا')
    .replace(/[ً-ٟؐ-ؚۖ-ࣰۭ-ࣿ]/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[‌‍‎]/g, '')
    .trim()
    .toLowerCase();
}

export interface AyahLocation {
  chapter: number;
  verse: number;
}

// Parses queries like "2:255", "2 255", "البقرة 255", or a surah name to find a direct jump target.
export function parseDirectReference(query: string): AyahLocation | { chapter: number } | null {
  const trimmed = query.trim();
  const refMatch = trimmed.match(/^(\d{1,3})\s*[:\-،,]?\s*(\d{1,3})$/);
  if (refMatch) {
    const chapter = Number(refMatch[1]);
    const verse = Number(refMatch[2]);
    const meta = getChapter(chapter);
    if (meta && verse >= 1 && verse <= meta.versesCount) {
      return { chapter, verse };
    }
  }

  const numMatch = trimmed.match(/^(\d{1,3})$/);
  if (numMatch) {
    const chapter = Number(numMatch[1]);
    if (getChapter(chapter)) return { chapter };
  }

  // Surah-name matching: require at least 4 characters to avoid short common
  // words (في، الم، من…) being hijacked into a direct-navigation card.
  const byName = trimmed.length >= 4 ? chapters.find(
    (c) =>
      normalizeArabic(c.nameArabic).includes(normalizeArabic(trimmed)) ||
      c.nameTransliteration.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.nameTranslationEn.toLowerCase().includes(trimmed.toLowerCase())
  ) : undefined;
  if (byName) return { chapter: byName.number };

  return null;
}
