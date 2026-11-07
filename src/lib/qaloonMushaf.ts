// The Libyan Awqaf Mushaf, Qaloon from Nafi — 612 printed pages as vector SVG.
//
// The pages are not bundled: each one is downloaded on first use (or all at
// once from Settings), checked against the SHA-256 recorded in the bundled
// index, and kept in the app's documents folder for offline reading. A page that
// fails the check is never saved or shown. The index (who sits where on each
// page) is built and verified by scripts/qaloon-mushaf.mjs.

import { Directory, File, Paths } from 'expo-file-system';
import { sha256 } from 'js-sha256';
import indexRaw from '../../assets/data/qaloon_libya.json';
import { chapters } from './quranData';

interface PageIndex {
  /** Optional zoom to the page's content (pages 1–2): [x, y, w, h] in page units. */
  v?: [number, number, number, number];
  /** SHA-256 of the page SVG. */
  h: string;
  /** [surah, ayah, [x, y, w, h, ...]] for every ayah (or part of one) on the page. */
  a: [number, number, number[]][];
}

interface MushafIndex {
  commit: string;
  width: number;
  height: number;
  pages: PageIndex[];
}

const index = indexRaw as unknown as MushafIndex;

export const QALOON_PAGE_COUNT = index.pages.length; // 612
export const QALOON_PAGE_WIDTH = index.width; // 1120
export const QALOON_PAGE_HEIGHT = index.height; // 2250
/** Approximate total download (compressed in transit). */
export const QALOON_DOWNLOAD_MB = 90;

export const QALOON_MUSHAF_SOURCE = {
  nameAr: 'مصحف الأوقاف الليبي — رواية قالون عن نافع',
  nameEn: 'Libyan Awqaf Mushaf — Qaloon from Nafi',
};

// Pages are served from the exact commit that added them, so they can never
// change underneath the recorded hashes. jsDelivr first, GitHub as a fallback.
const PAGE_PATH = 'assets/source/qaloon-libyan-awqaf';
const SOURCES = [
  `https://cdn.jsdelivr.net/gh/Ashrafame/wahio-arrahman@${index.commit}/${PAGE_PATH}`,
  `https://raw.githubusercontent.com/Ashrafame/wahio-arrahman/${index.commit}/${PAGE_PATH}`,
];

const pad3 = (n: number) => String(n).padStart(3, '0');
const pagesDir = () => new Directory(Paths.document, 'qaloon-libya');
const pageFile = (page: number) => new File(pagesDir(), `${pad3(page)}.svg`);

export interface PageAyah {
  surah: number;
  ayah: number;
  /** Rectangles in page units (1120 × 2250): [x, y, w, h, x, y, w, h, ...]. */
  rects: number[];
}

export function pageAyahs(page: number): PageAyah[] {
  return (index.pages[page - 1]?.a ?? []).map(([surah, ayah, rects]) => ({ surah, ayah, rects }));
}

/** The part of the page to show: [x, y, w, h] in page units. */
export function pageViewBox(page: number): [number, number, number, number] {
  return index.pages[page - 1]?.v ?? [0, 0, index.width, index.height];
}

/** The ayah at a point on the page (page units), if any. */
export function ayahAt(page: number, x: number, y: number): PageAyah | null {
  for (const item of pageAyahs(page)) {
    const r = item.rects;
    for (let i = 0; i < r.length; i += 4) {
      if (x >= r[i] && x <= r[i] + r[i + 2] && y >= r[i + 1] && y <= r[i + 1] + r[i + 3]) return item;
    }
  }
  return null;
}

/** First page on which each surah's first ayah appears. */
const surahStart: number[] = [];
index.pages.forEach((p, i) => {
  for (const [surah, ayah] of p.a) {
    if (ayah === 1 && !surahStart[surah]) surahStart[surah] = i + 1;
  }
});

export function surahStartPage(surah: number): number {
  return surahStart[surah] ?? 1;
}

/** Number of ayahs in a surah, in this Mushaf's own (Qaloon) count. */
const ayahCounts: number[] = [];
index.pages.forEach((p) => {
  for (const [surah, ayah] of p.a) ayahCounts[surah] = Math.max(ayahCounts[surah] ?? 0, ayah);
});
export function surahAyahCount(surah: number): number {
  return ayahCounts[surah] ?? 0;
}

// ── Surah headers ────────────────────────────────────────────────────────────
// Each page has 15 lines of 150 units. A surah's printed header (its name,
// ayah count and order, as plain text) takes the line two above its first ayah
// (the line between is the basmala; At-Tawbah has none, so its header is the
// line just above). Pages 1 and 2 are laid out differently: their header sits
// higher, around y = 525. Checked against the rendered pages for all 114 surahs.

export interface SurahHeaderSlot {
  surah: number;
  /** Where the ornament goes, in page units: centre and width. It stays inside
   *  the header line and covers the printed header completely. */
  cx: number;
  cy: number;
  width: number;
}

const LINE = 150;
const headerSlots = new Map<number, SurahHeaderSlot[]>();
index.pages.forEach((p, i) => {
  const page = i + 1;
  for (const [surah, ayah, rects] of p.a) {
    if (ayah !== 1 || surahStart[surah] !== page) continue;
    let top = Infinity;
    for (let k = 1; k < rects.length; k += 4) top = Math.min(top, rects[k]);
    const slot: SurahHeaderSlot = page <= 2
      ? { surah, cx: 560, cy: 525, width: 680 }
      : { surah, cx: 560, cy: top - (surah === 9 ? LINE : 2 * LINE) + LINE / 2, width: 878 };
    headerSlots.set(page, [...(headerSlots.get(page) ?? []), slot]);
  }
});

