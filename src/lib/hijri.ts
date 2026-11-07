export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export const HIJRI_MONTH_NAMES_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const HIJRI_MONTH_NAMES_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const ISLAMIC_EPOCH_JD = 1948440;

function gregorianToJD(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/** Approximate civil (tabular) Hijri conversion; may differ by ~1 day from local moon-sighting announcements. */
export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  let jdAdj = jd - ISLAMIC_EPOCH_JD + 10632;
  const n = Math.floor((jdAdj - 1) / 10631);
  jdAdj = jdAdj - 10631 * n + 354;
  const j =
    Math.floor((10985 - jdAdj) / 5316) * Math.floor((50 * jdAdj) / 17719) +
    Math.floor(jdAdj / 5670) * Math.floor((43 * jdAdj) / 15238);
  jdAdj =
    jdAdj -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * jdAdj) / 709);
  const day = jdAdj - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function hijriToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH_JD -
    1
  );
}

export function hijriToGregorian(year: number, month: number, day: number): Date {
  const jd = hijriToJD(year, month, day);
  const g = jdToGregorian(jd);
  return new Date(g.year, g.month - 1, g.day);
}

export function daysInHijriMonth(year: number, month: number): number {
  const next = month === 12 ? hijriToJD(year + 1, 1, 1) : hijriToJD(year, month + 1, 1);
  return next - hijriToJD(year, month, 1);
}
