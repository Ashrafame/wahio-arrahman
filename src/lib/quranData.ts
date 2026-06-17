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
}

export function searchQuran(query: string, qiraah: Qiraah, limit = 100): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const normalizedArabic = normalizeArabic(q);
  const results: SearchResult[] = [];
  const textMap = qiraah === 'hafs' ? hafsMap : qaloonMap;

  for (const key of Object.keys(textMap)) {
    if (results.length >= limit) break;
    const [chapterStr, verseStr] = key.split(':');
    const chapter = Number(chapterStr);
    const verse = Number(verseStr);
    const arabicText = textMap[key];
    const normalizedText = normalizeArabic(arabicText);

    if (normalizedArabic && normalizedText.includes(normalizedArabic)) {
      results.push({ chapter, verse, snippet: arabicText, matchedIn: 'arabic' });
      continue;
    }

    const translation = translationEnMap[key];
    if (translation && translation.toLowerCase().includes(qLower)) {
      results.push({ chapter, verse, snippet: translation, matchedIn: 'translation' });
    }
  }

  return results.sort((a, b) => (a.chapter === b.chapter ? a.verse - b.verse : a.chapter - b.chapter));
}

// Strips Arabic diacritics (tashkeel) so search ignores them.
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٟؐ-ؚۖ-ࣰۭ-ࣿ]/g, '')
    .replace(/[ٱآأإ]/g, 'ا')
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

  const byName = chapters.find(
    (c) =>
      normalizeArabic(c.nameArabic).includes(normalizeArabic(trimmed)) ||
      c.nameTransliteration.toLowerCase().includes(trimmed.toLowerCase()) ||
      c.nameTranslationEn.toLowerCase().includes(trimmed.toLowerCase())
  );
  if (byName) return { chapter: byName.number };

  return null;
}
