#!/usr/bin/env python3
"""Compute automatic page turns for a Qaloon recitation in the Libyan Awqaf Mushaf.

For each surah, finds the moment the reciter moves from one Mushaf page to the
next, so the reader can turn pages by itself during playback. This is for
PAGE TURNING ONLY: it is not accurate enough to highlight individual ayahs.

How:
  1. Pauses in the recording are found with ffmpeg's silencedetect. The
     threshold adapts per file (some recordings have a louder background), and
     the file's real length is measured by decoding it, not read from the
     header (long MP3 headers can be estimates).
  2. Every ayah of the surah is matched to the stretches of speech between
     pauses, so that each ayah lasts about as long as its text (the width of
     its lines in the page index) says. The pattern of short and long ayahs
     pins the matching down; ayahs joined without a stop (wasl) and breaths in
     the middle of an ayah are allowed. The matching is made for the whole
     surah at once (dynamic programming).
  3. Every page of this Mushaf ends at the end of an ayah, so a page turns
     where its first ayah starts. If the reciter joined that ayah to the one
     before it (no pause), the moment is interpolated ("mid-breath").
  4. Every page is then checked: if the reciter would have to read a page much
     faster or slower than the rest of the surah, the surah is reported with ⚠.

Runs on a computer with internet, curl and ffmpeg (brew install ffmpeg):

    python3 scripts/qaloon-page-turns.py dokali https://cdn.mp3quran.net/audio/dokali-alim/r1

Downloads the 114 surahs into ~/qaloon-audio-cache/<reciter>/ (about 1 GB for a
full recitation; reused on later runs, as are the detected pauses) and writes
assets/data/qaloon_page_turns/<reciter>.json. Uses only the Python standard
library.
"""
import json
import math
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INDEX = os.path.join(ROOT, 'assets', 'data', 'qaloon_libya.json')
OUT_DIR = os.path.join(ROOT, 'assets', 'data', 'qaloon_page_turns')

# Pause detection: try the strictest threshold first and relax it until the
# recording shows a plausible number of pauses (a reciter breathes several
# times a minute). A file with a louder background needs a higher threshold.
THRESHOLDS_DB = (-30, -27, -24, -21, -18, -15)
SILENCE_MIN = 0.12        # seconds; shortest silence ffmpeg reports
MIN_PAUSES_PER_MIN = 2.0  # fewer than this at a threshold: try the next one
CANDIDATE_MIN = 0.25      # shorter silences are gaps between letters, not pauses

# Matching ayahs to pauses.
RATE_WEIGHT = 16.0    # cost of an ayah read at the wrong speed: × ln(actual/expected)²
AYAH_OVERHEAD = 0.5   # seconds every ayah takes beyond its text (closing madd)
SKIP_COST = 0.5       # a pause inside an ayah (a breath at a waqf mark)…
SKIP_LEN_COST = 1.5   # …plus this per second of it (up to 2 s)
WASL_COST = 1.0       # per ayah joined to the next without a pause (wasl)
MAX_JOINED = 3        # most ayahs recited in one breath
START_SLACK = 15.0    # the first ayah may start up to this long after the speech (basmala, isti'adha)
BAND_MIN = 40.0       # an ayah's end is searched within ±max(BAND_MIN, BAND_FRAC × …)
BAND_FRAC = 0.10      # …of the time from the nearer end of the surah
LEAD_S = 0.15         # turn this long before the reciter starts the next page

# Quality check: flag pages read this much faster or slower than the surah's median.
FLAG_RATIO = 1.5


# ── Mushaf text ──────────────────────────────────────────────────────────────

def surah_ayahs(index, surah):
    """[(ayah, [(page, weight), ...])] in reading order. Weight = total width of
    the ayah's line rectangles on that page, a good proxy for how long it takes
    to recite. (An ayah can run over a page break.)"""
    parts = {}
    for page_no, page in enumerate(index['pages'], start=1):
        for s, a, r in page['a']:
            if s == surah:
                parts.setdefault(a, []).append((page_no, sum(r[i + 2] for i in range(0, len(r), 4))))
    return [(a, sorted(parts[a])) for a in sorted(parts)]


