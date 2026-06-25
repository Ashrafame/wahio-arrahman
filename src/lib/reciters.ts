import { Qiraah } from './quranData';

export interface HafsReciter {
  id: string;
  nameAr: string;
  nameEn: string;
  /** everyayah.com folder name; files are served as {folder}/{SSS}{AAA}.mp3 */
  folder: string;
}

export interface QaloonReciter {
  id: string;
  nameAr: string;
  nameEn: string;
  /** mp3quran.net server base; files are served as {base}/{SSS}.mp3 (whole surah) */
  base: string;
  /** everyayah.com folder; when present, per-ayah files {folder}/{SSS}{AAA}.mp3 are used instead */
  folder?: string;
}

export const HAFS_RECITERS: HafsReciter[] = [
  { id: 'muaiqly', nameAr: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly', folder: 'Maher_AlMuaiqly_64kbps' },
  { id: 'alafasy', nameAr: 'مشاري العفاسي', nameEn: 'Mishary Alafasy', folder: 'Alafasy_128kbps' },
  { id: 'husary', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary', folder: 'Husary_128kbps' },
  { id: 'sudais', nameAr: 'عبدالرحمن السديس', nameEn: 'Abdurrahman As-Sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'minshawy', nameAr: 'محمد صديق المنشاوي', nameEn: 'Mohamed Siddiq Al-Minshawy', folder: 'Minshawy_Murattal_128kbps' },
  { id: 'abdulbasit', nameAr: 'عبدالباسط عبدالصمد', nameEn: 'Abdul Basit Abdul Samad', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'ghamadi', nameAr: 'سعد الغامدي', nameEn: 'Saad Al-Ghamadi', folder: 'Ghamadi_40kbps' },
  { id: 'dussary', nameAr: 'ياسر الدوسري', nameEn: 'Yasser Ad-Dussary', folder: 'Yasser_Ad-Dussary_128kbps' },
];

export const QALOON_RECITERS: QaloonReciter[] = [
  { id: 'deban', nameAr: 'أحمد ديبان', nameEn: 'Ahmad Deban', base: 'https://server16.mp3quran.net/deban/Rewayat-Qalon-A-n-Nafi' },
  { id: 'husary_qaloon', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary', base: 'https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi' },
  { id: 'trablsi', nameAr: 'أحمد الطرابلسي', nameEn: 'Ahmed Al-Trabulsi', base: 'https://server10.mp3quran.net/trablsi' },
  { id: 'kshidan', nameAr: 'إبراهيم قشيدان', nameEn: 'Ibrahim Qushaydan', base: 'https://server16.mp3quran.net/i_kshidan/Rewayat-Qalon-A-n-Nafi' },
  { id: 'daawob', nameAr: 'طارق ضعوب', nameEn: 'Tareq Daawob', base: 'https://server10.mp3quran.net/tareq' },
  { id: 'hudhaifi_qaloon', nameAr: 'علي الحذيفي', nameEn: 'Ali Al-Hudhaifi', base: 'https://server9.mp3quran.net/huthifi_qalon', folder: 'Hudhaify_128kbps' },
];

export const DEFAULT_HAFS_RECITER_ID = HAFS_RECITERS[0].id;
export const DEFAULT_QALOON_RECITER_ID = QALOON_RECITERS[0].id;

export function getRecitersForQiraah(qiraah: Qiraah): { id: string; nameAr: string; nameEn: string }[] {
  return qiraah === 'hafs' ? HAFS_RECITERS : QALOON_RECITERS;
}

export function getDefaultReciterId(qiraah: Qiraah): string {
  return qiraah === 'hafs' ? DEFAULT_HAFS_RECITER_ID : DEFAULT_QALOON_RECITER_ID;
}

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

export interface AyahAudio {
  url: string;
  /**
   * 'ayah' — url plays exactly the tapped ayah.
   * 'surah' — url plays the whole surah from its start (most Qaloon reciters).
   */
  granularity: 'ayah' | 'surah';
}

export function getAyahAudioUrl(
  chapter: number,
  verse: number,
  qiraah: Qiraah,
  reciterId: string
): AyahAudio | null {
  if (qiraah === 'hafs') {
    const reciter = HAFS_RECITERS.find((r) => r.id === reciterId) ?? HAFS_RECITERS[0];
    return {
      url: `https://everyayah.com/data/${reciter.folder}/${pad3(chapter)}${pad3(verse)}.mp3`,
      granularity: 'ayah',
    };
  }

  const reciter = QALOON_RECITERS.find((r) => r.id === reciterId) ?? QALOON_RECITERS[0];
  if (reciter.folder) {
    return {
      url: `https://everyayah.com/data/${reciter.folder}/${pad3(chapter)}${pad3(verse)}.mp3`,
      granularity: 'ayah',
    };
  }
  return {
    url: `${reciter.base}/${pad3(chapter)}.mp3`,
    granularity: 'surah',
  };
}
