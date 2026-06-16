// Sunni-perspective occasions only (no Shia-specific commemorations).
export interface HijriEvent {
  month: number; // 1-12
  day: number;
  titleAr: string;
  titleEn: string;
  noteAr?: string;
  noteEn?: string;
}

export const HIJRI_EVENTS: HijriEvent[] = [
  {
    month: 1,
    day: 1,
    titleAr: 'رأس السنة الهجرية',
    titleEn: 'Islamic New Year',
  },
  {
    month: 1,
    day: 10,
    titleAr: 'يوم عاشوراء',
    titleEn: 'Day of Ashura',
    noteAr: 'يُسنّ صيامه شكرًا لله على نجاة موسى عليه السلام، ويُستحب صيام يوم قبله أو بعده.',
    noteEn: "Recommended fasting day commemorating Musa's (Moses) salvation; fasting an adjacent day too is preferred.",
  },
  {
    month: 3,
    day: 12,
    titleAr: 'ذكرى المولد النبوي',
    titleEn: "Prophet's Birth Anniversary",
    noteAr: 'ذكرى مولد النبي محمد ﷺ.',
    noteEn: 'Commemoration of the birth of Prophet Muhammad (peace be upon him).',
  },
  {
    month: 7,
    day: 27,
    titleAr: 'الإسراء والمعراج',
    titleEn: 'Isra and Mi’raj (Night Journey & Ascension)',
    noteAr: 'التاريخ المتداول شعبيًا لذكرى رحلة الإسراء والمعراج.',
    noteEn: 'Commonly cited popular date for the Night Journey and Ascension.',
  },
  {
    month: 9,
    day: 1,
    titleAr: 'بداية شهر رمضان',
    titleEn: 'Start of Ramadan',
    noteAr: 'تقديري؛ يُحدَّد فعليًا برؤية الهلال.',
    noteEn: 'Approximate; actually determined by moon sighting.',
  },
  {
    month: 9,
    day: 17,
    titleAr: 'غزوة بدر الكبرى',
    titleEn: 'Battle of Badr',
  },
  {
    month: 9,
    day: 20,
    titleAr: 'فتح مكة',
    titleEn: 'Conquest of Makkah',
  },
  {
    month: 9,
    day: 27,
    titleAr: 'ليلة القدر (الأرجح)',
    titleEn: 'Laylat al-Qadr (most likely night)',
    noteAr: 'يُرجَّح كونها في وتر العشر الأواخر من رمضان، وأشهرها ليلة السابع والعشرين.',
    noteEn: 'Most likely among the odd nights of the last ten nights of Ramadan; the 27th is the most popularly cited.',
  },
  {
    month: 10,
    day: 1,
    titleAr: 'عيد الفطر',
    titleEn: 'Eid al-Fitr',
  },
  {
    month: 10,
    day: 7,
    titleAr: 'غزوة أُحُد',
    titleEn: 'Battle of Uhud',
  },
  {
    month: 11,
    day: 1,
    titleAr: 'غزوة الخندق (الأحزاب)',
    titleEn: 'Battle of the Trench (al-Ahzab)',
    noteAr: 'وقعت في شوال وذي القعدة من السنة الخامسة للهجرة.',
    noteEn: 'Took place across Shawwal and Dhu al-Qi’dah in the 5th year of Hijrah.',
  },
  {
    month: 12,
    day: 1,
    titleAr: 'بداية شهر ذو الحجة',
    titleEn: 'Start of Dhu al-Hijjah',
  },
  {
    month: 12,
    day: 9,
    titleAr: 'يوم عرفة',
    titleEn: 'Day of Arafah',
    noteAr: 'يُسنّ صيامه لغير الحاج.',
    noteEn: 'Recommended fasting day for those not performing Hajj.',
  },
  {
    month: 12,
    day: 10,
    titleAr: 'عيد الأضحى',
    titleEn: 'Eid al-Adha',
  },
];