# ── Audio ────────────────────────────────────────────────────────────────────

def hms(text):
    h, m, s = text.split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def run_silencedetect(path, db):
    """(decoded duration, header duration, [(start, end)], ffmpeg errors) for one threshold."""
    out = subprocess.run(
        ['ffmpeg', '-hide_banner', '-nostdin', '-i', path, '-map', '0:a:0', '-af',
         f'silencedetect=noise={db}dB:d={SILENCE_MIN}', '-f', 'null', '-'],
        capture_output=True, text=True, errors='replace').stderr
    header = re.search(r'Duration: (\d+:\d+:[\d.]+)', out)
    header = hms(header[1]) if header else 0.0
    times = [hms(t) for t in re.findall(r'time=(\d+:\d+:[\d.]+)', out)]  # progress
    duration = max(times) if times else 0.0
    starts = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    if len(ends) < len(starts):  # file ends in silence
        ends.append(duration)
    errors = [l.strip() for l in out.splitlines()
              if re.search(r'error|invalid|could not|failed|not supported|truncat', l, re.I)]
    return duration, header, [(max(0.0, s0), s1) for s0, s1 in zip(starts, ends)], errors


def decoded_fully(duration, header):
    return duration > 0 and (header == 0 or duration >= 0.9 * header)


def detect_silences(path):
    """(threshold dB, duration, header duration, pauses, errors), cached next to the
    audio. A file ffmpeg cannot decode to its end is reported, never cached."""
    cache = path + '.pauses.json'
    stamp = os.path.getsize(path)
    if os.path.exists(cache):
        with open(cache, encoding='utf-8') as f:
            saved = json.load(f)
        if (saved.get('size') == stamp and saved.get('version') in (2, 3)
                and decoded_fully(saved['duration'], saved['header'])):
            return saved['db'], saved['duration'], saved['header'], [tuple(p) for p in saved['pauses']], []
    for db in THRESHOLDS_DB:
        duration, header, pauses, errors = run_silencedetect(path, db)
        if not decoded_fully(duration, header):
            return db, duration, header, [], errors or ['ffmpeg stopped early, without an error message']
        if len(pauses) >= MIN_PAUSES_PER_MIN * duration / 60:
            break
    with open(cache, 'w', encoding='utf-8') as f:
        json.dump({'version': 3, 'size': stamp, 'db': db, 'duration': duration,
                   'header': header, 'pauses': pauses}, f)
    return db, duration, header, pauses, []


def speech_span(duration, silences):
    """First and last moment of recitation (ignores leading/trailing silence)."""
    start, end = 0.0, duration
    for s0, s1 in silences:
        if s0 <= 0.05:
            start = max(start, s1)
        if s1 >= duration - 0.05:
            end = min(end, s0)
    return start, end


# ── Matching ayahs to pauses ─────────────────────────────────────────────────

