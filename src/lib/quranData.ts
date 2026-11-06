import chaptersRaw from '../../assets/data/chapters.json';
import hafsRaw from '../../assets/data/quran_hafs.json';
import qaloonRaw from '../../assets/data/quran_qaloon.json';
import translationEnRaw from '../../assets/data/translation_en_yusufali.json';
import muyassarRaw from '../../assets/data/tafsir_muyassar.json';

export type Qiraah = 'hafs' | 'qaloon';

// The Qaloon text has no verified source yet, so it is hidden from the UI until
// an authenticated text (e.g. from the King Fahd Complex) is bundled.
export const QALOON_ENABLED = false;

// Attribution required by the Tanzil licence (shown on the About screen).
export const QURAN_TEXT_SOURCE = {
  nameAr: 'مشروع تنزيل — نص المصحف بالرسم العثماني، الإصدار 1.1',
  nameEn: 'Tanzil Project — Uthmani Quran text, version 1.1',
  url: 'https://tanzil.net',
};

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

// The Hafs text is the Tanzil Uthmani text, copied verbatim and checked against
// the source on every build (scripts/quran-text.mjs). It must be displayed
// exactly as stored: never normalise, replace or strip characters from it.
const tanzilAyahs = (hafsRaw as { ayahs: Record<string, string> }).ayahs;

// Tanzil prefixes ayah 1 of every surah except Al-Fatiha and At-Tawbah with the
// basmala (four words). The printed Mushaf shows it above the surah instead, so
// we cut the text at that word boundary: the reader shows BASMALA as a header and
// the rest as ayah 1. Both are verbatim substrings of the Tanzil text, and
// scripts/quran-text.mjs checks that every split rejoins to the original exactly.
export const BASMALA = tanzilAyahs['1:1'];
const BASMALA_WORDS = BASMALA.split(' ').length;

function splitBasmala(chapter: number, text: string): { basmala: string | null; rest: string } {
  if (chapter === 1 || chapter === 9) return { basmala: null, rest: text };
  const words = text.split(' ');
  const expected = BASMALA.split(' ');
  const isBasmala = expected.every((w, i) => i === 0 || words[i] === w);
  if (!isBasmala || words.length <= BASMALA_WORDS) return { basmala: null, rest: text };
  return {
    basmala: words.slice(0, BASMALA_WORDS).join(' '),
    rest: words.slice(BASMALA_WORDS).join(' '),
  };
}

const hafsMap: Record<string, string> = {};
for (const key in tanzilAyahs) {
  const [chapter, verse] = key.split(':').map(Number);
  hafsMap[key] = verse === 1 ? splitBasmala(chapter, tanzilAyahs[key]).rest : tanzilAyahs[key];
}
const qaloonMap = qaloonRaw as Record<string, string>;

// Tanzil writes each waqf mark (U+06D6–U+06DC: ۖ ۗ ۘ ۙ ۚ ۛ ۜ) after a space, so
// it sits on the space and iOS draws it far above the word. For DISPLAY only, we
// drop that one space so the mark sits on the last letter of its word, as in the
// printed Mushaf. Nothing else changes: scripts/quran-text.mjs verifies that this
// removes only spaces. Copying an ayah still gives the verbatim Tanzil text.
const SPACE_BEFORE_WAQF = / (?=[ۖ-ۜ])/g;
export function displayAyahText(text: string): string {
  return text.replace(SPACE_BEFORE_WAQF, '');
}

/** Ayah-end marker shown after the ayah, as in the Mushaf: ﴿255﴾ */
export function ayahEndMarker(verse: number): string {
  return `﴿${verse}﴾`;
}
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

// Converts dagger alef (ٰ) to alef, enabling matches for words like صراط and مالك.
function normalizeArabicExpanded(text: string): string {
  return text
    .replace(/[ٱآأإ]/g, 'ا')
    .replace(/وٰ/g, 'ا')
    .replace(/ٰ/g, 'ا')
    .replace(/[ً-ٟؐ-ؚۖ-ࣰۭ-ࣿ]/g, '')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[‌‍‎]/g, '')
    .replace(/ـ/g, '') // tatweel (Tanzil uses it before superscript alef)
    .trim()
    .toLowerCase();
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

    if (normalizedQuery && (
      normalizeArabic(arabicText).includes(normalizedQuery) ||
      normalizeArabicExpanded(arabicText).includes(normalizedQuery)
    )) {
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

// Converts Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) to Western digits so numeric
// queries work regardless of which digit set the user types.
export function normalizeArabicNumerals(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function normalizeArabic(text: string): string {
  return text
    .replace(/[ٱآأإ]/g, 'ا')
    .replace(/ٰ/g, '')
    .replace(/[ً-ٟؐ-ؚۖ-ࣰۭ-ࣿ]/g, '')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[‌‍‎]/g, '')
    .replace(/ـ/g, '') // tatweel (Tanzil uses it before superscript alef)
    .trim()
    .toLowerCase();
}

export interface AyahLocation {
  chapter: number;
  verse: number;
}

// Parses only numeric ayah references like "2:255"; ignores surah names.
// Used by the verse search screen to provide a direct-navigation shortcut
// without mixing in surah-name look-ups.
export function parseAyahReference(query: string): AyahLocation | null {
  const trimmed = normalizeArabicNumerals(query.trim());
  const refMatch = trimmed.match(/^(\d{1,3})\s*[:\-،,]?\s*(\d{1,3})$/);
  if (refMatch) {
    const chapter = Number(refMatch[1]);
    const verse = Number(refMatch[2]);
    const meta = getChapter(chapter);
    if (meta && verse >= 1 && verse <= meta.versesCount) {
      return { chapter, verse };
    }
  }
  return null;
}

// Parses queries like "2:255", "2 255", "البقرة 255", or a surah name to find a direct jump target.
export function parseDirectReference(query: string): AyahLocation | { chapter: number } | null {
  const trimmed = normalizeArabicNumerals(query.trim());
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
