import { StringKey } from '../i18n/translations';

export interface AzkarItem {
  textAr: string;
  textEn: string;
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
        textEn:
          'We have entered a new morning, and with it all dominion belongs to Allah. Praise be to Allah. There is no god but Allah, alone, without partner. To Him belongs all dominion and all praise, and He is over all things powerful.',
        repeat: 1,
      },
      {
        textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        textEn: 'Glory be to Allah and praise be to Him.',
        repeat: 100,
      },
      {
        textAr: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَحْيَيْنَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        textEn:
          'O Allah, by Your grace we have entered this morning, by Your grace we live, by Your will we die, and to You is our final return.',
        repeat: 1,
      },
      {
        textAr:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ (سيد الاستغفار)',
        textEn:
          'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I uphold Your covenant and Your promise to the best of my ability. (Sayyid al-Istighfar — The Master of Seeking Forgiveness)',
        repeat: 1,
      },
      {
        textAr: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        textEn:
          'Allah is sufficient for me; there is no god but He. Upon Him I place my trust, and He is the Lord of the Mighty Throne.',
        repeat: 7,
      },
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
        textEn:
          'We have entered the evening, and with it all dominion belongs to Allah. Praise be to Allah. There is no god but Allah, alone, without partner. To Him belongs all dominion and all praise, and He is over all things powerful.',
        repeat: 1,
      },
      {
        textAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        textEn: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        repeat: 3,
      },
      {
        textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        textEn: 'O Allah, I ask You for well-being in this world and in the Hereafter.',
        repeat: 1,
      },
      {
        textAr:
          'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        textEn:
          'In the name of Allah, with Whose name nothing in the earth or the sky can cause harm, and He is the All-Hearing, the All-Knowing.',
        repeat: 3,
      },
    ],
  },
  {
    id: 'sleep',
    titleKey: 'azkarSleep',
    icon: 'bed-outline',
    items: [
      {
        textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        textEn: 'In Your name, O Allah, I die and I live.',
        repeat: 1,
      },
      {
        textAr: 'سُبْحَانَ اللَّهِ (33)، وَالْحَمْدُ لِلَّهِ (33)، وَاللَّهُ أَكْبَرُ (34)',
        textEn:
          'SubhanAllah — Glory be to Allah (×33)\nAlhamdulillah — All praise be to Allah (×33)\nAllahu Akbar — Allah is the Greatest (×34)',
        repeat: 1,
      },
      {
        textAr: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        textEn: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
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
        textEn: 'All praise is due to Allah who gave us life after He took it from us, and to Him is the resurrection.',
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
        textEn:
          'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory be to He who has subjected this to us, and we could never have done so on our own. Indeed, to our Lord we shall return.',
        repeat: 1,
      },
      {
        textAr:
          'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ',
        textEn:
          'O Allah, we ask You on this journey for righteousness and God-consciousness, and for deeds that are pleasing to You.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'enteringBathroom',
    titleKey: 'azkarEnteringBathroom',
    icon: 'water-outline',
    items: [
      {
        textAr: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        textEn: 'In the name of Allah. O Allah, I seek Your refuge from male and female evil spirits.',
        repeat: 1,
      },
      {
        textAr: 'غُفْرَانَكَ (تُقال عند الخروج)',
        textEn: 'I seek Your forgiveness. (said upon leaving)',
        repeat: 1,
      },
    ],
  },
  {
    id: 'kaffaratMajlis',
    titleKey: 'azkarKaffaratMajlis',
    icon: 'people-outline',
    items: [
      {
        textAr:
          'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
        textEn:
          'Glory be to You, O Allah, and praise be to You. I testify that there is no god but You. I seek Your forgiveness and repent to You.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'marriage',
    titleKey: 'azkarMarriage',
    icon: 'heart-outline',
    items: [
      {
        textAr: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
        textEn: 'May Allah bless you and shower His blessings upon you, and may He unite you both in goodness.',
        repeat: 1,
      },
      {
        textAr:
          'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ',
        textEn:
          'O Allah, I ask You for her goodness and the goodness of her innate character, and I seek Your protection from her evil and the evil of her innate character.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'eid',
    titleKey: 'azkarEid',
    icon: 'sparkles-outline',
    items: [
      {
        textAr:
          'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
        textEn:
          'Allah is the Greatest, Allah is the Greatest. There is no god but Allah. Allah is the Greatest, Allah is the Greatest, and all praise belongs to Allah.',
        repeat: 1,
      },
      {
        textAr: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
        textEn: 'May Allah accept from us and from you.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'newborn',
    titleKey: 'azkarNewborn',
    icon: 'happy-outline',
    items: [
      {
        textAr:
          'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ وَرُزِقْتَ بِرَّهُ',
        textEn:
          'May Allah bless you in this gift bestowed upon you. May you give thanks to the Giver, may the child reach maturity, and may you be blessed with his righteousness.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'eatingDrinking',
    titleKey: 'azkarEatingDrinking',
    icon: 'restaurant-outline',
    items: [
      {
        textAr: 'بِسْمِ اللَّهِ (قبل الطعام)',
        textEn: 'In the name of Allah. (before eating)',
        repeat: 1,
      },
      {
        textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        textEn:
          'All praise be to Allah who fed me this and provided it for me without any power or strength on my part.',
        repeat: 1,
      },
    ],
  },
  {
    id: 'mosque',
    titleKey: 'azkarMosque',
    icon: 'business-outline',
    items: [
      {
        textAr: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ (عند الدخول)',
        textEn: 'O Allah, open for me the gates of Your mercy. (upon entering)',
        repeat: 1,
      },
      {
        textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ (عند الخروج)',
        textEn: 'O Allah, I ask You from Your bounty. (upon leaving)',
        repeat: 1,
      },
    ],
  },
];
