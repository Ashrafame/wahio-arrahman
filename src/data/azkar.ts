import { StringKey } from '../i18n/translations';

export interface AzkarItem {
  textAr: string;
  repeat: number;
  source?: string;
}

export interface AzkarCategory {
  id: string;
  titleKey: StringKey;
  icon: string;
  items: AzkarItem[];
}

export const AZKAR_CATEGORIES: AzkarCategory[] = [
  {
    id: 'morning',
    titleKey: 'azkarMorning',
    icon: 'sunny-outline',
    items: [
      {
        textAr:
          'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        repeat: 1,
      },
      { textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', repeat: 100 },
      {
        textAr: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَحْيَيْنَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        repeat: 1,
      },
      {
        textAr:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ (سيد الاستغفار)',
        repeat: 1,
      },
      { textAr: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', repeat: 7 },
    ],
  },
  {
    id: 'evening',
    titleKey: 'azkarEvening',
    icon: 'moon-outline',
    items: [
      {
        textAr:
          'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        repeat: 1,
      },
      { textAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', repeat: 3 },
      {
        textAr:
          'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        repeat: 1,
      },
      { textAr: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', repeat: 3 },
    ],
  },
  {
    id: 'sleep',
    titleKey: 'azkarSleep',
    icon: 'bed-outline',
    items: [
      { textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', repeat: 1 },
      { textAr: 'سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٤)', repeat: 1 },
      {
        textAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        repeat: 3,
      },
    ],
  },
  {
    id: 'wakeUp',
    titleKey: 'azkarWakeUp',
    icon: 'alarm-outline',
    items: [
      {
        textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        repeat: 1,
      },
    ],
  },
  {
    id: 'travel',
    titleKey: 'azkarTravel',
    icon: 'airplane-outline',
    items: [
      {
        textAr:
          'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
        repeat: 1,
      },
      {
        textAr:
          'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ',
        repeat: 1,
      },
    ],
  },
  {
    id: 'enteringBathroom',
    titleKey: 'azkarEnteringBathroom',
    icon: 'water-outline',
    items: [
      { textAr: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', repeat: 1 },
      { textAr: 'غُفْرَانَكَ (تُقال عند الخروج)', repeat: 1 },
    ],
  },
  {
    id: 'kaffaratMajlis',
    titleKey: 'azkarKaffaratMajlis',
    icon: 'people-outline',
    items: [
      {
        textAr: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
        repeat: 1,
      },
    ],
  },
  {
    id: 'marriage',
    titleKey: 'azkarMarriage',
    icon: 'heart-outline',
    items: [
      { textAr: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', repeat: 1 },
      {
        textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ',
        repeat: 1,
      },
    ],
  },
  {
    id: 'eid',
    titleKey: 'azkarEid',
    icon: 'sparkles-outline',
    items: [
      { textAr: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ', repeat: 1 },
      { textAr: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ', repeat: 1 },
    ],
  },
  {
    id: 'newborn',
    titleKey: 'azkarNewborn',
    icon: 'happy-outline',
    items: [
      { textAr: 'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ وَرُزِقْتَ بِرَّهُ', repeat: 1 },
    ],
  },
  {
    id: 'eatingDrinking',
    titleKey: 'azkarEatingDrinking',
    icon: 'restaurant-outline',
    items: [
      { textAr: 'بِسْمِ اللَّهِ (قبل الطعام)', repeat: 1 },
      { textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', repeat: 1 },
    ],
  },
  {
    id: 'mosque',
    titleKey: 'azkarMosque',
    icon: 'business-outline',
    items: [
      { textAr: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ (عند الدخول)', repeat: 1 },
      { textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ (عند الخروج)', repeat: 1 },
    ],
  },
];