/** The surah headers printed on a page (most pages have none). */
export function pageSurahHeaders(page: number): SurahHeaderSlot[] {
  return headerSlots.get(page) ?? [];
}

/** Surahs that appear on a page, in order (for the page header). */
export function pageSurahs(page: number): number[] {
  const seen: number[] = [];
  for (const { surah } of pageAyahs(page)) if (!seen.includes(surah)) seen.push(surah);
  return seen;
}

export function surahName(surah: number): string {
  return chapters.find((c) => c.number === surah)?.nameArabic ?? '';
}

/** The surah's name without the word «سورة» (for tight places like the page header). */
export function surahShortName(surah: number): string {
  const name = surahName(surah);
  const [first, ...rest] = name.split(' ');
  return rest.length && first.replace(/[\u064B-\u0652\u0670]/g, '') === 'سورة' ? rest.join(' ') : name;
}

// ── Page files ───────────────────────────────────────────────────────────────

export interface PagePaths {
  /** Gold ornaments: frame, surah headers, ayah markers. */
  ornament: string;
  /** The Mushaf text. */
  text: string;
}

const memory = new Map<number, PagePaths>();

function parsePage(svg: string): PagePaths {
  const paths = [...svg.matchAll(/<path\b([^>]*?)\sd="([^"]+)"([^>]*)\/?>/g)]
    .filter((m) => !/ayahPolygon/.test(m[1] + m[3]));
  const ornament = paths.find((m) => /#b8924e/i.test(m[1] + m[3]));
  const text = paths.find((m) => m !== ornament);
  if (!ornament || !text) throw new Error('unexpected page format');
  return { ornament: ornament[2], text: text[2] };
}

function isVerified(page: number, svg: string): boolean {
  return sha256(svg) === index.pages[page - 1]?.h;
}

export function isPageDownloaded(page: number): boolean {
  try {
    return pageFile(page).exists;
  } catch {
    return false;
  }
}

async function fetchVerified(page: number): Promise<string> {
  let lastError: unknown = null;
  for (const base of SOURCES) {
    try {
      const res = await fetch(`${base}/${pad3(page)}.svg`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const svg = await res.text();
      if (!isVerified(page, svg)) throw new Error('page failed its integrity check');
      return svg;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error('download failed');
}

function save(page: number, svg: string) {
  const dir = pagesDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const file = pageFile(page);
  if (file.exists) file.delete();
  file.create();
  file.write(svg);
}

/** Loads a page from the device, downloading (and verifying) it if needed. */
export async function loadPage(page: number): Promise<PagePaths> {
  const cached = memory.get(page);
  if (cached) return cached;

  let svg: string | null = null;
  let canStore = true;
  try {
    const file = pageFile(page);
    if (file.exists) {
      const local = await file.text();
      if (isVerified(page, local)) svg = local;
      else file.delete(); // damaged copy: fetch it again
    }
  } catch {
    canStore = false; // no file system (the web version): fetch every time
  }
  if (!svg) {
    svg = await fetchVerified(page);
    if (canStore) save(page, svg);
  }

  const paths = parsePage(svg);
  memory.set(page, paths);
  if (memory.size > 8) memory.delete(memory.keys().next().value as number);
  return paths;
}

// ── Whole-Mushaf download (Settings) ─────────────────────────────────────────

export interface DownloadState {
  running: boolean;
  done: number;
  total: number;
  error: string | null;
}

let state: DownloadState = { running: false, done: 0, total: QALOON_PAGE_COUNT, error: null };
let cancelled = false;
const listeners = new Set<(s: DownloadState) => void>();

function setState(next: Partial<DownloadState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

export function downloadedPageCount(): number {
  let n = 0;
  for (let p = 1; p <= QALOON_PAGE_COUNT; p++) if (isPageDownloaded(p)) n++;
  return n;
}

export function getDownloadState(): DownloadState {
  return state.running ? state : { ...state, done: downloadedPageCount() };
}

export function onDownloadChange(cb: (s: DownloadState) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export async function downloadWholeMushaf(): Promise<void> {
  if (state.running) return;
  cancelled = false;
  const missing: number[] = [];
  for (let p = 1; p <= QALOON_PAGE_COUNT; p++) if (!isPageDownloaded(p)) missing.push(p);
  setState({ running: true, error: null, done: QALOON_PAGE_COUNT - missing.length });

  let failed = 0;
  const worker = async () => {
    while (missing.length && !cancelled) {
      const page = missing.shift() as number;
      try {
        save(page, await fetchVerified(page));
        setState({ done: state.done + 1 });
      } catch {
        failed++;
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  setState({
    running: false,
    done: downloadedPageCount(),
    error: cancelled ? null : failed ? `${failed}` : null,
  });
}

export function cancelDownload() {
  cancelled = true;
}

export function deleteDownloadedMushaf() {
  cancelled = true;
  memory.clear();
  const dir = pagesDir();
  if (dir.exists) dir.delete();
  setState({ running: false, done: 0, error: null });
}
