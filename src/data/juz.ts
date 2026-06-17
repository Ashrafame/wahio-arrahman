export interface JuzInfo {
  number: number;
  nameAr: string;
  nameEn: string;
  startSurah: number;
  startAyah: number;
}

// Based on verified Mushaf sources with Kufic (Hafs) and Madani (Qaloon) verse counting
export const JUZ_DATA_HAFS: JuzInfo[] = [
  { number: 1,  nameAr: 'الحمد لله',       nameEn: 'Al-Hamdu Lillah',       startSurah: 1,  startAyah: 1   },
  { number: 2,  nameAr: 'سيقول السفهاء',   nameEn: 'Sayaqul al-Sufaha',     startSurah: 2,  startAyah: 142 },
  { number: 3,  nameAr: 'تلك الرسل',       nameEn: 'Tilka ar-Rusul',        startSurah: 2,  startAyah: 253 },
  { number: 4,  nameAr: 'لن تنالوا',       nameEn: 'Lan Tanaalu',           startSurah: 3,  startAyah: 93  },
  { number: 5,  nameAr: 'والمحصنات من',    nameEn: 'Wal-Muhsanatu min',     startSurah: 4,  startAyah: 24  },
  { number: 6,  nameAr: 'لا يحب الله',     nameEn: 'La Yuhibb Allah',       startSurah: 4,  startAyah: 148 },
  { number: 7,  nameAr: 'وإذا سمعوا',     nameEn: 'Wa Iza Samiu',          startSurah: 5,  startAyah: 83  },
  { number: 8,  nameAr: 'ولو أننا',       nameEn: 'Wa Law Annana',         startSurah: 6,  startAyah: 111 },
  { number: 9,  nameAr: 'قال الملأ',      nameEn: 'Qala al-Mala',          startSurah: 7,  startAyah: 88  },
  { number: 10, nameAr: 'واعلموا أنما',   nameEn: "Wa'lamu Annama",        startSurah: 8,  startAyah: 41  },
  { number: 11, nameAr: 'يعتذرون إليكم', nameEn: "Ya'taziruna Ilaykum",   startSurah: 9,  startAyah: 101 },
  { number: 12, nameAr: 'وما من',         nameEn: 'Wa Ma Min',             startSurah: 11, startAyah: 6   },
  { number: 13, nameAr: 'وما أبرئ',      nameEn: 'Wa Ma Ubari',           startSurah: 12, startAyah: 53  },
  { number: 14, nameAr: 'الر تلك',        nameEn: 'Alif Lam Ra Tilka',     startSurah: 15, startAyah: 1   },
  { number: 15, nameAr: 'سبحان الذي',     nameEn: 'Subhana alladhi',       startSurah: 17, startAyah: 1   },
  { number: 16, nameAr: 'قال ألم',        nameEn: 'Qala Alam',             startSurah: 18, startAyah: 75  },
  { number: 17, nameAr: 'اقترب للناس',   nameEn: 'Iqtaraba lil-Nas',      startSurah: 21, startAyah: 1   },
  { number: 18, nameAr: 'قد أفلح',       nameEn: 'Qad Aflaha',            startSurah: 23, startAyah: 1   },
  { number: 19, nameAr: 'وقال الذين',    nameEn: 'Wa Qala alladhin',      startSurah: 25, startAyah: 21  },
  { number: 20, nameAr: 'فما كان',       nameEn: 'Fa Ma Kana',            startSurah: 28, startAyah: 56  },
  { number: 21, nameAr: 'ولا تجادلوا',   nameEn: 'Wa La Tujadilu',        startSurah: 29, startAyah: 46  },
  { number: 22, nameAr: 'ومن يقنت',      nameEn: 'Wa Man Yaqnut',         startSurah: 33, startAyah: 31  },
  { number: 23, nameAr: 'وما أنزلنا',    nameEn: 'Wa Ma Anzalna',         startSurah: 36, startAyah: 28  },
  { number: 24, nameAr: 'فمن أظلم',      nameEn: 'Fa Man Azlam',          startSurah: 39, startAyah: 32  },
  { number: 25, nameAr: 'إليه يرد',      nameEn: 'Ilayhi Yuradu',         startSurah: 41, startAyah: 47  },
  { number: 26, nameAr: 'حم تنزيل',      nameEn: 'Ha Meem Tanzeel',       startSurah: 46, startAyah: 1   },
  { number: 27, nameAr: 'قال فما',       nameEn: 'Qala Fa Ma',            startSurah: 51, startAyah: 27  },
  { number: 28, nameAr: 'قد سمع',        nameEn: 'Qad Samia',             startSurah: 58, startAyah: 1   },
  { number: 29, nameAr: 'تبارك الذي',    nameEn: 'Tabaraka alladhi',      startSurah: 67, startAyah: 1   },
  { number: 30, nameAr: 'عمّ يتساءلون', nameEn: "'Amma Yatasaa'alun",    startSurah: 78, startAyah: 1   },
];

