// Content on supererogatory and other prayers (النوافل والصلوات). Ahl-as-Sunnah
// fiqh: each entry gives the ruling, number of rak'ahs, how it is performed, and
// the evidence (Qur'an / authentic Sunnah). Content is qiraah-independent.

export type PrayerRuling =
  | 'sunnah_muakkadah' // سنة مؤكدة
  | 'sunnah'           // سنة / نافلة
  | 'fard_kifayah'     // فرض كفاية
  | 'fard_ayn';        // فرض عين

export interface RulingMeta {
  ar: string;
  en: string;
}

export const RULING_META: Record<PrayerRuling, RulingMeta> = {
  sunnah_muakkadah: { ar: 'سنة مؤكدة', en: 'Emphasised Sunnah' },
  sunnah: { ar: 'سنة / نافلة', en: 'Sunnah / Nafl' },
  fard_kifayah: { ar: 'فرض كفاية', en: 'Communal obligation' },
  fard_ayn: { ar: 'فرض عين', en: 'Individual obligation' },
};

export interface NaflPrayer {
  id: string;
  name: string;
  nameEn: string;
  ruling: PrayerRuling;
  rakaat?: string;
  rakaatEn?: string;
  how: string;
  howEn: string;
  evidence: string;
  evidenceEn: string;
}

export interface NaflSection {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  intro?: string;
  introEn?: string;
  prayers: NaflPrayer[];
}

