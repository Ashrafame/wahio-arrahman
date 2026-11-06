#!/usr/bin/env node
// Builds and verifies the Quran text bundled in the app.
//
// The ONLY source of the Hafs text is assets/source/quran-uthmani.txt, the
// Tanzil Quran Text (Uthmani, v1.1) downloaded unmodified from tanzil.net.
// Tanzil's licence forbids changing the text, and so do we: every ayah is
// copied byte-for-byte into assets/data/quran_hafs.json, and `verify` fails if
// a single character differs from the source.
//
//   node scripts/quran-text.mjs build    regenerate quran_hafs.json from the source
//   node scripts/quran-text.mjs verify   check the source and the bundled copy match exactly
//
// `verify` also runs on every EAS build (eas-build-post-install in package.json),
// so an app with a mismatched Quran text can never be built.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets/source/quran-uthmani.txt');
const OUTPUT = join(ROOT, 'assets/data/quran_hafs.json');

// SHA-256 of the file as downloaded from tanzil.net (Uthmani v1.1, 2026-11-06).
// If Tanzil publishes a correction, download the new file, review it, then
// update this hash deliberately in its own commit.
const SOURCE_SHA256 = '6933e133dd56db778c801bf738848454e43648105a151e8d84d86a7cae39ec5f';

const AYAH_COUNT = 6236;
const SURAH_COUNT = 114;

function fail(message) {
  console.error(`✗ Quran text check failed: ${message}`);
  process.exit(1);
}

function readSource() {
  const raw = readFileSync(SOURCE);
  const sha = createHash('sha256').update(raw).digest('hex');
  if (sha !== SOURCE_SHA256) {
    fail(`${SOURCE} does not match the pinned Tanzil download (sha256 ${sha}).`);
  }

  const text = raw.toString('utf8');
  const ayahs = {};
  const notice = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('#')) {
      notice.push(line.replace(/^#\s?/, ''));
      continue;
    }
    if (line === '') continue;
    const first = line.indexOf('|');
    const second = line.indexOf('|', first + 1);
    if (first < 0 || second < 0) fail(`malformed line: ${line.slice(0, 40)}`);
    const surah = Number(line.slice(0, first));
    const ayah = Number(line.slice(first + 1, second));
    const key = `${surah}:${ayah}`;
    if (key in ayahs) fail(`duplicate ayah ${key}`);
    ayahs[key] = line.slice(second + 1);
  }

  const keys = Object.keys(ayahs);
  if (keys.length !== AYAH_COUNT) fail(`expected ${AYAH_COUNT} ayahs, found ${keys.length}`);
  const surahs = new Set(keys.map((k) => k.split(':')[0]));
  if (surahs.size !== SURAH_COUNT) fail(`expected ${SURAH_COUNT} surahs, found ${surahs.size}`);
  if (!notice.some((l) => l.includes('Tanzil Quran Text'))) fail('Tanzil copyright notice missing from source');

  return { ayahs, notice: notice.join('\n').trim() };
}

function build() {
  const { ayahs, notice } = readSource();
  const out = {
    source: 'Tanzil Project — https://tanzil.net',
    sourceFile: 'assets/source/quran-uthmani.txt',
    sourceSha256: SOURCE_SHA256,
    notice,
    ayahs,
  };
  writeFileSync(OUTPUT, JSON.stringify(out, null, 0) + '\n');
  console.log(`✓ wrote ${Object.keys(ayahs).length} ayahs to ${OUTPUT}`);
}

function verify() {
  const { ayahs } = readSource();
  const bundled = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  if (bundled.sourceSha256 !== SOURCE_SHA256) fail('bundled text was built from a different source file');
  const bundledKeys = Object.keys(bundled.ayahs ?? {});
  if (bundledKeys.length !== AYAH_COUNT) fail(`bundled text has ${bundledKeys.length} ayahs`);

  let mismatches = 0;
  for (const [key, text] of Object.entries(ayahs)) {
    if (bundled.ayahs[key] !== text) {
      mismatches++;
      if (mismatches <= 10) console.error(`  ayah ${key} differs from Tanzil`);
    }
  }
  if (mismatches) fail(`${mismatches} ayah(s) differ from the Tanzil source`);
  console.log(`✓ all ${AYAH_COUNT} ayahs match the Tanzil source exactly (sha256 ${SOURCE_SHA256.slice(0, 12)}…)`);

  verifyBasmalaSplit(ayahs);
  verifyWaqfDisplay(ayahs);
}

// Mirrors displayAyahText() in src/lib/quranData.ts, which drops the space
// before each waqf mark so the mark sits on its word. Prove that it removes
// nothing but spaces: with all spaces stripped, both texts must be identical.
function verifyWaqfDisplay(ayahs) {
  let removed = 0;
  for (const [key, text] of Object.entries(ayahs)) {
    const display = text.replace(/ (?=[ۖ-ۜ])/g, '');
    removed += text.length - display.length;
    if (display.replace(/ /g, '') !== text.replace(/ /g, '')) {
      fail(`waqf display transform changed more than spaces in ayah ${key}`);
    }
  }
  console.log(`✓ waqf marks attached to their words for display (${removed} spaces dropped, no other character touched)`);
}

// Mirrors splitBasmala() in src/lib/quranData.ts: ayah 1 of every surah except
// 1 and 9 starts with the four-word basmala, which the reader shows as a header.
// Prove the cut loses nothing: header + ' ' + ayah must equal the Tanzil line.
function verifyBasmalaSplit(ayahs) {
  const basmala = ayahs['1:1'].split(' ');
  let split = 0;
  for (let surah = 2; surah <= SURAH_COUNT; surah++) {
    const text = ayahs[`${surah}:1`];
    const words = text.split(' ');
    const starts = basmala.every((w, i) => i === 0 || words[i] === w);
    if (surah === 9) {
      if (starts) fail('At-Tawbah unexpectedly starts with a basmala');
      continue;
    }
    if (!starts || words.length <= basmala.length) fail(`surah ${surah} ayah 1 does not start with the basmala`);
    const head = words.slice(0, basmala.length).join(' ');
    const rest = words.slice(basmala.length).join(' ');
    if (`${head} ${rest}` !== text) fail(`basmala split of surah ${surah} is not lossless`);
    split++;
  }
  console.log(`✓ basmala shown as a header in ${split} surahs; every split rejoins to the Tanzil text exactly`);
}

const command = process.argv[2];
if (command === 'build') build();
else if (command === 'verify') verify();
else fail('usage: node scripts/quran-text.mjs <build|verify>');
