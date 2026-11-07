#!/usr/bin/env python3
"""Page turns from mp3quran.net's own ayah timings (when they exist for a recitation).

mp3quran publishes the start and end of every ayah for some of its recordings
(api/v3/ayat_timing). For a reciter covered there, this gives page turns from
real ayah boundaries instead of guessing them from pauses
(scripts/qaloon-page-turns.py).

    python3 scripts/qaloon-mp3quran-timings.py dokali 208

<reciter> is the app's reciter id, <read> mp3quran's id for the recitation.
Every surah is checked before use:
  - its ayah count must equal the Libyan Mushaf's (the index in
    assets/data/qaloon_libya.json), so the numbering matches the pages;
  - the timings must be in order;
  - if the audio was downloaded by qaloon-page-turns.py, the timings must end
    within the length of that recording, so they belong to the same file.
A surah that fails is left out (the player then offers no page turning for it).

Writes assets/data/qaloon_page_turns/<reciter>.json (same format as
qaloon-page-turns.py) and keeps the raw timings in
~/qaloon-audio-cache/<reciter>/timings/. Uses only the Python standard library.
"""
import json
import os
import sys
import time
import urllib.request
from datetime import date

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INDEX = os.path.join(ROOT, 'assets', 'data', 'qaloon_libya.json')
OUT_DIR = os.path.join(ROOT, 'assets', 'data', 'qaloon_page_turns')
API = 'https://mp3quran.net/api/v3/ayat_timing'


def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'wahio-arrahman-timing-check/1.0'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode('utf-8'))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def libyan_ayahs(index, surah):
    """{ayah: [(page, weight), ...]} for a surah of the Libyan Mushaf."""
    parts = {}
    for page_no, page in enumerate(index['pages'], start=1):
        for s, a, r in page['a']:
            if s == surah:
                parts.setdefault(a, []).append((page_no, sum(r[i + 2] for i in range(0, len(r), 4))))
    return parts


def recording_length_s(cache, surah):
    """Length of the downloaded recording, from qaloon-page-turns.py's analysis."""
    path = os.path.join(cache, f'{surah:03d}.mp3.pauses.json')
    if not os.path.exists(path):
        return None
    with open(path, encoding='utf-8') as f:
        return json.load(f).get('duration') or None


def main(reciter, read_id):
    with open(INDEX, encoding='utf-8') as f:
        index = json.load(f)
    cache = os.path.expanduser(f'~/qaloon-audio-cache/{reciter}')
    raw_dir = os.path.join(cache, 'timings')
    os.makedirs(raw_dir, exist_ok=True)

    result, problems = {}, {}
    for surah in range(1, 115):
        raw_path = os.path.join(raw_dir, f'{surah:03d}.json')
        if os.path.exists(raw_path):
            with open(raw_path, encoding='utf-8') as f:
                raw = json.load(f)
        else:
            raw = fetch_json(f'{API}?surah={surah}&read={read_id}')
            with open(raw_path, 'w', encoding='utf-8') as f:
                json.dump(raw, f, ensure_ascii=False)
        if surah == 1:
            print(f'first entries for surah 1: {json.dumps(raw[:3] if isinstance(raw, list) else raw, ensure_ascii=False)[:400]}\n')

        rows = raw if isinstance(raw, list) else []
        timing = {}
        for r in rows:
            try:
                a, start, end = int(r['ayah']), float(r['start_time']), float(r['end_time'])
            except (KeyError, TypeError, ValueError):
                continue
            if a >= 1:  # ayah 0 is the opening (isti'adha / basmala)
                timing[a] = (start, end)
        ayahs = libyan_ayahs(index, surah)

        issue = None
        if not timing:
            issue = 'no timings published'
        elif sorted(timing) != list(range(1, len(ayahs) + 1)):
            issue = f'{len(timing)} ayahs timed, the Libyan Mushaf has {len(ayahs)}'
        else:
            starts = [timing[a][0] for a in range(1, len(ayahs) + 1)]
            if any(b < a for a, b in zip(starts, starts[1:])):
                issue = 'timings out of order'
            length = recording_length_s(cache, surah)
            last_end = timing[len(ayahs)][1] / 1000
            if not issue and length and last_end > length + 2:
                issue = f'timings end at {last_end / 60:.1f} min, the recording is {length / 60:.1f} min'
        if issue:
            problems[surah] = issue
            print(f'✗ surah {surah:3d}: {issue} — left out', flush=True)
            continue

        # A page turns where its first ayah (or the rest of a split ayah) starts.
        turns, seen = [], set()
        for a in range(1, len(ayahs) + 1):
            start, end = timing[a]
            total = sum(w for _, w in ayahs[a])
            done = 0
            for page, w in ayahs[a]:
                if page not in seen:
                    seen.add(page)
                    at = 0 if not turns else start + (end - start) * done / total
                    turns.append([page, round(at)])
                done += w
        result[str(surah)] = turns
        print(f'  surah {surah:3d}: {len(ayahs):3d} ayahs, {len(turns):2d} pages', flush=True)

    out = {
        'reciter': reciter,
        'audio': f'mp3quran read {read_id}',
        'generated': date.today().isoformat(),
        'method': f'mp3quran.net ayah timings (read {read_id}), checked against the Libyan Mushaf',
        'surahs': result,
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f'{reciter}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'))
    print(f'\nwrote {path}: {len(result)} surahs with page turns, '
          f'{sum(len(t) - 1 for t in result.values())} turns')
    print(f'left out (✗): {sorted(problems) or "none"}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], int(sys.argv[2]))
