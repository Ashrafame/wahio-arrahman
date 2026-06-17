export interface JuzInfo {
  number: number;
  nameAr: string;
  nameEn: string;
  startSurah: number;
  startAyah: number;
}

// Based on verified Mushaf sources with Kufic (Hafs) and Madani (Qaloon) verse counting
export const JUZ_DATA_HAFS: JuzInfo[] = [
  { number: 1,  nameAr: 'آلم',             nameEn: 'Alif Lam Meem',         startSurah: 1,  startAyah: 1   },
  { number: 2,  nameAr: 'سيقول السفهاء',   nameEn: 'Sayaqul al-Sufaha',     startSurah: 2,  startAyah: 142 },
  { number: 3,  nameAr: 'تلك الرسل',       nameEn: 'Tilka ar-Rusul',        startSurah: 2,  startAyah: 253 },
  { number: 4,  nameAr: 'كل الطعام',       nameEn: 'Kull at-Taaam',         startSurah: 3,  startAyah: 93  },
  { number: 5,  nameAr: 'والمحصنات',       nameEn: 'Wal-Muhsanatu',         startSurah: 4,  startAyah: 24  },
  { number: 6,  nameAr: 'لا يحب الله',     nameEn: 'La Yuhibb Allah',       startSurah: 4,  startAyah: 148 },
  { number: 7,  nameAr: 'لتجدن أشد',      nameEn: 'Latajidn Ashad',        startSurah: 5,  startAyah: 82  },
  { number: 8,  nameAr: 'ولو أننا نزلنا',  nameEn: 'Wa Law Annana Nazzalna', startSurah: 6,  startAyah: 111 },
  { number: 9,  nameAr: 'قال الملأ',      nameEn: 'Qala al-Mala',          startSurah: 7,  startAyah: 88  },
  { number: 10, nameAr: 'واعلموا',        nameEn: "Wa'lamu",              startSurah: 8,  startAyah: 41  },
  { number: 11, nameAr: 'إن الله اشترى',  nameEn: 'Inna Allah Ishtara',   startSurah: 9,  startAyah: 111 },
  { number: 12, nameAr: 'وما من دابة',    nameEn: 'Wa Ma Min Dabbah',     startSurah: 11, startAyah: 6   },
  { number: 13, nameAr: 'وما أبرئ',      nameEn: 'Wa Ma Ubari',           startSurah: 12, startAyah: 53  },
  { number: 14, nameAr: 'الر تلك',        nameEn: 'Alif Lam Ra Tilka',     startSurah: 15, startAyah: 1   },
  { number: 15, nameAr: 'سبحان',          nameEn: 'Subhana',               startSurah: 17, startAyah: 1   },
  { number: 16, nameAr: 'قال ألم',        nameEn: 'Qala Alam',             startSurah: 18, startAyah: 75  },
  { number: 17, nameAr: 'اقترب للناس',   nameEn: 'Iqtaraba lil-Nas',      startSurah: 21, startAyah: 1   },
  { number: 18, nameAr: 'قد أفلح',       nameEn: 'Qad Aflaha',            startSurah: 23, startAyah: 1   },
  { number: 19, nameAr: 'وقال الذين',    nameEn: 'Wa Qala alladhin',      startSurah: 25, startAyah: 21  },
  { number: 20, nameAr: 'فما كانا',      nameEn: 'Fa Ma Kana',            startSurah: 27, startAyah: 56  },
  { number: 21, nameAr: 'ولا تجادلوا',   nameEn: 'Wa La Tujadilu',        startSurah: 29, startAyah: 46  },
  { number: 22, nameAr: 'ومن يقنت',      nameEn: 'Wa Man Yaqnut',         startSurah: 33, startAyah: 31  },
  { number: 23, nameAr: 'وما أنزلنا',    nameEn: 'Wa Ma Anzalna',         startSurah: 36, startAyah: 28  },
  { number: 24, nameAr: 'فمن أظلم',      nameEn: 'Fa Man Azlam',          startSurah: 39, startAyah: 32  },
  { number: 25, nameAr: 'إليه يرد',      nameEn: 'Ilayhi Yuradu',         startSurah: 41, startAyah: 47  },
  { number: 26, nameAr: 'حم',             nameEn: 'Ha Meem',               startSurah: 46, startAyah: 1   },
  { number: 27, nameAr: 'قال فما خطبكم',  nameEn: 'Qala Fa Ma Khatbukum',  startSurah: 51, startAyah: 31  },
  { number: 28, nameAr: 'قد سمع',        nameEn: 'Qad Samia',             startSurah: 58, startAyah: 1   },
  { number: 29, nameAr: 'تبارك الذي',    nameEn: 'Tabaraka alladhi',      startSurah: 67, startAyah: 1   },
  { number: 30, nameAr: 'عم يتساءلون',   nameEn: "'Amma Yatasaa'alun",    startSurah: 78, startAyah: 1   },
];

