import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';

export type CalculationMethodId = keyof typeof CalculationMethod;

export const CALCULATION_METHODS: { id: CalculationMethodId; nameAr: string; nameEn: string }[] = [
  { id: 'MuslimWorldLeague', nameAr: 'رابطة العالم الإسلامي', nameEn: 'Muslim World League' },
  { id: 'UmmAlQura', nameAr: 'جامعة أم القرى - مكة المكرمة', nameEn: 'Umm Al-Qura, Makkah' },
  { id: 'Egyptian', nameAr: 'الهيئة المصرية العامة للمساحة', nameEn: 'Egyptian General Authority' },
  { id: 'Karachi', nameAr: 'جامعة العلوم الإسلامية - كراتشي', nameEn: 'University of Islamic Sciences, Karachi' },
  { id: 'Dubai', nameAr: 'دائرة الشؤون الإسلامية - دبي', nameEn: 'Dubai (Awqaf)' },
  { id: 'Qatar', nameAr: 'قطر', nameEn: 'Qatar' },
  { id: 'Kuwait', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { id: 'Turkey', nameAr: 'رئاسة الشؤون الدينية - تركيا', nameEn: 'Diyanet, Turkey' },
  { id: 'Singapore', nameAr: 'سنغافورة', nameEn: 'Singapore (MUIS)' },
  { id: 'NorthAmerica', nameAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', nameEn: 'ISNA, North America' },
  { id: 'MoonsightingCommittee', nameAr: 'لجنة رؤية الهلال', nameEn: 'Moonsighting Committee' },
];

export const DEFAULT_CALCULATION_METHOD: CalculationMethodId = 'MuslimWorldLeague';

export interface DayPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export function computePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  methodId: CalculationMethodId
): DayPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod[methodId]();
  const times = new PrayerTimes(coordinates, date, params);
  return {
    date,
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export function computeQiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}
