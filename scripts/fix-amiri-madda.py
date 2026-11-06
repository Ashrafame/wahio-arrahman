#!/usr/bin/env python3
"""Separate the two maddas of الٓمٓ and طسٓمٓ in Amiri Quran.

In these two words Amiri Quran draws the letters narrower than the madda sign
(U+0653), so the two maddas overlap (الٓمٓ, by 244 units: they read as one long
bar) or touch (طسٓمٓ). Shaping every word of the Quran shows these are the only
two words where two maddas meet; in الٓمٓصٓ and الٓمٓرٰ they are 35 units apart.

This adds one contextual GPOS lookup that matches exactly these glyph sequences
and moves the two maddas apart, to the same 35-unit gap as الٓمٓصٓ. Nothing else
in the font changes; no glyph, letter or character is added or altered.
check-font-change.py proves that no other word of the Quran renders differently.

Source font: AmiriQuran_400Regular.ttf from @expo-google-fonts/amiri-quran 0.4.1
(SIL Open Font License 1.1, no Reserved Font Name; modification is permitted).

Usage: python3 scripts/fix-amiri-madda.py <original AmiriQuran.ttf> <output.ttf>
Requires: pip install fonttools
"""
import sys

from fontTools.otlLib import builder as otl
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables as ot

MADDA = 'uni0653'

# (letter carrying the first madda, letter carrying the second madda,
#  x shift of the first madda, x shift of the second madda), in font units.
# Glyphs are in logical order; positive x moves right.
FIXES = [
    ('glyph01079', 'glyph01091', 100, -179),  # الٓمٓ : lam, final meem (overlap 244)
    ('glyph00936', 'glyph00966', 0, -42),     # طسٓمٓ : seen, final meem (overlap 7)
]


def single_pos(font, dx):
    st = otl.buildSinglePosSubtable({MADDA: otl.buildValue({'XPlacement': dx})}, font.getReverseGlyphMap())
    return otl.buildLookup([st], table='GPOS')


def main(src: str, dst: str) -> None:
    font = TTFont(src)
    gpos = font['GPOS'].table
    lookups = gpos.LookupList.Lookup
    glyph_map = font.getReverseGlyphMap()

    chain_subtables = []
    for first, second, dx1, dx2 in FIXES:
        records = []
        for seq_index, dx in ((1, dx1), (3, dx2)):
            if dx == 0:
                continue
            lookups.append(single_pos(font, dx))
            rec = ot.PosLookupRecord()
            rec.SequenceIndex = seq_index
            rec.LookupListIndex = len(lookups) - 1
            records.append(rec)

        st = ot.ChainContextPos()
        st.Format = 3
        st.BacktrackGlyphCount = 0
        st.BacktrackCoverage = []
        st.LookAheadGlyphCount = 0
        st.LookAheadCoverage = []
        st.InputCoverage = [otl.buildCoverage([g], glyph_map) for g in (first, MADDA, second, MADDA)]
        st.InputGlyphCount = len(st.InputCoverage)
        st.PosLookupRecord = records
        st.PosCount = len(records)
        chain_subtables.append(st)

    chain = otl.buildLookup(chain_subtables, table='GPOS')
    lookups.append(chain)
    gpos.LookupList.LookupCount = len(lookups)
    chain_index = len(lookups) - 1

    for record in gpos.FeatureList.FeatureRecord:
        if record.FeatureTag == 'mkmk':  # runs after every mark attachment
            record.Feature.LookupListIndex.append(chain_index)
            record.Feature.LookupCount = len(record.Feature.LookupListIndex)

    for rec in font['name'].names:
        if rec.nameID == 5:
            rec.string = rec.toUnicode() + "; maddas of الٓمٓ and طسٓمٓ separated for Wahio Arr'ahmaan"
    font.save(dst)
    print(f'added {len(chain_subtables)} contextual rules')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