export const JUZ_DATA_QALOON: JuzInfo[] = [
  { number: 1,  nameAr: 'الحمد لله',       nameEn: 'Al-Hamdu Lillah',       startSurah: 1,  startAyah: 1   },
  { number: 2,  nameAr: 'سيقول السفهاء',   nameEn: 'Sayaqul al-Sufaha',     startSurah: 2,  startAyah: 141 },
  { number: 3,  nameAr: 'تلك الرسل',       nameEn: 'Tilka ar-Rusul',        startSurah: 2,  startAyah: 252 },
  { number: 4,  nameAr: 'لن تنالوا',       nameEn: 'Lan Tanaalu',           startSurah: 3,  startAyah: 91  },
  { number: 5,  nameAr: 'والمحصنات من',    nameEn: 'Wal-Muhsanatu min',     startSurah: 4,  startAyah: 23  },
  { number: 6,  nameAr: 'لا يحب الله',     nameEn: 'La Yuhibb Allah',       startSurah: 4,  startAyah: 147 },
  { number: 7,  nameAr: 'وإذا سمعوا',     nameEn: 'Wa Iza Samiu',          startSurah: 5,  startAyah: 85  },
  { number: 8,  nameAr: 'ولو أننا',       nameEn: 'Wa Law Annana',         startSurah: 6,  startAyah: 111 },
  { number: 9,  nameAr: 'قال الملأ',      nameEn: 'Qala al-Mala',          startSurah: 7,  startAyah: 86  },
  { number: 10, nameAr: 'واعلموا أنما',   nameEn: "Wa'lamu Annama",        startSurah: 8,  startAyah: 42  },
  { number: 11, nameAr: 'يعتذرون إليكم', nameEn: "Ya'taziruna Ilaykum",   startSurah: 9,  startAyah: 101 },
  { number: 12, nameAr: 'وما من',         nameEn: 'Wa Ma Min',             startSurah: 11, startAyah: 6   },
  { number: 13, nameAr: 'وما أبرئ',      nameEn: 'Wa Ma Ubari',           startSurah: 12, startAyah: 53  },
  { number: 14, nameAr: 'الر تلك',        nameEn: 'Alif Lam Ra Tilka',     startSurah: 15, startAyah: 1   },
  { number: 15, nameAr: 'سبحان الذي',     nameEn: 'Subhana alladhi',       startSurah: 17, startAyah: 1   },
  { number: 16, nameAr: 'قال ألم',        nameEn: 'Qala Alam',             startSurah: 18, startAyah: 72  },
  { number: 17, nameAr: 'اقترب للناس',   nameEn: 'Iqtaraba lil-Nas',      startSurah: 21, startAyah: 1   },
  { number: 18, nameAr: 'قد أفلح',       nameEn: 'Qad Aflaha',            startSurah: 23, startAyah: 1   },
  { number: 19, nameAr: 'وقال الذين',    nameEn: 'Wa Qala alladhin',      startSurah: 25, startAyah: 19  },
  { number: 20, nameAr: 'فما كان',       nameEn: 'Fa Ma Kana',            startSurah: 28, startAyah: 55  },
  { number: 21, nameAr: 'ولا تجادلوا',   nameEn: 'Wa La Tujadilu',        startSurah: 29, startAyah: 45  },
  { number: 22, nameAr: 'ومن يقنت',      nameEn: 'Wa Man Yaqnut',         startSurah: 33, startAyah: 31  },
  { number: 23, nameAr: 'وما أنزلنا',    nameEn: 'Wa Ma Anzalna',         startSurah: 36, startAyah: 27  },
  { number: 24, nameAr: 'فمن أظلم',      nameEn: 'Fa Man Azlam',          startSurah: 39, startAyah: 32  },
  { number: 25, nameAr: 'إليه يرد',      nameEn: 'Ilayhi Yuradu',         startSurah: 41, startAyah: 46  },
  { number: 26, nameAr: 'حم تنزيل',      nameEn: 'Ha Meem Tanzeel',       startSurah: 45, startAyah: 1   },
  { number: 27, nameAr: 'قال فما',       nameEn: 'Qala Fa Ma',            startSurah: 51, startAyah: 27  },
  { number: 28, nameAr: 'قد سمع',        nameEn: 'Qad Samia',             startSurah: 58, startAyah: 1   },
  { number: 29, nameAr: 'تبارك الذي',    nameEn: 'Tabaraka alladhi',      startSurah: 67, startAyah: 1   },
  { number: 30, nameAr: 'عمّ يتساءلون', nameEn: "'Amma Yatasaa'alun",    startSurah: 78, startAyah: 1   },
];

// Keep for backwards compatibility
export const JUZ_DATA = JUZ_DATA_QALOON;
