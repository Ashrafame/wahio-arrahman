// Automatic page turns for Qaloon recitations in the Libyan Awqaf Mushaf,
// generated per reciter by scripts/qaloon-page-turns.py. For each surah:
// [page, ms] = show `page` from `ms` milliseconds into the surah's recording.
// Page turning only: these timings are not accurate enough to highlight ayahs.

export type PageTurns = Record<string, [number, number][]>;

// reciter id -> turns. Add a reciter here once its file has been generated and
// checked by listening.
export const QALOON_PAGE_TURNS: Record<string, PageTurns> = {};

/** The page to show at `ms` into `surah`, or null if this reciter has no timings. */
export function pageAtTime(reciterId: string, surah: number, ms: number): number | null {
  const turns = QALOON_PAGE_TURNS[reciterId]?.[String(surah)];
  if (!turns?.length) return null;
  let page = turns[0][0];
  for (const [p, at] of turns) {
    if (at <= ms) page = p;
    else break;
  }
  return page;
}

export function hasPageTurns(reciterId: string): boolean {
  return !!QALOON_PAGE_TURNS[reciterId];
}
