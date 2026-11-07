# وَحْيُ الرَّحْمَن (Wahio Arr'ah)

تطبيق قرآن كريم متكامل يدعم روايتي **حفص عن عاصم** و **قالون عن نافع**، مع بحث سريع
عن السور والآيات، ترجمة إنجليزية، وعدة تفاسير لمشاهير المفسرين، وتحكم كامل في الخط
وحجمه، وواجهة ثنائية اللغة (عربي/إنجليزي) مع دعم الوضع الداكن.

A complete Quran (Mus'haf) mobile app supporting both **Hafs (an Asim)** and
**Qaloon (an Nafi)** recitations, fast surah/ayah navigation and search, an
English translation, multiple classical tafsir books, adjustable fonts, and a
bilingual Arabic/English interface with dark mode.

## Tech stack

- [Expo](https://expo.dev) SDK 56 + React Native, TypeScript
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- All Quran text and the default tafsir are bundled locally as JSON for instant,
  offline-first reading. Additional tafsir editions are fetched on first view and
  then cached on-device.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (Android/iOS), press `w` for web, or run
`npm run android` / `npm run ios` with a configured native toolchain.

## Features

- **Two qira'at**: toggle between Hafs and Qaloon per-ayah text from the surah toolbar.
- **Search**: type a surah name (Arabic/English), a reference like `2:255`, or any
  Arabic/English word to jump straight to it.
- **Tafsir**: Al-Muyassar is bundled offline by default; Ibn Kathir, Al-Tabari,
  Al-Qurtubi, Al-Saadi, Al-Baghawi and Al-Jalalayn are available on demand (cached
  after first load) from the surah toolbar's tafsir picker.
- **Translation**: English (Yusuf Ali) toggle.
- **Typography**: switch between Amiri and Scheherazade New Quranic fonts, and four
  font-size presets.
- **Language & theme**: full Arabic/English UI switch (with RTL-aware layout) and
  light/dark themes, all persisted on-device.

## Data sources & attribution

- Quran text (Hafs & Qaloon) and the English translation are sourced from the
  open [`fawazahmed0/quran-api`](https://github.com/fawazahmed0/quran-api) dataset,
  itself built on texts distributed by [Tanzil](https://tanzil.net) and the King
  Fahd Quran Complex. Verse numbering is the standard Uthmani numbering.
- Tafsir texts (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Saadi, Al-Baghawi, Al-Jalalayn,
  Al-Muyassar) are sourced from the open [`spa5k/tafsir_api`](https://github.com/spa5k/tafsir_api)
  dataset.
- Fonts: [Amiri](https://github.com/aliftype/amiri) and
  [Scheherazade New](https://software.sil.org/scheherazade/) (both OFL-licensed),
  and [Cairo](https://github.com/Gue3bara/Cairo) for UI text.

Please always verify the Quran text against a certified physical Mus'haf before
any formal/official use — this is a reading and study aid, not a substitute for
a certified printed copy.

## Project structure

```
app/                  expo-router screens (index, surah/[number], search, settings)
src/components/       reusable UI (AyahCard, SurahListItem)
src/lib/quranData.ts  bundled data access, search and reference parsing
src/lib/tafsirRemote.ts on-demand tafsir fetch + AsyncStorage cache
src/store/            settings (language, qiraah, fonts, theme) persisted context
src/i18n/              Arabic/English UI strings
assets/data/           bundled Quran text, translation and Muyassar tafsir (JSON)
assets/fonts/          Amiri, Scheherazade New, Cairo
```
