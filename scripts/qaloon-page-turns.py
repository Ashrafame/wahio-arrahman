#!/usr/bin/env python3
"""Compute automatic page turns for a Qaloon recitation in the Libyan Awqaf Mushaf.

For each surah, finds the moment the reciter moves from one Mushaf page to the
next, so the reader can turn pages by itself during playback. This is for
PAGE TURNING ONLY: it is not accurate enough to highlight individual ayahs.

How: the reciter's progress through a surah is estimated from how much text
(the width of each ayah's lines in the page index) lies before each page end,
then snapped to the nearest real pause in the recording, found with ffmpeg's
silencedetect. Reciters pause before most page breaks; where no pause is near
the estimate, the estimate is kept and reported as "unsnapped".

Runs on a computer with internet, curl and ffmpeg (brew install ffmpeg):

    python3 scripts/qaloon-page-turns.py dokali https://cdn.mp3quran.net/audio/dokali-alim/r1

Downloads the 114 surahs into ~/qaloon-audio-cache/<reciter>/ (about 1 GB for a
full recitation; reused on later runs) and writes
assets/data/qaloon_page_turns/<reciter>.json. Uses only the Python standard
library.
"""
import json
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INDEX = os.path.join(ROOT, 'assets', 'data', 'qaloon_libya.json')
OUT_DIR = os.path.join(ROOT, 'assets', 'data', 'qaloon_page_turns')

SILENCE_DB = -30     # quieter than this counts as a pause
SILENCE_MIN = 0.12   # seconds
SNAP_WINDOW = 0.06   # search for a pause within ±6% of the surah's recited length…
SNAP_MIN_S = 4.0     # …but never less than ±4 s


def ayah_weights(index, surah):
    """[(page, weight)] for each ayah part of a surah, in reading order.

    Weight = total width of the ayah's line rectangles on that page, a good
    proxy for how long it takes to recite."""
    parts = []
    for page_no, page in enumerate(index['pages'], start=1):
        for s, a, r in page['a']:
            if s == surah:
                parts.append((page_no, a, sum(r[i + 2] for i in range(0, len(r), 4))))
    parts.sort(key=lambda p: (p[1], p[0]))
    return [(page, w) for page, _, w in parts]


def speech_span(duration, silences):
    """First and last moment of recitation (ignores leading/trailing silence)."""
    start, end = 0.0, duration
    for s0, s1 in silences:
        if s0 <= 0.05:
            start = s1
        if s1 >= duration - 0.05:
            end = min(end, s0)
    return start, end


def basmala_end(surah, start, silences):
    """End of the opening basmala (every surah but At-Tawbah begins with one in
    these recordings): the first pause 2–6 s into the recitation."""
    if surah == 9:
        return start
    for s0, s1 in silences:
        if start + 2.0 <= s0 <= start + 6.0:
            return s1
    return start + 3.3  # typical basmala length if no clear pause


def page_turns(surah, duration, silences, index):
    """[[page, ms], ...]: show `page` from `ms` milliseconds into the surah."""
    parts = ayah_weights(index, surah)
    pages = []
    for page, _ in parts:
        if page not in pages:
            pages.append(page)
    turns = [[pages[0], 0]]
    if len(pages) == 1:
        return turns, 0, 0

    start, end = speech_span(duration, silences)
    t0 = basmala_end(surah, start, silences)
    total = sum(w for _, w in parts)
    window = max(SNAP_MIN_S, SNAP_WINDOW * (end - t0))
    snapped = unsnapped = 0
    last = t0
    for next_page in pages[1:]:
        before = sum(w for page, w in parts if pages.index(page) < pages.index(next_page))
        estimate = t0 + (end - t0) * before / total
        # Pauses near the estimate; prefer long ones, then close ones.
        near = [(s0, s1) for s0, s1 in silences
                if abs((s0 + s1) / 2 - estimate) <= window and s1 > last + 1.0 and s0 < end]
        if near:
            s0, s1 = max(near, key=lambda p: (p[1] - p[0]) - abs((p[0] + p[1]) / 2 - estimate) / window * 0.3)
            at = max(s0, s1 - 0.15)  # turn as the reciter starts the next page
            snapped += 1
        else:
            at = estimate
            unsnapped += 1
        last = at
        turns.append([next_page, round(at * 1000)])
    return turns, snapped, unsnapped


def detect_silences(path):
    out = subprocess.run(
        ['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af',
         f'silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN}', '-f', 'null', '-'],
        capture_output=True, text=True).stderr
    dur = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
    duration = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    if len(ends) < len(starts):
        ends.append(duration)
    return duration, list(zip(starts, ends))


def main(reciter, base):
    index = json.load(open(INDEX, encoding='utf-8'))
    cache = os.path.expanduser(f'~/qaloon-audio-cache/{reciter}')
    os.makedirs(cache, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    result = {}
    report = []
    for surah in range(1, 115):
        path = os.path.join(cache, f'{surah:03d}.mp3')
        if not os.path.exists(path) or os.path.getsize(path) < 10_000:
            subprocess.run(['curl', '-sfL', '--retry', '3', f'{base}/{surah:03d}.mp3', '-o', path], check=True)
        duration, silences = detect_silences(path)
        turns, snapped, unsnapped = page_turns(surah, duration, silences, index)
        result[str(surah)] = turns
        report.append((surah, len(turns), snapped, unsnapped, duration))
        print(f'surah {surah:3d}: {len(turns):2d} pages, {snapped} snapped to a pause, '
              f'{unsnapped} estimated, {duration / 60:5.1f} min', flush=True)

    out = {
        'reciter': reciter,
        'audio': base,
        'generated': date.today().isoformat(),
        'method': 'text-proportional estimate snapped to pauses (page turning only)',
        'surahs': result,
    }
    path = os.path.join(OUT_DIR, f'{reciter}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'))
    total_turns = sum(r[1] - 1 for r in report)
    total_snapped = sum(r[2] for r in report)
    print(f'\nwrote {path}: {total_turns} page turns, {total_snapped} snapped to a pause '
          f'({100 * total_snapped / max(1, total_turns):.0f}%)')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2].rstrip('/'))
