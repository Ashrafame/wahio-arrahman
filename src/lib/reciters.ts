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
  { id: 'husary', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary', folder: 'Husary_128kbps' },
  { id: 'sudais', nameAr: 'عبدالرحمن السديس', nameEn: 'Abdurrahman As-Sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'minshawy', nameAr: 'محمد صديق المنشاوي', nameEn: 'Mohamed Siddiq Al-Minshawy', folder: 'Minshawy_Murattal_128kbps' },
  { id: 'abdulbasit', nameAr: 'عبدالباسط عبدالصمد', nameEn: 'Abdul Basit Abdul Samad', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'ghamadi', nameAr: 'سعد الغامدي', nameEn: 'Saad Al-Ghamadi', folder: 'Ghamadi_40kbps' },
  { id: 'dussary', nameAr: 'ياسر الدوسري', nameEn: 'Yasser Ad-Dussary', folder: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'qasim', nameAr: 'محسن القاسم', nameEn: 'Muhsin Al-Qasim', folder: 'Muhsin_Al_Qasim_192kbps' },
  { id: 'alafasy', nameAr: 'مشاري العفاسي', nameEn: 'Mishary Alafasy', folder: 'Alafasy_128kbps' },
];

// Qaloon recitations from mp3quran (one file per surah, 114 surahs each). URLs
// are their current CDN paths from https://mp3quran.net/api/v3/reciters (the old
// serverN.mp3quran.net paths now answer with a 301 redirect to these).
export const QALOON_RECITERS: QaloonReciter[] = [
  { id: 'dokali', nameAr: 'الدوكالي محمد العالم', nameEn: 'Al-Dukali Muhammad Al-Alim', base: 'https://cdn.mp3quran.net/audio/dokali-alim/r1' },
  { id: 'abusnaina', nameAr: 'محمد أبو سنينة', nameEn: 'Muhammad Abu Sneina', base: 'https://cdn.mp3quran.net/audio/muhammad-abusnaina/r1' },
  { id: 'qeniwa', nameAr: 'محمد الأمين قنيوة', nameEn: 'Mohammed Al-Amin Qeniwa', base: 'https://cdn.mp3quran.net/audio/muhammad-qeniwa/r1' },
  { id: 'kshidan', nameAr: 'إبراهيم كشيدان', nameEn: 'Ibrahim Kshidan', base: 'https://cdn.mp3quran.net/audio/ibrahim-kshidan/r1' },
  { id: 'daawob', nameAr: 'طارق عبدالغني دعوب', nameEn: 'Tareq Abdulgani Daawob', base: 'https://cdn.mp3quran.net/audio/tareq-daawob/r1' },
  { id: 'akri', nameAr: 'مروان العكري', nameEn: 'Marwan Alakri', base: 'https://cdn.mp3quran.net/audio/marwan-akri/r1' },
  { id: 'naehi', nameAr: 'وليد النائحي (طريق أبي نشيط)', nameEn: 'Waleed Alnaehi (Abu Nashit)', base: 'https://cdn.mp3quran.net/audio/waleed-naehi/r1' },
  { id: 'trablsi', nameAr: 'أحمد الطرابلسي', nameEn: 'Ahmed Al-Trabulsi', base: 'https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r1' },
  { id: 'deban', nameAr: 'أحمد ديبان', nameEn: 'Ahmad Deban', base: 'https://cdn.mp3quran.net/audio/ahmad-deeban/r5' },
  { id: 'husary_qaloon', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Al-Husary', base: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r5' },
  { id: 'hudhaifi_qaloon', nameAr: 'علي الحذيفي', nameEn: 'Ali Al-Hudhaifi', base: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r2' },
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
