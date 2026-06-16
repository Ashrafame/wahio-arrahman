import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TafsirEdition {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  bundled?: boolean;
}

export const TAFSIR_EDITIONS: TafsirEdition[] = [
  { id: 'muyassar', slug: 'ar-tafsir-muyassar', nameArabic: 'التفسير الميسر', nameEnglish: 'Al-Muyassar', bundled: true },
  { id: 'ibnkathir', slug: 'ar-tafsir-ibn-kathir', nameArabic: 'تفسير ابن كثير', nameEnglish: 'Ibn Kathir' },
  { id: 'tabari', slug: 'ar-tafsir-al-tabari', nameArabic: 'تفسير الطبري', nameEnglish: 'Al-Tabari' },
  { id: 'qurtubi', slug: 'ar-tafseer-al-qurtubi', nameArabic: 'تفسير القرطبي', nameEnglish: 'Al-Qurtubi' },
  { id: 'saadi', slug: 'ar-tafseer-al-saddi', nameArabic: 'تفسير السعدي', nameEnglish: 'Al-Saadi' },
  { id: 'baghawi', slug: 'ar-tafsir-al-baghawi', nameArabic: 'تفسير البغوي', nameEnglish: 'Al-Baghawi' },
  { id: 'jalalayn', slug: 'ar-tafsir-al-jalalayn', nameArabic: 'تفسير الجلالين', nameEnglish: 'Al-Jalalayn' },
];

interface RemoteTafsirAyah {
  surah: number;
  ayah: number;
  text: string;
}

const cacheKey = (slug: string, surah: number) => `tafsir:${slug}:${surah}`;

export async function fetchSurahTafsir(
  slug: string,
  surah: number
): Promise<Record<number, string>> {
  const key = cacheKey(slug, surah);
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const url = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${slug}/${surah}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load tafsir (${response.status})`);
  }
  const data: RemoteTafsirAyah[] = await response.json();
  const map: Record<number, string> = {};
  for (const entry of data) {
    map[entry.ayah] = entry.text;
  }
  await AsyncStorage.setItem(key, JSON.stringify(map));
  return map;
}
