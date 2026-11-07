#!/usr/bin/env python3
"""Listening check for automatic page turns (see scripts/qaloon-page-turns.py).

Cuts a 16-second clip around each requested page turn from the cached audio,
with a short beep at the moment the app would turn the page. In a correct
clip, the reciter finishes the last ayah of the previous page just before the
beep and starts the first ayah of the new page right after it.

    python3 scripts/qaloon-page-turns-clips.py dokali 2:12 2:42 18:300

Each argument is surah:page (the page being turned to). Clips are written to
~/Desktop/qaloon-check/<reciter>-<surah>-<page>.mp3, and the ayahs to listen
for are printed. Needs ffmpeg and the audio downloaded by qaloon-page-turns.py.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INDEX = os.path.join(ROOT, 'assets', 'data', 'qaloon_libya.json')
TURNS = os.path.join(ROOT, 'assets', 'data', 'qaloon_page_turns')
BEFORE_S = 8.0
LENGTH_S = 16.0


def main(reciter, picks):
    with open(INDEX, encoding='utf-8') as f:
        index = json.load(f)
    with open(os.path.join(TURNS, f'{reciter}.json'), encoding='utf-8') as f:
        surahs = json.load(f)['surahs']
    audio = os.path.expanduser(f'~/qaloon-audio-cache/{reciter}')
    out_dir = os.path.expanduser('~/Desktop/qaloon-check')
    os.makedirs(out_dir, exist_ok=True)
    for pick in picks:
        surah, page = (int(x) for x in pick.split(':'))
        turn = next((ms for p, ms in surahs.get(str(surah), [])[1:] if p == page), None)
        if turn is None:
            print(f'{pick}: no page turn to page {page} in surah {surah}')
            continue
        at = turn / 1000
        start = max(0.0, at - BEFORE_S)
        beep_ms = round((at - start) * 1000)
        out = os.path.join(out_dir, f'{reciter}-{surah:03d}-{page:03d}.mp3')
        subprocess.run(
            ['ffmpeg', '-v', 'error', '-y', '-nostdin', '-ss', f'{start:.3f}', '-t', f'{LENGTH_S}',
             '-i', os.path.join(audio, f'{surah:03d}.mp3'), '-f', 'lavfi', '-i', 'sine=f=1000:d=0.15',
             '-filter_complex',
             f'[1]adelay={beep_ms}:all=1,volume=0.3[b];[0:a:0][b]amix=inputs=2:duration=first:normalize=0',
             '-ac', '2', out], check=True)
        before = [a for s, a, _ in index['pages'][page - 2]['a'] if s == surah]
        after = [a for s, a, _ in index['pages'][page - 1]['a'] if s == surah]
        print(f'{os.path.basename(out)}  ({int(at // 60)}:{at % 60:04.1f} into the surah)  '
              f'before the beep: end of ayah {before[-1]} · after it: ayah {after[0]} (page {page})')
    print(f'\nclips in {out_dir}')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