def align_ayahs(weights, start, end, pauses):
    """Start and end time of every ayah, and whether each ayah end fell on a pause.

    Pauses split the recitation into stretches of speech. Each ayah (or a run of
    up to MAX_JOINED ayahs recited without a stop) must fill whole stretches,
    lasting about as long as its text says; pauses inside an ayah are breaths.
    Dynamic programming finds the most consistent matching for the whole surah.
    Returns None if nothing consistent exists."""
    n = len(weights)
    # Nodes: 0 = speech start, 1..m = pauses, m+1 = speech end. An ayah run
    # goes from the end of one node (s1) to the start of a later one (s0).
    s0 = [start] + [p[0] for p in pauses] + [end]
    s1 = [start] + [p[1] for p in pauses] + [end]
    m1 = len(s0) - 1
    plen = [0.0] + [p[1] - p[0] for p in pauses] + [0.0]
    cum_len, cum_skip = [0.0], [0.0]
    for i in range(1, m1 + 1):
        cum_len.append(cum_len[-1] + plen[i])
        cum_skip.append(cum_skip[-1] + SKIP_COST + SKIP_LEN_COST * min(plen[i], 2.0))
    speech = (end - start) - cum_len[m1]
    total_w = sum(weights)
    rate = max(speech - AYAH_OVERHEAD * n, 0.1 * speech) / total_w
    cum_w = [0.0]
    for w in weights:
        cum_w.append(cum_w[-1] + w)

    def run_cost(a, b, i, k):
        """Ayahs i-k+1..i (1-based) from node a to node b."""
        talk = s0[b] - s1[a] - (cum_len[b - 1] - cum_len[a] if b - 1 > a else 0.0)
        if talk <= 0:
            return math.inf
        expected = rate * (cum_w[i] - cum_w[i - k]) + AYAH_OVERHEAD * k
        skipped = cum_skip[b - 1] - cum_skip[a] if b - 1 > a else 0.0
        return RATE_WEIGHT * math.log(talk / expected) ** 2 + skipped + WASL_COST * (k - 1)

    def band(i):
        """Nodes where ayah i may end (by its position in the text)."""
        if i == n:
            return [m1]
        frac = cum_w[i] / total_w
        estimate = start + (end - start) * frac
        width = max(BAND_MIN, BAND_FRAC * (end - start) * min(frac, 1 - frac))
        return [j for j in range(1, m1) if abs(s0[j] - estimate) <= width]

    # best[i][node] = (cost, previous node, run length) with ayah i ending at node.
    best = [dict() for _ in range(n + 1)]
    for j in range(m1):
        if s1[j] <= start + START_SLACK:
            best[0][j] = (0.0, None, 0)
    for i in range(1, n + 1):
        for b in band(i):
            top = (math.inf, None, 0)
            for k in range(1, min(MAX_JOINED, i) + 1):
                prev = best[i - k]
                if not prev:
                    continue
                longest = 4 * (rate * (cum_w[i] - cum_w[i - k]) + AYAH_OVERHEAD * k) + 10
                for a, (c, _, _) in prev.items():
                    if a >= b or s0[b] - s1[a] > longest:
                        continue
                    v = c + run_cost(a, b, i, k)
                    if v < top[0]:
                        top = (v, a, k)
            if top[0] < math.inf:
                best[i][b] = top
    if m1 not in best[n]:
        return None

    # Walk back, splitting joined runs in proportion to their text.
    times = [None] * (n + 1)  # times[i] = (start, end, ended on a pause) of ayah i
    i, b = n, m1
    while i > 0:
        _, a, k = best[i][b]
        t_a, t_b = s1[a], s0[b]
        span_w = cum_w[i] - cum_w[i - k]
        t = t_a
        for j in range(i - k + 1, i + 1):
            u = t_b if j == i else t + (t_b - t_a) * (cum_w[j] - cum_w[j - 1]) / span_w
            times[j] = (t, u, j == i)
            t = u
        i, b = i - k, a
    return times[1:], rate


