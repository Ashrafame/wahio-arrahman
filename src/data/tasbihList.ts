export interface DhikrItem {
  id: string;
  textAr: string;
  textEn: string;
  defaultTarget: number;
}

export const TASBIH_LIST: DhikrItem[] = [
  { id: 'subhanallah', textAr: 'سُبْحَانَ اللَّهِ', textEn: 'Subhan Allah', defaultTarget: 33 },
  { id: 'alhamdulillah', textAr: 'الْحَمْدُ لِلَّهِ', textEn: 'Alhamdulillah', defaultTarget: 33 },
  { id: 'allahuakbar', textAr: 'اللَّهُ أَكْبَرُ', textEn: 'Allahu Akbar', defaultTarget: 34 },
  { id: 'lailahaillallah', textAr: 'لَا إِلَهَ إِلَّا اللَّهُ', textEn: 'La ilaha illallah', defaultTarget: 100 },
  { id: 'astaghfirullah', textAr: 'أَسْتَغْفِرُ اللَّهَ', textEn: 'Astaghfirullah', defaultTarget: 100 },
  { id: 'subhanallahwabihamdih', textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', textEn: 'Subhan Allahi wa bihamdih', defaultTarget: 100 },
  { id: 'lahawlawalaquwwah', textAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', textEn: 'La hawla wala quwwata illa billah', defaultTarget: 33 },
  { id: 'salahonprophet', textAr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', textEn: 'Allahumma salli ala Muhammad', defaultTarget: 33 },
  { id: 'hawqala', textAr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', textEn: 'Hasbunallahu wa niʻmal wakeel', defaultTarget: 33 },
];