export const JUZ_DATA_QALOON: JuzInfo[] = [
  { number: 1,  nameAr: 'آلم',             nameEn: 'Alif Lam Meem',         startSurah: 1,  startAyah: 1   },
  { number: 2,  nameAr: 'سيقول',          nameEn: 'Sayaqul',               startSurah: 2,  startAyah: 142 },
  { number: 3,  nameAr: 'تلك الرسل',       nameEn: 'Tilka ar-Rusul',        startSurah: 2,  startAyah: 251 },
  { number: 4,  nameAr: 'لن تنالوا البر', nameEn: 'Lan Tanaalu al-Birr',   startSurah: 3,  startAyah: 91  },
  { number: 5,  nameAr: 'وعاشروهن',       nameEn: 'Wa Ashiruhun',          startSurah: 4,  startAyah: 19  },
  { number: 6,  nameAr: 'لا يحب الله',     nameEn: 'La Yuhibb Allah',       startSurah: 4,  startAyah: 147 },
  { number: 7,  nameAr: 'لتجدن أشد',      nameEn: 'Latajidn Ashad',        startSurah: 5,  startAyah: 84  },
  { number: 8,  nameAr: 'ولو أننا',       nameEn: 'Wa Law Annana',         startSurah: 6,  startAyah: 112 },
  { number: 9,  nameAr: 'قال الملأ',      nameEn: 'Qala al-Mala',          startSurah: 7,  startAyah: 87  },
  { number: 10, nameAr: 'واعلموا',        nameEn: "Wa'lamu",              startSurah: 8,  startAyah: 41  },
  { number: 11, nameAr: 'وممن حولكم',     nameEn: 'Wa Mimman Hawlakum',   startSurah: 9,  startAyah: 102 },
  { number: 12, nameAr: 'وما من دابة',    nameEn: 'Wa Ma Min Dabbah',     startSurah: 11, startAyah: 6   },
  { number: 13, nameAr: 'وما أبرئ',      nameEn: 'Wa Ma Ubari',           startSurah: 12, startAyah: 53  },
  { number: 14, nameAr: 'ألر تلك',        nameEn: 'Alif Lam Ra Tilka',     startSurah: 15, startAyah: 1   },
  { number: 15, nameAr: 'سبحان',          nameEn: 'Subhana',               startSurah: 17, startAyah: 1   },
  { number: 16, nameAr: 'قال ألم',        nameEn: 'Qala Alam',             startSurah: 18, startAyah: 74  },
  { number: 17, nameAr: 'اقترب للناس',   nameEn: 'Iqtaraba lil-Nas',      startSurah: 21, startAyah: 1   },
  { number: 18, nameAr: 'قد أفلح',       nameEn: 'Qad Aflaha',            startSurah: 23, startAyah: 1   },
  { number: 19, nameAr: 'وقال الذين',    nameEn: 'Wa Qala alladhin',      startSurah: 25, startAyah: 21  },
  { number: 20, nameAr: 'ولقد وصّلنا',    nameEn: 'Wa Laqad Wasalna',      startSurah: 27, startAyah: 51  },
  { number: 21, nameAr: 'ولا تجادلوا',   nameEn: 'Wa La Tujadilu',        startSurah: 29, startAyah: 46  },
  { number: 22, nameAr: 'ومن يقنت',      nameEn: 'Wa Man Yaqnut',         startSurah: 33, startAyah: 31  },
  { number: 23, nameAr: 'وما أنزلنا',    nameEn: 'Wa Ma Anzalna',         startSurah: 36, startAyah: 27  },
  { number: 24, nameAr: 'فمن أظلم',      nameEn: 'Fa Man Azlam',          startSurah: 39, startAyah: 31  },
  { number: 25, nameAr: 'إليه يرد',      nameEn: 'Ilayhi Yuradu',         startSurah: 41, startAyah: 46  },
  { number: 26, nameAr: 'حم',             nameEn: 'Ha Meem',               startSurah: 46, startAyah: 1   },
  { number: 27, nameAr: 'قال فما خطبكم',  nameEn: 'Qala Fa Ma Khatbukum',  startSurah: 51, startAyah: 31  },
  { number: 28, nameAr: 'قد سمع',        nameEn: 'Qad Samia',             startSurah: 58, startAyah: 1   },
  { number: 29, nameAr: 'تبارك الذي',    nameEn: 'Tabaraka alladhi',      startSurah: 67, startAyah: 1   },
  { number: 30, nameAr: 'عمَّ',           nameEn: "'Amma",                 startSurah: 78, startAyah: 1   },
];

// Keep for backwards compatibility
export const JUZ_DATA = JUZ_DATA_QALOON;