def page_turns(surah, duration, silences, index):
    """([[page, ms], ...], stats). Show `page` from `ms` milliseconds into the surah."""
    ayahs = surah_ayahs(index, surah)
    first_page = ayahs[0][1][0][0]
    turns = [[first_page, 0]]
    stats = {'snapped': 0, 'estimated': 0, 'worst': 1.0, 'flagged': [], 'aligned': True}
    pages = sorted({p for _, parts in ayahs for p, _ in parts})
    if len(pages) == 1:
        return turns, stats

    start, end = speech_span(duration, silences)
    pauses = [(a, b) for a, b in silences if b - a >= CANDIDATE_MIN and start < a and b < end]
    weights = [sum(w for _, w in parts) for _, parts in ayahs]
    aligned = align_ayahs(weights, start, end, pauses)
    if aligned is None:  # fall back to spreading the text evenly over the recording
        stats['aligned'] = False
        total, t = sum(weights), start
        times = []
        for w in weights:
            u = t + (end - start) * w / total
            times.append((t, u, False))
            t = u
    else:
        times, _ = aligned

    # A page starts where its first ayah (or the rest of a split ayah) starts.
    page_start = {}
    for idx, (_, parts) in enumerate(ayahs):
        a_start, a_end, _ = times[idx]
        w_total = sum(w for _, w in parts)
        done = 0.0
        for page, w in parts:
            if page not in page_start:
                at = a_start + (a_end - a_start) * done / w_total
                on_pause = done == 0 and (idx == 0 or times[idx - 1][2])
                page_start[page] = (at, on_pause)
            done += w
    for page in pages[1:]:
        at, on_pause = page_start[page]
        turns.append([page, round(max(0.0, at - LEAD_S) * 1000)])
        stats['snapped' if on_pause and aligned is not None else 'estimated'] += 1

    # Quality: seconds per unit of text on each page, against the surah's median.
    page_w = {}
    for _, parts in ayahs:
        for page, w in parts:
            page_w[page] = page_w.get(page, 0) + w
    bounds = [page_start[p][0] if k else start for k, p in enumerate(pages)] + [end]
    speeds = [(bounds[k + 1] - bounds[k]) / page_w[p] for k, p in enumerate(pages)]
    inner = speeds[1:-1] or speeds
    middle = sorted(inner)[len(inner) // 2]
    for k, sp in enumerate(speeds):
        if 0 < k < len(pages) - 1:  # first and last pages hold the basmala / the end
            ratio = max(sp / middle, middle / sp) if sp > 0 else math.inf
            stats['worst'] = max(stats['worst'], ratio)
            if ratio > FLAG_RATIO:
                stats['flagged'].append(pages[k])
    return turns, stats


# ── Main ─────────────────────────────────────────────────────────────────────

def main(reciter, base):
    with open(INDEX, encoding='utf-8') as f:
        index = json.load(f)
    cache = os.path.expanduser(f'~/qaloon-audio-cache/{reciter}')
    os.makedirs(cache, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    result = {}
    turns_total = snapped_total = 0
    flagged_surahs = []
    failed = []
    for surah in range(1, 115):
        path = os.path.join(cache, f'{surah:03d}.mp3')
        if not os.path.exists(path) or os.path.getsize(path) < 10_000:
            subprocess.run(['curl', '-sfL', '--retry', '3', f'{base}/{surah:03d}.mp3', '-o', path], check=True)
        db, duration, header, silences, errors = detect_silences(path)
        if errors:
            failed.append(surah)
            print(f'✗ surah {surah:3d}: ffmpeg decoded only {duration / 60:.1f} of {header / 60:.1f} min '
                  f'({os.path.getsize(path) / 1e6:.1f} MB) — left out. ffmpeg said:', flush=True)
            for line in errors[:5]:
                print(f'      {line}', flush=True)
            continue
        turns, st = page_turns(surah, duration, silences, index)
        result[str(surah)] = turns
        turns_total += len(turns) - 1
        snapped_total += st['snapped']
        mark = '⚠' if st['flagged'] or not st['aligned'] else ' '
        if mark != ' ':
            flagged_surahs.append(surah)
        length = f'{duration / 60:5.1f} min'
        if abs(header - duration) > 2:
            length += f' (header said {header / 60:.1f})'
        print(f'{mark} surah {surah:3d}: {len(turns):2d} pages, {st["snapped"]:2d} on a pause, '
              f'{st["estimated"]:2d} mid-breath, pace spread ×{st["worst"]:.2f}, '
              + ('' if st['aligned'] else 'NOT ALIGNED, ')
              + f'{len(silences) / max(duration / 60, 0.01):4.1f} pauses/min at {db} dB, {length}'
              + (f'  odd pages: {st["flagged"]}' if st['flagged'] else ''), flush=True)

    out = {
        'reciter': reciter,
        'audio': base,
        'generated': date.today().isoformat(),
        'method': 'ayahs matched to pauses by text length; adaptive silence threshold (page turning only)',
        'surahs': result,
    }
    path = os.path.join(OUT_DIR, f'{reciter}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'))
    print(f'\nwrote {path}: {turns_total} page turns, {snapped_total} on a pause '
          f'({100 * snapped_total / max(1, turns_total):.0f}%)')
    print(f'surahs to check (⚠): {flagged_surahs or "none"}')
    if failed:
        print(f'surahs left out, audio could not be decoded (✗): {failed}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2].rstrip('/'))
