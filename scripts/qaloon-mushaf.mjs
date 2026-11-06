#!/usr/bin/env node
// Builds and verifies the index of the Libyan Awqaf Qaloon Mushaf.
//
// Source: assets/source/qaloon-libyan-awqaf/ — 612 pages, each NNN.svg (the
// printed page as vector outlines) + NNN.json (where every ayah sits on the
// page). The SVG pages are NOT bundled in the app: they are downloaded on demand
// from the pinned commit below and checked against the SHA-256 recorded here,
// so the app can only ever show these exact pages.
//
//   node scripts/qaloon-mushaf.mjs build    regenerate assets/data/qaloon_libya.json
//   node scripts/qaloon-mushaf.mjs verify   check the index (and the source files, when present)

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets/source/qaloon-libyan-awqaf');
const OUTPUT = join(ROOT, 'assets/data/qaloon_libya.json');

// Commit that added the source pages. Pages are served from exactly this commit.
const COMMIT = '855092b0e219c19cd6b59170db1c6c0fd638e02f';
const PAGE_COUNT = 612;
const AYAH_COUNT = 6214; // Qaloon count
const SURAH_COUNT = 114;

function fail(message) {
  console.error(`✗ Qaloon Mushaf check failed: ${message}`);
  process.exit(1);
}

const pad3 = (n) => String(n).padStart(3, '0');
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// "M x y L x2 y L x2 y2 L x y2 Z" (one or more) -> [x, y, w, h, ...]
function rects(path, where) {
  const out = [];
  for (const sub of path.match(/M[^M]*/g) ?? []) {
    const n = (sub.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const xs = [n[0], n[2], n[4], n[6]];
    const ys = [n[1], n[3], n[5], n[7]];
    if (n.length !== 8 || new Set(xs).size !== 2 || new Set(ys).size !== 2) fail(`non-rectangular ayah shape in ${where}`);
    const x = Math.min(...xs), y = Math.min(...ys);
    out.push(x, y, Math.max(...xs) - x, Math.max(...ys) - y);
  }
  return out;
}

function build() {
  if (!existsSync(SOURCE)) fail(`source folder missing: ${SOURCE}`);
  const pages = [];
  for (let p = 1; p <= PAGE_COUNT; p++) {
    const meta = JSON.parse(readFileSync(join(SOURCE, `${pad3(p)}.json`), 'utf8'));
    const svg = readFileSync(join(SOURCE, `${pad3(p)}.svg`));
    if (meta.page !== p || meta.width !== 1120 || meta.height !== 2250) fail(`unexpected metadata on page ${p}`);
    pages.push({
      h: sha256(svg),
      a: meta.polygons.map((poly) => [poly.surah, poly.ayah, rects(poly.path, `page ${p} ayah ${poly.number}`)]),
    });
  }
  const out = {
    source: 'Libyan Awqaf Mushaf, Qaloon from Nafi',
    commit: COMMIT,
    width: 1120,
    height: 2250,
    pages,
  };
  check(out);
  writeFileSync(OUTPUT, JSON.stringify(out) + '\n');
  console.log(`✓ wrote ${PAGE_COUNT} pages to ${OUTPUT}`);
}

function check(index) {
  if (index.pages.length !== PAGE_COUNT) fail(`expected ${PAGE_COUNT} pages, found ${index.pages.length}`);
  const seen = new Map();
  index.pages.forEach((page, i) => {
    if (!/^[0-9a-f]{64}$/.test(page.h)) fail(`bad hash on page ${i + 1}`);
    for (const [s, a, r] of page.a) {
      if (!r.length || r.length % 4) fail(`bad ayah shape ${s}:${a} on page ${i + 1}`);
      seen.set(`${s}:${a}`, true);
    }
  });
  const surahs = new Set([...seen.keys()].map((k) => k.split(':')[0]));
  if (surahs.size !== SURAH_COUNT) fail(`expected ${SURAH_COUNT} surahs, found ${surahs.size}`);
  if (seen.size !== AYAH_COUNT) fail(`expected ${AYAH_COUNT} ayahs, found ${seen.size}`);
  for (const s of surahs) {
    const ayahs = [...seen.keys()].filter((k) => k.startsWith(`${s}:`)).map((k) => Number(k.split(':')[1]));
    const max = Math.max(...ayahs);
    if (ayahs.length !== max) fail(`surah ${s} has gaps in its ayah numbers`);
  }
}

function verify() {
  const index = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  if (index.commit !== COMMIT) fail('index was built for a different commit');
  check(index);
  // The source pages are excluded from EAS uploads (.easignore), which can leave
  // an empty folder behind; check them only when they are actually present.
  const svgs = existsSync(SOURCE) ? readdirSync(SOURCE).filter((f) => f.endsWith('.svg')) : [];
  if (svgs.length === 0) {
    console.log('• source pages not present (EAS upload); checking the bundled index only');
  } else {
    if (svgs.length !== PAGE_COUNT) fail(`source has ${svgs.length} of ${PAGE_COUNT} pages`);
    index.pages.forEach((page, i) => {
      if (sha256(readFileSync(join(SOURCE, `${pad3(i + 1)}.svg`))) !== page.h) fail(`page ${i + 1} differs from its recorded hash`);
    });
    console.log(`✓ all ${PAGE_COUNT} source pages match their recorded SHA-256`);
  }
  console.log(`✓ Qaloon Mushaf index: ${PAGE_COUNT} pages, ${SURAH_COUNT} surahs, ${AYAH_COUNT} ayahs, no gaps`);
}

const command = process.argv[2];
if (command === 'build') build();
else if (command === 'verify') verify();
else fail('usage: node scripts/qaloon-mushaf.mjs <build|verify>');
