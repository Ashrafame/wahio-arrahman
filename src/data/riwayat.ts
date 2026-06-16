export interface RiwayahDetail {
  id: string;
  titleAr: string;
  titleEn: string;
  chainAr: string;
  chainEn: string;
  originAr: string;
  originEn: string;
  namingAr: string;
  namingEn: string;
}

export const FEATURED_RIWAYAT: RiwayahDetail[] = [
  {
    id: 'hafs',
    titleAr: 'حفص عن عاصم',
    titleEn: 'Hafs ʻan ʻAsim',
    chainAr:
      'هي رواية الإمام حفص بن سليمان الكوفي (ت ١٨٠هـ)، عن شيخه الإمام عاصم بن أبي النَّجود الكوفي (ت ١٢٧هـ)، أحد القراء السبعة المشهورين، وقد قرأ عاصم على أبي عبد الرحمن السُّلَمي، وهو قرأ على عثمان بن عفان وعلي بن أبي طالب وزيد بن ثابت وعبد الله بن مسعود رضي الله عنهم، وهؤلاء قرؤوا على رسول الله ﷺ.',
    chainEn:
      'Transmitted by Imam Hafs ibn Sulayman al-Kufi (d. 180 AH) from his teacher Imam ʻAsim ibn Abi al-Najud al-Kufi (d. 127 AH), one of the famous Seven Readers. ʻAsim learned from Abu ʻAbd al-Rahman al-Sulami, who learned from companions ʻUthman, ʻAli, Zayd ibn Thabit and ʻAbdullah ibn Masʻud, who learned directly from the Prophet ﷺ.',
    originAr:
      'هي الرواية الأكثر انتشارًا في العالم الإسلامي اليوم، ويُقرأ بها في معظم بلاد المشرق العربي وتركيا وجنوب آسيا وكثير من أفريقيا، وهي المعتمدة في أغلب المطابع والمصاحف المنتشرة عالميًا.',
    originEn:
      'The most widely spread narration in the Muslim world today, used across most of the Arab East, Turkey, South Asia, and much of Africa; it is the basis of most globally printed copies of the Quran.',
    namingAr: 'سُمّيت بـ"حفص" نسبة إلى راويها حفص بن سليمان، و"عن عاصم" نسبة إلى شيخه الذي أخذ القراءة عنه.',
    namingEn:
      'Named "Hafs" after its transmitter Hafs ibn Sulayman, and "ʻan ʻAsim" ("from ʻAsim") after the teacher he learned the reading from.',
  },
  {
    id: 'qaloon',
    titleAr: 'قالون عن نافع',
    titleEn: 'Qaloon ʻan Nafiʻ',
    chainAr:
      'هي رواية الإمام أبي موسى عيسى بن مينا المعروف بـ"قالون" (ت نحو ٢٢٠هـ)، عن شيخه الإمام نافع بن عبد الرحمن بن أبي نُعيم المدني (ت ١٦٩هـ)، أحد القراء السبعة، وقد جمع نافع قراءته من سبعين من التابعين بالمدينة المنورة، ومن أشهر شيوخه أبو جعفر يزيد بن القعقاع وعبد الرحمن بن هرمز الأعرج، وسندهم متصل إلى الصحابة ثم إلى رسول الله ﷺ.',
    chainEn:
      'Transmitted by Imam Abu Musa ʻIsa ibn Mina, known as "Qaloon" (d. c. 220 AH), from his teacher Imam Nafiʻ ibn ʻAbd al-Rahman al-Madani (d. 169 AH), one of the Seven Readers. Nafiʻ combined the reading of seventy Madinan successors (Tabiʻin), most notably Abu Jaʻfar and al-Aʻraj, with a chain reaching back through the Companions to the Prophet ﷺ.',
    originAr:
      'تنتشر هذه الرواية تاريخيًا في ليبيا وتونس وبعض مناطق الجزائر والسودان وغرب أفريقيا، وكانت رواية أهل المدينة المنورة قديمًا.',
    originEn:
      'Historically widespread in Libya, Tunisia, parts of Algeria and Sudan, and West Africa; it was the reading of the people of Madinah in earlier centuries.',
    namingAr:
      'سُمّي "قالون" لقبًا أُطلق على عيسى بن مينا لجودة قراءته (يُقال إن معناها "جيّد" بالرومية)، و"عن نافع" نسبة لشيخه الذي تلقى عنه القراءة في المدينة.',
    namingEn:
      'Qaloon was a nickname given to ʻIsa ibn Mina for the excellence of his recitation (said to mean "excellent" in Latin/Greek-influenced speech), and "ʻan Nafiʻ" refers to the Madinan teacher he learned from.',
  },
];

export const OTHER_NARRATIONS_AR = [
  'ورش عن نافع — تنتشر في المغرب والجزائر وموريتانيا وغرب أفريقيا.',
  'البزّي وقنبل عن ابن كثير المكي — من قراء مكة المكرمة.',
  'الدُّوري والسُّوسي عن أبي عمرو البصري — من قراء البصرة.',
  'هشام وابن ذكوان عن ابن عامر الشامي — من قراء الشام.',
  'شعبة عن عاصم — الرواية الثانية عن عاصم الكوفي إلى جانب حفص.',
  'خلف وخلّاد عن حمزة الكوفي — من قراء الكوفة.',
  'أبو الحارث والدُّوري عن الكسائي الكوفي — تمام القراء السبعة.',
  'الثلاثة المتممة للعشر: قراءة أبي جعفر المدني، ويعقوب الحضرمي البصري، وخلف العاشر الكوفي — وهي إلى جانب السبعة تُكوّن "القراءات العشر" المتواترة.',
];

export const OTHER_NARRATIONS_EN = [
  "Warsh ʻan Nafiʻ — widespread in Morocco, Algeria, Mauritania, and West Africa.",
  "Al-Bazzi and Qunbul ʻan Ibn Kathir al-Makki — Makkan readers.",
  "Al-Duri and Al-Susi ʻan Abu ʻAmr al-Basri — Basran readers.",
  "Hisham and Ibn Dhakwan ʻan Ibn ʻAmir al-Shami — Levantine readers.",
  "Shuʻbah ʻan ʻAsim — the second narration from ʻAsim of Kufa alongside Hafs.",
  "Khalaf and Khallad ʻan Hamzah al-Kufi — Kufan readers.",
  "Abu al-Harith and Al-Duri ʻan al-Kisai al-Kufi — completing the Seven Readers.",
  "The three completing the Ten: Abu Jaʻfar al-Madani, Yaʻqub al-Hadrami of Basra, and Khalaf al-ʻAshir of Kufa — together with the Seven, these form the ten transmitted (mutawatir) readings.",
];
