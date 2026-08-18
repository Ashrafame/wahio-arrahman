// Sunni-perspective occasions only (no Shia-specific commemorations).
export interface HijriEvent {
  month: number; // 1-12
  day: number;
  titleAr: string;
  titleEn: string;
  noteAr?: string;
  noteEn?: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const HIJRI_EVENTS: HijriEvent[] = [
  {
    month: 1, day: 1,
    titleAr: 'رأس السنة الهجرية',
    titleEn: 'Islamic New Year',
    descriptionAr: 'يوم 1 محرم هو مطلع السنة الهجرية الجديدة. يستذكر المسلمون في هذا اليوم هجرة النبي محمد ﷺ من مكة المكرمة إلى المدينة المنورة عام 622م، وهي الحادثة التي اتُّخذت منطلقًا للتقويم الإسلامي بقرار من الخليفة عمر بن الخطاب رضي الله عنه. ويُستحب في هذا اليوم مراجعة النفس والتفكر في العام المنصرم والتجديد في النية والعزيمة.',
    descriptionEn: "The 1st of Muharram marks the start of the Islamic new year. Muslims reflect on the Prophet Muhammad's (ﷺ) Hijra (migration) from Makkah to Madinah in 622 CE — the event that Caliph ʿUmar ibn al-Khaṭṭāb chose as the starting point of the Islamic calendar. It is a time for self-reflection, gratitude, and renewed intentions.",
  },
  {
    month: 1, day: 10,
    titleAr: 'يوم عاشوراء',
    titleEn: 'Day of Ashura',
    noteAr: 'يُسنّ صيامه شكرًا لله على نجاة موسى عليه السلام، ويُستحب صيام يوم قبله أو بعده.',
    noteEn: "Recommended fasting day commemorating Musa's (Moses) salvation; fasting an adjacent day too is preferred.",
    descriptionAr: 'يوم العاشر من محرم يوم عظيم الفضل؛ أنجى الله فيه نبيه موسى عليه السلام وقومه من فرعون وأغرق فرعون وجنوده في البحر. فلمّا قدم النبي ﷺ المدينة وجد اليهود يصومونه، فصامه وأمر بصيامه وقال: "نحن أحق بموسى منكم". وثبت أنه يكفّر السنة الماضية. ويُستحب صيام يوم قبله (التاسع) أو بعده (الحادي عشر) مخالفةً لليهود.',
    descriptionEn: "The 10th of Muharram is a day of great virtue. Allah saved Prophet Musa (Moses) and his people from Pharaoh on this day and drowned Pharaoh and his army. When the Prophet ﷺ arrived in Madinah and found the Jews fasting this day, he fasted it too and said: 'We have more right to Musa than you.' The Prophet said its fast expiates the sins of the previous year. Fasting the 9th (Tasua') alongside it is recommended.",
  },
  {
    month: 3, day: 12,
    titleAr: 'ذكرى المولد النبوي',
    titleEn: "Prophet's Birth Anniversary",
    noteAr: 'ذكرى مولد النبي محمد ﷺ.',
    noteEn: 'Commemoration of the birth of Prophet Muhammad (peace be upon him).',
    descriptionAr: 'يُحيي كثير من المسلمين الثاني عشر من ربيع الأول ذكرى مولد سيد الخلق النبي محمد ﷺ عام 571م بمكة المكرمة في عام الفيل. وُلد ﷺ يتيم الأب وتوفيت أمه وهو في السادسة، فكفله جده عبد المطلب ثم عمه أبو طالب. بُعث رسولًا في سن الأربعين وأتم الله به نور الإسلام. ويُحتفى بهذه الذكرى بقراءة سيرته ﷺ والإكثار من الصلاة والسلام عليه.',
    descriptionEn: "Many Muslims observe the 12th of Rabīʿ al-Awwal as the birth anniversary of Prophet Muhammad ﷺ, born in Makkah around 570 CE in the Year of the Elephant. He was orphaned early and raised by his grandfather and uncle. At 40, he received revelation and spent 23 years guiding humanity. Observances often include reading his biography (Seerah), sending blessings upon him, and gathering for learning.",
  },
  {
    month: 7, day: 27,
    titleAr: 'الإسراء والمعراج',
    titleEn: 'Isra and Mi\'raj (Night Journey & Ascension)',
    noteAr: 'التاريخ المتداول شعبيًا لذكرى رحلة الإسراء والمعراج.',
    noteEn: 'Commonly cited popular date for the Night Journey and Ascension.',
    descriptionAr: 'في هذه الليلة المباركة من رجب أُسري بالنبي ﷺ جسدًا وروحًا من المسجد الحرام بمكة إلى المسجد الأقصى بالقدس (الإسراء)، ثم عُرج به إلى السماوات العلى حتى سدرة المنتهى (المعراج). رأى فيها ما رأى من آيات ربه، وفُرضت عليه وعلى أمته الصلوات الخمس. قال الله: ﴿سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الأَقْصَى﴾.',
    descriptionEn: "On this blessed night the Prophet ﷺ was taken from the Sacred Mosque in Makkah to al-Masjid al-Aqsa in Jerusalem (the Night Journey / Isra'), then ascended through the heavens to the Lote Tree (Mi'raj). He was shown the greatest signs of his Lord, and the five daily prayers were made obligatory. Allah says: 'Glory be to the One Who took His servant by night from al-Masjid al-Haram to al-Masjid al-Aqsa.' (Quran 17:1)",
  },
  {
    month: 9, day: 1,
    titleAr: 'بداية شهر رمضان',
    titleEn: 'Start of Ramadan',
    noteAr: 'تقديري؛ يُحدَّد فعليًا برؤية الهلال.',
    noteEn: 'Approximate; actually determined by moon sighting.',
    descriptionAr: 'رمضان هو التاسع من أشهر السنة الهجرية وأفضلها؛ فرض الله فيه الصيام على كل مسلم بالغ قادر. قال تعالى: ﴿شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدىً لِلنَّاسِ﴾. يمتنع الصائم عن الطعام والشراب والشهوات من الفجر حتى المغرب. وفيه تُفتح أبواب الجنة وتُغلق أبواب النار وتُصفَّد الشياطين. يبدأ برؤية هلاله.',
    descriptionEn: "Ramadan is the ninth and most virtuous month of the Islamic year. Allah says: 'The month of Ramadan in which was revealed the Quran, a guidance for the people.' (2:185). Muslims fast from dawn to sunset, abstaining from food, drink, and desires. The Prophet ﷺ said: 'When Ramadan arrives, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.' It begins with the sighting of its crescent moon.",
  },
  {
    month: 9, day: 17,
    titleAr: 'غزوة بدر الكبرى',
    titleEn: 'Battle of Badr',
    descriptionAr: 'في السابع عشر من رمضان عام 2هـ (624م) جرت المعركة الفاصلة الأولى في تاريخ الإسلام. واجه فيها 313 مسلمًا ما يقارب 1000 من قريش. نصر الله المؤمنين وقُتل أبو جهل وسبعون من قادة قريش وأُسر سبعون آخرون. سمّى الله يومها "يوم الفرقان": ﴿وَمَا أَنزَلْنَا عَلَى عَبْدِنَا يَوْمَ الْفُرْقَانِ يَوْمَ الْتَقَى الْجَمْعَانِ﴾.',
    descriptionEn: "On the 17th of Ramadan 2 AH (624 CE), the first decisive battle in Islamic history took place at Badr. About 313 poorly-equipped Muslims faced nearly 1,000 Qurayshi warriors. Allah granted the believers a stunning victory; Abu Jahl and seventy Qurayshi leaders were killed. Allah called it 'the Day of Criterion' (Quran 8:41) distinguishing truth from falsehood.",
  },
  {
    month: 9, day: 20,
    titleAr: 'فتح مكة',
    titleEn: 'Conquest of Makkah',
    descriptionAr: 'في العشرين من رمضان عام 8هـ (630م) دخل النبي ﷺ مكة فاتحًا بجيش من عشرة آلاف مسلم. أعلن العفو العام قائلًا: "اذهبوا فأنتم الطلقاء"، فعفا عمّن آذاه طويلًا. طاف بالكعبة وحطّم الأصنام التي كانت حولها، وأذّن بلال رضي الله عنه على ظهر الكعبة. كان فتحًا عظيمًا دخل على إثره الناس في دين الله أفواجًا.',
    descriptionEn: "On the 20th of Ramadan 8 AH (630 CE), the Prophet ﷺ entered Makkah triumphantly with an army of 10,000. He declared a general amnesty: 'Go, for you are free!' He circumambulated the Kaaba, destroyed the idols, and Bilal (RA) gave the call to prayer from atop the Kaaba. It was a decisive victory after which people entered Islam in multitudes.",
  },
  {
    month: 9, day: 27,
    titleAr: 'ليلة القدر (الأرجح)',
    titleEn: 'Laylat al-Qadr (most likely night)',
    noteAr: 'يُرجَّح كونها في وتر العشر الأواخر من رمضان، وأشهرها ليلة السابع والعشرين.',
    noteEn: 'Most likely among the odd nights of the last ten nights of Ramadan; the 27th is the most popularly cited.',
    descriptionAr: 'ليلة القدر خير من ألف شهر؛ قال الله تعالى: ﴿لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ﴾. فيها أنزل الله القرآن وتنزّل الملائكة وجبريل بإذن ربهم. كان النبي ﷺ يعتكف في العشر الأواخر من رمضان ويقول: "تحرّوها في الوتر من العشر الأواخر". ومن قامها إيمانًا واحتسابًا غُفر له ما تقدم من ذنبه. والأرجح أنها ليلة السابع والعشرين وإن لم يثبت ذلك قطعًا.',
    descriptionEn: "Laylat al-Qadr (the Night of Power) is better than a thousand months (Quran 97:3). On it, the Quran was first revealed and the angels descend by their Lord's permission. The Prophet ﷺ would seclude himself in the mosque (i'tikaf) during the last ten nights seeking it, saying 'Seek it among the odd nights of the last ten.' Whoever stands in prayer on it with faith and hope has their past sins forgiven. The 27th night is most commonly cited though not definitively confirmed.",
  },
  {
    month: 10, day: 1,
    titleAr: 'عيد الفطر',
    titleEn: 'Eid al-Fitr',
    descriptionAr: 'عيد الفطر يوم الفرح والشكر لإتمام صيام شهر رمضان. يُؤدَّى فيه صلاة العيد في الصحراء أو المصلى أو المسجد. ويُخرج فيه زكاة الفطر (فطرة) قبل الصلاة على كل مسلم قادر تطهيرًا لصيامه ومساعدةً للفقراء ليفرحوا في العيد. قال النبي ﷺ: "يوم فطركم من صيامكم". يتمثّل الاحتفال بالصلاة والتهنئة وزيارة الأهل والأحباء.',
    descriptionEn: "Eid al-Fitr (the Festival of Breaking the Fast) is a day of joy and gratitude marking the completion of Ramadan. The Eid prayer is performed in an open area or mosque. Zakat al-Fitr (a charity given before the prayer) is obligatory on every able Muslim to purify the fast and help the poor celebrate. The Prophet ﷺ called it 'the day of your breaking the fast.' Celebrations include prayer, greetings, visiting family, and sharing meals.",
  },
  {
    month: 10, day: 7,
    titleAr: 'غزوة أُحُد',
    titleEn: 'Battle of Uhud',
    descriptionAr: 'في السابع من شوال عام 3هـ (625م) جرت غزوة أُحد قرب جبل أُحد شمال المدينة المنورة. بدأت بانتصار للمسلمين ثم تحوّلت حين غادر الرماة موقعهم طمعًا في الغنيمة. استُشهد في هذه الغزوة سبعون من خيرة الصحابة في مقدّمتهم سيد الشهداء حمزة بن عبد المطلب رضي الله عنه. تعلّم منها المسلمون درسًا بالغ الأثر في طاعة القيادة.',
    descriptionEn: "On the 7th of Shawwal 3 AH (625 CE), the Battle of Uhud took place near Mount Uhud north of Madinah. It began as a Muslim victory but turned when the archers disobeyed orders and left their posts. Seventy companions were martyred, including Hamza ibn ʿAbd al-Muṭṭalib (RA), the 'Master of the Martyrs.' The battle taught a lasting lesson about obedience and remaining steadfast on the battlefield.",
  },
  {
    month: 11, day: 1,
    titleAr: 'غزوة الخندق (الأحزاب)',
    titleEn: 'Battle of the Trench (al-Ahzab)',
    noteAr: 'وقعت في شوال وذي القعدة من السنة الخامسة للهجرة.',
    noteEn: 'Took place across Shawwal and Dhu al-Qi\'dah in the 5th year of Hijrah.',
    descriptionAr: 'في السنة الخامسة للهجرة تحالفت قبائل عربية ويهودية وحاصرت المدينة المنورة بجيش يُقدَّر بعشرة آلاف مقاتل. أشار سلمان الفارسي رضي الله عنه بحفر خندق شمال المدينة فحفره المسلمون. دام الحصار قرابة شهر وكسر الله شوكة الأحزاب بريح وجنود غيبية. سمّى الله هذا الانتصار يوم الأحزاب وأنزل فيه سورة كاملة.',
    descriptionEn: "In 5 AH, Arab and Jewish tribes united against Islam, besieging Madinah with an army of approximately 10,000. Salman al-Farsi (RA) suggested digging a trench (khandaq) on Madinah's northern side. The siege lasted nearly a month until Allah broke the confederates with a fierce wind and unseen forces. Allah named the surah after this event (al-Ahzab) and it stands as a great victory through strategy and trust in Allah.",
  },
  {
    month: 12, day: 1,
    titleAr: 'بداية شهر ذو الحجة',
    titleEn: 'Start of Dhu al-Hijjah',
    descriptionAr: 'ذو الحجة هو الشهر الثاني عشر من السنة الهجرية وأحد الأشهر الحُرم. في أوائله تُؤدَّى مناسك الحج الركن الخامس من أركان الإسلام. قال النبي ﷺ: "ما من أيام العمل الصالح فيها أحب إلى الله من هذه العشر الأيام". يُستحب في العشر الأوائل منه الإكثار من التكبير والتهليل والتسبيح والصيام وعمل الخير.',
    descriptionEn: "Dhu al-Hijjah is the twelfth and final month of the Islamic year and one of the sacred months. It contains the rites of Hajj (pilgrimage) — the fifth pillar of Islam. The Prophet ﷺ said: 'There are no days in which righteous deeds are more beloved to Allah than these ten days.' The first ten days are especially virtuous for takbir, fasting, and good deeds.",
  },
  {
    month: 12, day: 9,
    titleAr: 'يوم عرفة',
    titleEn: 'Day of Arafah',
    noteAr: 'يُسنّ صيامه لغير الحاج.',
    noteEn: 'Recommended fasting day for those not performing Hajj.',
    descriptionAr: 'يوم عرفة التاسع من ذي الحجة هو ذروة مناسك الحج؛ يقف الحجاج بجبل عرفات من الزوال حتى غروب الشمس دعاءً وذكرًا وبكاءً بين يدي الله. قال النبي ﷺ: "الحج عرفة". أما لمن لم يحج فيُسنّ صيامه لقوله ﷺ: "صيام يوم عرفة أحتسب على الله أن يكفّر السنة التي قبله والسنة التي بعده". ويُكثَر فيه من الدعاء فأفضل دعاء دعاه النبي ﷺ يوم عرفة: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير".',
    descriptionEn: "The Day of Arafah (9th Dhu al-Hijjah) is the pinnacle of the Hajj pilgrimage. Pilgrims gather at Mount Arafat from midday until sunset in supplication and remembrance. The Prophet ﷺ said: 'Hajj is Arafah.' For those not on Hajj, fasting this day is highly recommended: 'I seek from Allah that fasting the Day of Arafah expiates the sins of the previous and coming year.' The best du'a on this day is: 'There is no god but Allah alone, without partner; to Him belongs dominion and praise, and He has power over all things.'",
  },
  {
    month: 12, day: 10,
    titleAr: 'عيد الأضحى',
    titleEn: 'Eid al-Adha',
    descriptionAr: 'عيد الأضحى "عيد النحر" يحلّ في العاشر من ذي الحجة. تُؤدَّى فيه صلاة العيد، ثم تُذبح الأضاحي من الأنعام (إبل أو بقر أو غنم) تقرّبًا لله وإحياءً لسنة إبراهيم عليه السلام حين فداه الله بكبش عظيم. قال الله: ﴿لَن يَنَالَ اللَّهَ لُحُومُهَا وَلَا دِمَاؤُهَا وَلَكِن يَنَالُهُ التَّقْوَى مِنكُمْ﴾. ويُكمله أيام التشريق الثلاثة (11-12-13 ذي الحجة) وهي أيام أكل وشرب وذكر لله.',
    descriptionEn: "Eid al-Adha (the Festival of Sacrifice) falls on the 10th of Dhu al-Hijjah. The Eid prayer is performed, then animals (camel, cow, or sheep) are sacrificed as an act of worship, following the tradition of Ibrahim (Abraham, AS) whom Allah ransomed with a great ram. Allah says: 'Their meat will not reach Allah, nor will their blood, but what reaches Him is piety from you.' (22:37). It is followed by the Days of Tashriq (11-13 Dhu al-Hijjah) for eating, drinking, and remembering Allah.",
  },
];
