export type Language = 'ar' | 'en';

export const STRINGS = {
  appNameArabic: { ar: 'وَحْيُ الرَّحْمَن', en: 'وَحْيُ الرَّحْمَن' },
  appNameEnglish: { ar: "Wahio Arr'ah", en: "Wahio Arr'ah" },
  home: { ar: 'الرئيسية', en: 'Home' },
  surahs: { ar: 'السور', en: 'Surahs' },
  search: { ar: 'بحث', en: 'Search' },
  searchPlaceholder: {
    ar: 'ابحث عن سورة، آية (٢:٢٥٥) أو كلمة...',
    en: 'Search a surah, verse (2:255) or word...',
  },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  noResults: { ar: 'لا توجد نتائج', en: 'No results found' },
  verses: { ar: 'آية', en: 'verses' },
  meccan: { ar: 'مكية', en: 'Meccan' },
  medinan: { ar: 'مدنية', en: 'Medinan' },
  qiraah: { ar: 'الرواية', en: 'Reading' },
  qiraahHafs: { ar: 'حفص عن عاصم', en: 'Hafs (an Asim)' },
  qiraahQaloon: { ar: 'قالون عن نافع', en: 'Qaloon (an Nafi)' },
  fontFamily: { ar: 'نوع الخط', en: 'Font' },
  fontSize: { ar: 'حجم الخط', en: 'Font size' },
  translation: { ar: 'الترجمة', en: 'Translation' },
  showTranslation: { ar: 'إظهار الترجمة الإنجليزية', en: 'Show English translation' },
  tafsir: { ar: 'التفسير', en: 'Tafsir' },
  selectTafsir: { ar: 'اختر التفسير', en: 'Select Tafsir' },
  language: { ar: 'اللغة', en: 'Language' },
  theme: { ar: 'المظهر', en: 'Theme' },
  light: { ar: 'فاتح', en: 'Light' },
  dark: { ar: 'داكن', en: 'Dark' },
  about: { ar: 'حول التطبيق', en: 'About' },
  loadingTafsir: { ar: 'جارٍ تحميل التفسير...', en: 'Loading tafsir...' },
  tafsirError: { ar: 'تعذّر تحميل التفسير، تحقق من الاتصال', en: 'Could not load tafsir, check your connection' },
  close: { ar: 'إغلاق', en: 'Close' },
  jumpTo: { ar: 'انتقال', en: 'Go' },
  small: { ar: 'صغير', en: 'Small' },
  medium: { ar: 'متوسط', en: 'Medium' },
  large: { ar: 'كبير', en: 'Large' },
  extraLarge: { ar: 'كبير جدًا', en: 'Extra large' },
  ayah: { ar: 'آية', en: 'Ayah' },
  surah: { ar: 'سورة', en: 'Surah' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  sources: {
    ar: 'النص القرآني من مصدر تنزيل (tanzil.net)، والتفاسير من مصادر موثوقة.',
    en: 'Quran text sourced from Tanzil (tanzil.net); tafsir from trusted sources.',
  },
  reciter: { ar: 'القارئ', en: 'Reciter' },
  selectReciter: { ar: 'اختر القارئ', en: 'Select Reciter' },
  qaloonSurahOnlyNotice: {
    ar: 'تنبيه: تسجيلات رواية قالون المتوفرة هي للسورة كاملة فقط، وستبدأ القراءة من أول السورة عند الضغط على أي آية.',
    en: 'Note: available Qaloon recordings cover the full surah only; playback starts from the beginning of the surah when you tap any ayah.',
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Language): string {
  return STRINGS[key][lang];
}
