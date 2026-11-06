#!/usr/bin/env python3
"""Lower the waqf marks in Amiri Quran so they sit on their word.

Amiri Quran anchors waqf marks (U+06D6-U+06DC: ۖ ۗ ۘ ۙ ۚ ۛ ۜ) to only a dozen
base letters; everywhere else they fall back to their drawn position, a fixed
1.3 em above the baseline, which on a phone puts them against the line above.

This adds two GPOS lookups, applied after the font's own ones:
  * mark-to-base: a waqf mark sits just above the top of the letter it follows;
  * mark-to-mark: if that letter carries an above mark (fatha, sukun, shadda,
    small rounded zero, ...), the waqf mark sits just above that mark instead.
Only positioning changes; no glyph, letter or character is added or altered.

The font is licensed under the SIL Open Font License 1.1 (no Reserved Font
Name), which permits modified versions; the licence text is kept in the font.

Source font: AmiriQuran_400Regular.ttf from @expo-google-fonts/amiri-quran 0.4.1
(npm), the Google Fonts build of Amiri Quran.

Usage: python3 scripts/patch-amiri-waqf.py <original AmiriQuran.ttf> <output.ttf>
Requires: pip install fonttools
"""
import sys

from fontTools.otlLib import builder as otl
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables as ot

WAQF = range(0x06D6, 0x06DD)
GAP = 70  # font units (upem 1000) between the letter/mark top and the waqf mark


def build_mark_mark(marks, mark2s, glyph_map):
    """MarkMarkPos format 1 with a single mark class."""
    st = ot.MarkMarkPos()
    st.Format = 1
    st.ClassCount = 1
    st.Mark1Coverage = otl.buildCoverage(marks, glyph_map)
    st.Mark1Array = otl.buildMarkArray(marks, glyph_map)
    st.Mark2Coverage = otl.buildCoverage(mark2s, glyph_map)
    array = ot.Mark2Array()
    array.Mark2Record = [otl.buildMark2Record([mark2s[g][0]]) for g in st.Mark2Coverage.glyphs]
    array.Mark2Count = len(array.Mark2Record)
    st.Mark2Array = array
    return st


def main(src: str, dst: str) -> None:
    font = TTFont(src)
    glyf = font['glyf']
    gdef = font['GDEF'].table
    gpos = font['GPOS'].table
    classes = gdef.GlyphClassDef.classDefs

    def bounds(name):
        g = glyf[name]
        if g.numberOfContours == 0:  # empty glyph (space etc.)
            return None
        g.recalcBounds(glyf)
        return g.xMin, g.yMin, g.xMax, g.yMax

    cmap = font.getBestCmap()
    waqf = sorted({cmap[cp] for cp in WAQF if cp in cmap})

    # Waqf mark anchor: horizontal centre of the mark, at its lowest point.
    mark_anchors = {}
    for name in waqf:
        x0, y0, x1, _ = bounds(name)
        mark_anchors[name] = (0, otl.buildAnchor((x0 + x1) // 2, y0))

    # Every base letter (and ligature): centre of the glyph, just above its top.
    base_anchors = {}
    for name, cls in classes.items():
        if cls == 3:
            continue
        b = bounds(name)
        if b is None:
            continue
        x0, _, x1, y1 = b
        base_anchors[name] = {0: otl.buildAnchor((x0 + x1) // 2, y1 + GAP)}

    # Above marks (everything drawn over the baseline region, waqf excluded).
    above_marks = {}
    for name, cls in classes.items():
        if cls != 3 or name in waqf:
            continue
        b = bounds(name)
        if b is None:
            continue
        x0, y0, x1, y1 = b
        if y0 > 250:  # sits above the letter body
            above_marks[name] = {0: otl.buildAnchor((x0 + x1) // 2, y1 + GAP)}

    glyph_map = font.getReverseGlyphMap()
    mark_base = otl.buildMarkBasePosSubtable(mark_anchors, base_anchors, glyph_map)
    mark_mark = build_mark_mark(mark_anchors, above_marks, glyph_map)

    # Mark-to-mark should only look back at above marks (skip a kasra etc.), so
    # give it a mark filtering set of the above marks plus the waqf marks.
    sets = gdef.MarkGlyphSetsDef
    coverage = otl.buildCoverage(sorted(set(above_marks) | set(waqf)), glyph_map)
    sets.Coverage.append(coverage)
    sets.MarkSetCount = len(sets.Coverage)
    filter_index = sets.MarkSetCount - 1

    lookups = gpos.LookupList.Lookup
    base_index = len(lookups)
    lookups.append(otl.buildLookup([mark_base], flags=0, table="GPOS"))
    lookups.append(otl.buildLookup([mark_mark], markFilterSet=filter_index, table="GPOS"))
    gpos.LookupList.LookupCount = len(lookups)

    for record in gpos.FeatureList.FeatureRecord:
        if record.FeatureTag == 'mark':
            record.Feature.LookupListIndex.append(base_index)
        elif record.FeatureTag == 'mkmk':
            record.Feature.LookupListIndex.append(base_index + 1)
        record.Feature.LookupCount = len(record.Feature.LookupListIndex)

    for rec in font['name'].names:
        if rec.nameID == 5:  # version string
            rec.string = rec.toUnicode() + '; waqf marks repositioned for Wahio Arr\'ahmaan'

    print(f'waqf marks: {len(waqf)}, bases: {len(base_anchors)}, above marks: {len(above_marks)}')
    font.save(dst)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
