export interface AyahTimestamp {
  verse: number;
  from: number; // ms
  to: number;   // ms
}

const timingCache = new Map<string, AyahTimestamp[] | null>();
let reciterListCache: { id: number; reciterName: string; style?: string }[] | null = null;

async function getQurancdnReciters() {
  if (reciterListCache) return reciterListCache;
  try {
    const resp = await fetch('https://api.qurancdn.com/api/qdc/audio/reciters?locale=en', {
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    reciterListCache = data.reciters ?? [];
    return reciterListCache!;
  } catch {
    return [];
  }
}

// name hint (lowercase) + style hint (lowercase) to search qurancdn reciter list
const RECITER_SEARCH: Record<string, { name: string; style: string }> = {
  husary_qaloon: { name: 'husary', style: 'qalon' },
  deban:         { name: 'deban',  style: '' },
  trablsi:       { name: 'trabulsi', style: '' },
  kshidan:       { name: 'qushaydan', style: '' },
  daawob:        { name: 'daawob', style: '' },
};

async function resolveReciterId(reciterId: string): Promise<number | null> {
  const search = RECITER_SEARCH[reciterId];
  if (!search) return null;
  const list = await getQurancdnReciters();
  const match = list.find((r) => {
    const nameOk = r.reciterName?.toLowerCase().includes(search.name);
    const styleOk = !search.style || r.style?.toLowerCase().includes(search.style);
    return nameOk && styleOk;
  });
  return match?.id ?? null;
}

export async function fetchAyahTimings(
  chapter: number,
  qaloonReciterId: string,
): Promise<AyahTimestamp[] | null> {
  const key = `${qaloonReciterId}:${chapter}`;
  if (timingCache.has(key)) return timingCache.get(key)!;

  const cdnId = await resolveReciterId(qaloonReciterId);
  if (!cdnId) {
    timingCache.set(key, null);
    return null;
  }

  try {
    const resp = await fetch(
      `https://api.qurancdn.com/api/qdc/audio/reciters/${cdnId}/audio_files?chapter_number=${chapter}&segments=true`,
      { headers: { Accept: 'application/json' } },
    );
    if (!resp.ok) {
      timingCache.set(key, null);
      return null;
    }
    const data = await resp.json();
    const file = data?.audio_files?.[0];
    if (!file?.verse_timings?.length) {
      timingCache.set(key, null);
      return null;
    }

    const timings: AyahTimestamp[] = file.verse_timings.map((vt: { verse_key?: string; verse_number?: number; timestamp_from: number; timestamp_to: number }) => ({
      verse: vt.verse_key ? parseInt(vt.verse_key.split(':')[1], 10) : (vt.verse_number ?? 0),
      from: vt.timestamp_from,
      to: vt.timestamp_to,
    }));

    timingCache.set(key, timings);
    return timings;
  } catch {
    timingCache.set(key, null);
    return null;
  }
}
