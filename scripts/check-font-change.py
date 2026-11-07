#!/usr/bin/env python3
"""Prove which Quran words render differently between two builds of a font.

Shapes every word of the Mushaf text (as the reader displays it) with HarfBuzz
in both fonts and compares glyphs and positions. Prints every word whose
rendering differs, so a font change can be shown to touch only what it should.

Usage: python3 scripts/check-font-change.py <quran_hafs.json> <old.ttf> <new.ttf>
Requires: pip install uharfbuzz
"""
import json
import re
import sys
from collections import defaultdict

import uharfbuzz as hb


def shaper(path):
    font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))

    def shape(text):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(font, buf)
        return tuple((i.codepoint, p.x_advance, p.x_offset, p.y_offset)
                     for i, p in zip(buf.glyph_infos, buf.glyph_positions))

    return shape


def main(quran, old, new):
    ayahs = json.load(open(quran, encoding='utf-8'))['ayahs']
    a, b = shaper(old), shaper(new)
    words = defaultdict(list)
    for key, text in ayahs.items():
        display = re.sub(' (?=[ۖ-ۜ])', '', text)  # as the reader shows it
        for w in set(display.split(' ')):
            words[w].append(key)
    changed = {w: keys for w, keys in words.items() if a(w) != b(w)}
    print(f'{len(words)} distinct words compared; {len(changed)} render differently')
    for w, keys in changed.items():
        print(f'  {w}  ({len(keys)} ayahs: {", ".join(sorted(keys))})')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