export const NAFL_SECTIONS: NaflSection[] = [
  {
    id: 'rawatib',
    title: 'السنن الرواتب',
    titleEn: 'The Regular Sunnah Prayers',
    icon: 'repeat-outline',
    intro: 'نوافل تابعة للفرائض، تُصلّى قبلها أو بعدها، ويُستحب أداؤها في البيت.',
    introEn: 'Voluntary prayers attached to the obligatory prayers, offered before or after them; best performed at home.',
    prayers: [
      {
        id: 'rawatib_12',
        name: 'الرواتب المؤكدة (اثنتا عشرة ركعة)',
        nameEn: 'The Twelve Emphasised Rak‘ahs',
        ruling: 'sunnah_muakkadah',
        rakaat: '12 ركعة في اليوم والليلة',
        rakaatEn: '12 rak‘ahs across the day and night',
        how:
          'تُوزَّع اثنتا عشرة ركعةً على اليوم والليلة كالتالي: ركعتان قبل صلاة الفجر، وأربعٌ قبل الظهر (بتسليمتين) وركعتان بعده، وركعتان بعد المغرب، وركعتان بعد العشاء. تُصلّى ركعتين ركعتين بالتسليم بين كل ركعتين. وأوكدها وأخفّها ركعتا الفجر. أمّا العصر فليس لها راتبة مؤكدة، ويُستحب أربعٌ قبلها استحباباً غير مؤكد.',
        howEn:
          'The twelve rak‘ahs are: two before Fajr, four before Dhuhr (in two sets) and two after it, two after Maghrib, and two after Isha — each pair with its own tasleem. The two before Fajr are the most emphasised. Asr has no confirmed regular Sunnah, though four before it are recommended.',
        evidence:
          'عن أمّ حبيبة رضي الله عنها أن النبي ﷺ قال: «مَن صلّى اثنتَي عشْرةَ ركعةً في يومٍ وليلةٍ بُنِيَ له بهنّ بيتٌ في الجنة» (رواه مسلم). وقال ﷺ في ركعتَي الفجر: «ركعتا الفجرِ خيرٌ من الدنيا وما فيها» (رواه مسلم)، وكان ﷺ أشدَّ تعاهُداً عليهما من سائر النوافل (متفق عليه).',
        evidenceEn:
          'Umm Habibah (RA) reported that the Prophet ﷺ said: “Whoever prays twelve rak‘ahs in a day and night, a house will be built for him in Paradise” (Muslim). Of the two before Fajr he said: “They are better than the world and all it contains” (Muslim).',
      },
    ],
  },
  {
    id: 'other_sunan',
    title: 'صلوات ذوات الأسباب (سنن)',
    titleEn: 'Occasional Sunnah Prayers',
    icon: 'partly-sunny-outline',
    intro: 'صلوات مشروعة لأسباب معيّنة، حكمها سُنّية.',
    introEn: 'Prayers legislated for particular occasions; their ruling is Sunnah.',
    prayers: [
      {
        id: 'istikharah',
        name: 'صلاة الاستخارة',
        nameEn: 'Istikharah (Seeking Guidance)',
        ruling: 'sunnah',
        rakaat: 'ركعتان من غير الفريضة',
        rakaatEn: 'Two rak‘ahs (other than an obligatory prayer)',
        how:
          'إذا همّ العبد بأمرٍ مباحٍ فليصلِّ ركعتين من غير الفريضة، ثم يدعو بدعاء الاستخارة الوارد: «اللهم إني أستخيرك بعلمك، وأستقدرك بقدرتك، وأسألك من فضلك العظيم...» ويُسمّي حاجته في موضعها من الدعاء، ثم يمضي فيما ينشرح له صدره متوكّلاً على الله.',
        howEn:
          'When intending a permissible matter, pray two voluntary rak‘ahs, then recite the transmitted supplication of Istikharah (“O Allah, I seek Your guidance through Your knowledge...”), naming the need at its place, then proceed with what your heart inclines to, trusting in Allah.',
        evidence:
          'عن جابر رضي الله عنه قال: «كان رسول الله ﷺ يُعلِّمُنا الاستخارةَ في الأمور كلِّها، كما يُعلِّمُنا السورةَ من القرآن» (رواه البخاري).',
        evidenceEn:
          'Jabir (RA) said: “The Messenger of Allah ﷺ used to teach us Istikharah for all matters, as he taught us a surah of the Qur’an” (al-Bukhari).',
      },
      {
        id: 'hajah',
        name: 'صلاة الحاجة',
        nameEn: 'Prayer of Need',
        ruling: 'sunnah',
        rakaat: 'ركعتان',
        rakaatEn: 'Two rak‘ahs',
        how:
          'من كانت له حاجةٌ إلى الله أو إلى أحدٍ من الناس فليتوضّأ ويُحسِن الوضوء، ثم يصلّي ركعتين، ثم يُثني على الله ويُصلّي على النبي ﷺ، ثم يدعو بحاجته متضرّعاً. وأصلُ الفرج في تفريج الكرب هو اللجوء إلى الله بالصلاة والدعاء.',
        howEn:
          'One with a need turns to Allah: perform a complete ablution, pray two rak‘ahs, praise Allah, send blessings upon the Prophet ﷺ, then earnestly ask for the need. Turning to Allah in prayer and supplication is the root of relief from distress.',
        evidence:
          'قال الله تعالى: ﴿وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ﴾ [البقرة: 45]. وكان النبي ﷺ إذا حزَبَه أمرٌ فزِع إلى الصلاة (رواه أبو داود). وحديث صلاة الحاجة المرفوع في سنده مقال، والعمل على استحباب اللجوء إلى الصلاة عند الحاجة.',
        evidenceEn:
          'Allah says: “Seek help through patience and prayer” (2:45). Whenever something distressed the Prophet ﷺ, he would hasten to prayer (Abu Dawud). The specific “prayer of need” hadith has weakness in its chain, but turning to prayer in need is recommended.',
      },
      {
        id: 'istisqa',
        name: 'صلاة الاستسقاء',
        nameEn: 'Prayer for Rain (Istisqa)',
        ruling: 'sunnah_muakkadah',
        rakaat: 'ركعتان جهريّتان',
        rakaatEn: 'Two rak‘ahs recited aloud',
        how:
          'عند انقطاع المطر وحصول الجدب يخرج الناس مع الإمام إلى المصلّى متواضعين متضرّعين، فيصلّي بهم ركعتين يجهر فيهما بالقراءة كصلاة العيد، ثم يخطب ويُكثر من الاستغفار والدعاء بطلب الغيث، ويرفع يديه ويُحوِّل رداءه.',
        howEn:
          'In drought the people go out with the imam to an open prayer-ground, humble and imploring. He leads two rak‘ahs recited aloud (like the Eid prayer), then delivers a sermon abundant in seeking forgiveness and asking for rain, raising his hands and turning his cloak.',
        evidence:
          'عن عبد الله بن زيد رضي الله عنه: «خرج النبي ﷺ إلى المصلّى فاستسقى، فاستقبل القبلةَ وحوّل رداءَه، وصلّى ركعتين» (متفق عليه).',
        evidenceEn:
          '‘Abdullah ibn Zayd (RA) reported: “The Prophet ﷺ went out to the prayer-ground and prayed for rain, facing the qiblah, turning his cloak, and praying two rak‘ahs” (agreed upon).',
      },
      {
        id: 'kusuf',
        name: 'صلاة الكسوف والخسوف',
        nameEn: 'Prayer of the Solar/Lunar Eclipse',
        ruling: 'sunnah_muakkadah',
        rakaat: 'ركعتان في كل ركعة قيامان وركوعان',
        rakaatEn: 'Two rak‘ahs, each with two standings and two bowings',
        how:
          'إذا كسفت الشمس أو خسف القمر صُلّيت ركعتان جماعةً: يقرأ فيقيل، ثم يركع ركوعاً طويلاً، ثم يرفع فيقرأ قراءةً طويلةً دون الأولى، ثم يركع ثانياً، ثم يسجد؛ فيكون في كل ركعة قيامان وركوعان وسجودان. ويُستحب بعدها الذكر والدعاء والصدقة والاستغفار حتى تنجلي.',
        howEn:
          'At an eclipse two rak‘ahs are prayed in congregation: a long recitation, a long bowing, then rising with another (shorter) recitation and second bowing, then prostration — so each rak‘ah has two standings, two bowings and two prostrations. Afterwards: remembrance, supplication, charity and seeking forgiveness until it clears.',
        evidence:
          'قال ﷺ: «إنّ الشمسَ والقمرَ آيتانِ من آياتِ الله، لا يَنكسِفانِ لموتِ أحدٍ ولا لحياتِه، فإذا رأيتُم ذلك فادعوا اللهَ وصلّوا حتى ينكشِفَ ما بكم» (متفق عليه).',
        evidenceEn:
          'The Prophet ﷺ said: “The sun and the moon are two signs of Allah; they are not eclipsed for anyone’s death or life. When you see that, call upon Allah and pray until it clears” (agreed upon).',
      },
      {
        id: 'eidayn',
        name: 'صلاة العيدين',
        nameEn: 'The Two Eid Prayers',
        ruling: 'sunnah_muakkadah',
        rakaat: 'ركعتان جهريّتان بتكبيرات زوائد',
        rakaatEn: 'Two rak‘ahs recited aloud with extra takbirs',
        how:
          'تُصلّى ركعتان جماعةً في المصلّى بعد ارتفاع الشمس بلا أذانٍ ولا إقامة: يُكبِّر في الأولى سبعاً (سوى تكبيرة الإحرام) وفي الثانية خمساً، ويجهر بالقراءة، ثم يخطب الإمام بعد الصلاة. حكمها سنة مؤكدة عند الجمهور، وقيل فرض كفاية.',
        howEn:
          'Two rak‘ahs prayed in congregation after sunrise, without adhan or iqamah: seven extra takbirs in the first rak‘ah and five in the second, with recitation aloud, followed by a sermon. The majority hold it an emphasised Sunnah; some, a communal obligation.',
        evidence:
          'قال الله تعالى: ﴿فَصَلِّ لِرَبِّكَ وَانْحَرْ﴾ [الكوثر: 2]. وكان النبي ﷺ يخرج يومَ الفطر والأضحى إلى المصلّى فيصلّي بالناس ركعتين (متفق عليه).',
        evidenceEn:
          'Allah says: “So pray to your Lord and sacrifice” (108:2). The Prophet ﷺ would go out on Eid al-Fitr and al-Adha to the prayer-ground and lead the people in two rak‘ahs (agreed upon).',
      },
      {
        id: 'khawf',
        name: 'صلاة الخوف',
        nameEn: 'The Prayer of Fear',
        ruling: 'sunnah',
        rakaat: 'حسب الصلاة المفروضة (كيفية أداءٍ لا صلاةٌ مستقلة)',
        rakaatEn: 'As the obligatory prayer (a mode of performance, not a separate prayer)',
        how:
          'ليست صلاةً مستقلة، بل كيفيةٌ لأداء الفريضة حال القتال أو الخوف حفاظاً على الجماعة والحراسة. صفتها: تُقسَّم الطائفة فرقتين، تصلّي فرقةٌ مع الإمام ركعةً والأخرى تحرس، ثم يتبادلون؛ ووردت صفاتٌ متعددة صحّت عن النبي ﷺ يُعمَل بأيّها. وإن اشتدّ الخوف صلّوا رجالاً أو ركباناً على أيّ حال.',
        howEn:
          'Not a separate prayer but a way of performing the obligatory prayer during battle or fear, to preserve congregation and guarding. The group divides in two: one prays a rak‘ah with the imam while the other guards, then they switch. Several authentic forms are reported. If fear is severe, they pray on foot or mounted, however they can.',
        evidence:
          'قال الله تعالى: ﴿وَإِذَا كُنْتَ فِيهِمْ فَأَقَمْتَ لَهُمُ الصَّلَاةَ فَلْتَقُمْ طَائِفَةٌ مِنْهُمْ مَعَكَ﴾ [النساء: 102]، وصلّاها النبي ﷺ بأصحابه في غزواته (متفق عليه).',
        evidenceEn:
          'Allah says: “When you are among them and lead them in prayer, let a group of them stand with you...” (4:102). The Prophet ﷺ prayed it with his companions during his expeditions (agreed upon).',
      },
    ],
  },
  {
    id: 'fard_kifayah',
    title: 'فروض الكفاية',
    titleEn: 'Communal Obligations',
    icon: 'people-outline',
    intro: 'صلوات إذا قام بها بعض المسلمين سقط الإثم عن الباقين.',
    introEn: 'Prayers that, when performed by some Muslims, lift the obligation from the rest.',
    prayers: [
      {
        id: 'janazah',
        name: 'صلاة الجنازة',
        nameEn: 'The Funeral Prayer',
        ruling: 'fard_kifayah',
        rakaat: 'أربع تكبيرات بلا ركوع ولا سجود',
        rakaatEn: 'Four takbirs, without bowing or prostration',
        how:
          'يقف المصلّون خلف الإمام، ويُكبِّر أربع تكبيرات قائماً: يقرأ بعد الأولى الفاتحة، وبعد الثانية الصلاة على النبي ﷺ، وبعد الثالثة الدعاء للميّت (اللهم اغفر له وارحمه...)، وبعد الرابعة يدعو ثم يُسلِّم. وهي فرض كفاية، وفيها أجرٌ عظيم لمن شهدها حتى تُدفَن.',
        howEn:
          'The people stand behind the imam who makes four takbirs while standing: after the first, al-Fatihah; after the second, blessings on the Prophet ﷺ; after the third, supplication for the deceased; after the fourth, a brief supplication then the tasleem. It is a communal obligation with great reward for those who attend until burial.',
        evidence:
          'قال ﷺ: «مَن شهِدَ الجنازةَ حتى يُصلّى عليها فله قيراطٌ، ومن شهِدها حتى تُدفَن فله قيراطان»، قيل: وما القيراطان؟ قال: «مثلُ الجبلينِ العظيمينِ» (متفق عليه).',
        evidenceEn:
          'The Prophet ﷺ said: “Whoever attends the funeral until the prayer is offered has one qirat, and whoever attends until burial has two qirats” — “like two great mountains” (agreed upon).',
      },
      {
        id: 'ghaib',
        name: 'صلاة الغائب',
        nameEn: 'The Absentee Funeral Prayer',
        ruling: 'sunnah',
        rakaat: 'كصلاة الجنازة (أربع تكبيرات)',
        rakaatEn: 'Like the funeral prayer (four takbirs)',
        how:
          'يُصلّى على الميّت الغائب في بلدٍ آخر بصفة صلاة الجنازة نفسها (أربع تكبيرات مع الدعاء له). وأظهر أقوال أهل العلم أنها تُشرَع لمن مات ببلدٍ لم يُصَلَّ عليه فيه، أو لمن له شأنٌ ومنفعةٌ عامة للمسلمين، اقتداءً بفعله ﷺ.',
        howEn:
          'Prayed for one who died in another land, in the same manner as the funeral prayer (four takbirs with supplication). The strongest view is that it is legislated for someone not prayed over where he died, or for a person of general benefit to the Muslims, following the Prophet’s ﷺ practice.',
        evidence:
          'عن أبي هريرة رضي الله عنه أن النبي ﷺ نعى النجاشيّ في اليوم الذي مات فيه، وخرج بهم إلى المصلّى فصفّ بهم وكبّر أربع تكبيرات (متفق عليه).',
        evidenceEn:
          'Abu Hurayrah (RA) reported that the Prophet ﷺ announced the death of the Negus the day he died, went out with them to the prayer-ground, arranged them in rows and made four takbirs (agreed upon).',
      },
    ],
  },
  {
    id: 'fard_ayn',
    title: 'فرض العين',
    titleEn: 'Individual Obligation',
    icon: 'star-outline',
    prayers: [
      {
        id: 'jumuah',
        name: 'صلاة الجمعة',
        nameEn: 'The Friday Prayer',
        ruling: 'fard_ayn',
        rakaat: 'ركعتان جهريّتان بعد خطبتين',
        rakaatEn: 'Two rak‘ahs recited aloud, after two sermons',
        how:
          'صلاة الجمعة فرض عينٍ على كل مسلمٍ ذكرٍ بالغٍ عاقلٍ حرٍّ مقيمٍ لا عذر له. يخطب الإمام خطبتين يفصل بينهما بجلوس، ثم يصلّي بالناس ركعتين يجهر فيهما بالقراءة، وتُغني عن صلاة الظهر في وقتها. ويُستحب التبكير والغُسل والطيب وقراءة سورة الكهف.',
        howEn:
          'The Friday prayer is an individual obligation upon every free, resident, adult, sane Muslim man without a valid excuse. The imam delivers two sermons separated by a sitting, then leads two rak‘ahs recited aloud, replacing Dhuhr in its time. It is recommended to come early, bathe, apply fragrance and read Surat al-Kahf.',
        evidence:
          'قال الله تعالى: ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ وَذَرُوا الْبَيْعَ﴾ [الجمعة: 9]. وقال ﷺ: «لينتهينّ أقوامٌ عن ودعِهم الجُمُعاتِ أو ليختِمنّ اللهُ على قلوبهم» (رواه مسلم).',
        evidenceEn:
          'Allah says: “O you who believe, when the call is made for prayer on Friday, hasten to the remembrance of Allah and leave off trade” (62:9). The Prophet ﷺ warned those who neglect the Friday prayers lest Allah seal their hearts (Muslim).',
      },
    ],
  },
];

export function getNaflPrayer(id: string): { prayer: NaflPrayer; section: NaflSection } | null {
  for (const section of NAFL_SECTIONS) {
    const prayer = section.prayers.find((p) => p.id === id);
    if (prayer) return { prayer, section };
  }
  return null;
}
