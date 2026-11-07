// Automatic page turns for Qaloon recitations in the Libyan Awqaf Mushaf.
// For each surah: [page, ms] = show `page` from `ms` milliseconds into the
// surah's recording.
//
// Al-Dokali: built by scripts/qaloon-mp3quran-timings.py from mp3quran.net's
// published ayah timings (read 208). Every surah's ayah count was checked
// against the Libyan Mushaf; the 15 surahs numbered differently there are left
// out (no page turning). Ten turns across the Mushaf were checked by listening.

import dokali from '../../assets/data/qaloon_page_turns/dokali.json';

export type PageTurns = Record<string, [number, number][]>;

// reciter id -> turns. Add a reciter here once its file has been generated and
// checked by listening.
export const QALOON_PAGE_TURNS: Record<string, PageTurns> = {
  dokali: dokali.surahs as unknown as PageTurns,
};

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

/** Whether this reciter's recording of `surah` has page turns (a surah whose
 * audio could not be analysed is left out of the file). */
export function hasPageTurns(reciterId: string, surah: number): boolean {
  return !!QALOON_PAGE_TURNS[reciterId]?.[String(surah)]?.length;
}
