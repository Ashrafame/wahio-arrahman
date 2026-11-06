# Quran text source

`quran-uthmani.txt` is the **Tanzil Quran Text (Uthmani, version 1.1)**, downloaded
unmodified from https://tanzil.net/download on 2026-11-06 (Hafs narration).

- SHA-256: `6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f`
- Licence: Creative Commons Attribution 3.0 — verbatim copies only; **changing the
  text is not allowed**; the source (Tanzil Project) must be credited with a link to
  tanzil.net (done on the About screen).

## How the app uses it

`assets/data/quran_hafs.json` is generated from this file by
`npm run quran:build`, copying every ayah byte-for-byte. `npm run quran:verify`
checks the two match exactly, and runs automatically on every EAS build
(`eas-build-post-install`), so a build with even one altered character fails.

The only display-time processing is cutting the four-word basmala that Tanzil puts
at the start of ayah 1 (all surahs except 1 and 9) so the reader can show it above
the surah, as in the printed Mushaf. The verify script proves that every cut
rejoins to the original line exactly.

## Updating

If Tanzil publishes a correction (see https://tanzil.net/updates/): download the
new file, review it, replace this file, update `SOURCE_SHA256` in
`scripts/quran-text.mjs`, run `npm run quran:build`, and commit the three together.
