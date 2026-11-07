// Rotating notification copy. To avoid "notification blindness", each reminder
// picks a different phrasing every day (indexed by day-of-year), and the tone
// is gentle and encouraging rather than nagging. Both languages are provided;
// the app language decides which is used.

export interface NotifMessage {
  title: string;
  body: string;
  titleEn: string;
  bodyEn: string;
}

// Morning "tahlil" reminder — "قل لا إله إلا الله محمد رسول الله".
export const TAHLIL_MESSAGES: NotifMessage[] = [
  { title: 'صباح الذكر', body: 'قل: لا إله إلا الله محمد رسول الله 🌿', titleEn: 'A Morning of Remembrance', bodyEn: 'Say: There is no god but Allah, Muhammad is the Messenger of Allah 🌿' },
  { title: 'أطيبُ ما تبدأ به يومك', body: 'لا إله إلا الله محمد رسول الله — كلمةٌ ثقيلةٌ في الميزان.', titleEn: 'The Best Start to Your Day', bodyEn: 'Lā ilāha illa-llāh, Muhammadun rasūlu-llāh — heavy on the scale.' },
  { title: 'تذكير الصباح', body: 'جدّد إيمانك: لا إله إلا الله محمد رسول الله.', titleEn: 'Morning Reminder', bodyEn: 'Renew your faith: There is no god but Allah, Muhammad is His Messenger.' },
  { title: 'كلمة التوحيد', body: 'أفضل الذكر: لا إله إلا الله محمد رسول الله ✨', titleEn: 'The Word of Tawḥīd', bodyEn: 'The best remembrance: Lā ilāha illa-llāh, Muhammadun rasūlu-llāh ✨' },
  { title: 'ابدأ بنيّةٍ طيّبة', body: 'قل من قلبك: لا إله إلا الله محمد رسول الله.', titleEn: 'Begin with a Pure Intention', bodyEn: 'Say from the heart: There is no god but Allah, Muhammad is His Messenger.' },
  { title: 'نورٌ لقلبك', body: 'لا إله إلا الله محمد رسول الله — اطمئنانٌ ونور.', titleEn: 'Light for Your Heart', bodyEn: 'Lā ilāha illa-llāh, Muhammadun rasūlu-llāh — serenity and light.' },
  { title: 'ذكرٌ خفيفٌ عظيم', body: 'خفيفتانِ على اللسان: لا إله إلا الله محمد رسول الله.', titleEn: 'Light on the Tongue, Great in Reward', bodyEn: 'Easy to say: There is no god but Allah, Muhammad is His Messenger.' },
];

// Gratitude reminder — "وقليل من عبادي الشكور".
export const GRATITUDE_MESSAGES: NotifMessage[] = [
  { title: 'كن من القلائل', body: '﴿وَقَلِيلٌ مِّنْ عِبَادِيَ الشَّكُورُ﴾ — احمد الله على نعمه.', titleEn: 'Be Among the Few', bodyEn: '“And few of My servants are grateful” — praise Allah for His blessings.' },
  { title: 'لحظة شكر', body: 'انظر حولك… نِعمٌ لا تُحصى. قل: الحمد لله 🤍', titleEn: 'A Moment of Gratitude', bodyEn: 'Look around… countless blessings. Say: Alhamdulillah 🤍' },
  { title: 'الشكر يزيد النعم', body: '﴿لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ﴾ — اشكر تُزَدْ.', titleEn: 'Gratitude Increases Blessings', bodyEn: '“If you are grateful, I will surely increase you” — be thankful.' },
  { title: 'نعمةٌ تستحق الحمد', body: 'الصحة، الأمن، القرآن بين يديك… الحمد لله.', titleEn: 'A Blessing Worth Praising', bodyEn: 'Health, safety, the Qur’an in your hands… Alhamdulillah.' },
  { title: 'قلبٌ شاكر', body: 'اجعل قلبك شاكراً؛ فالشاكرون قليل، فكن منهم.', titleEn: 'A Grateful Heart', bodyEn: 'Keep a grateful heart — the thankful are few; be among them.' },
  { title: 'احمد الله', body: 'كم من نعمةٍ خفيّة! قل الحمد لله على كل حال 🌸', titleEn: 'Praise Allah', bodyEn: 'So many hidden blessings! Say Alhamdulillah in every state 🌸' },
  { title: 'الشكر عبادة', body: 'من لم يشكر القليل لم يشكر الكثير. ابدأ الآن بالحمد.', titleEn: 'Gratitude Is Worship', bodyEn: 'Whoever is ungrateful for little is ungrateful for much. Start with praise.' },
];

// Daily Qur'an reading reminder.
export const READING_MESSAGES: NotifMessage[] = [
  { title: 'وردك اليومي', body: 'صفحةٌ واحدة تكفي لتبقى على صلةٍ بالقرآن 📖', titleEn: 'Your Daily Portion', bodyEn: 'One page is enough to stay connected to the Qur’an 📖' },
  { title: 'لا تهجر القرآن', body: 'اقرأ صفحةً اليوم؛ فالقليل الدائم خيرٌ من الكثير المنقطع.', titleEn: 'Do Not Abandon the Qur’an', bodyEn: 'Read a page today — steady little is better than much then nothing.' },
  { title: 'دقائق مع كلام الله', body: 'خصّص دقائق لقراءة صفحةٍ من القرآن، يطمئنّ قلبك.', titleEn: 'Minutes with Allah’s Words', bodyEn: 'Spare a few minutes for a page of the Qur’an; your heart will find peace.' },
  { title: 'حرفٌ بعشر حسنات', body: 'كل حرفٍ تقرؤه بحسنة، والحسنة بعشر أمثالها. اقرأ صفحة الآن.', titleEn: 'A Letter for Ten Rewards', bodyEn: 'Every letter is a good deed multiplied by ten. Read a page now.' },
  { title: 'رفقةُ القرآن', body: 'صفحةٌ كل يوم… وصلٌ لا ينقطع مع كتاب ربك 🌿', titleEn: 'The Company of the Qur’an', bodyEn: 'A page each day… an unbroken bond with your Lord’s Book 🌿' },
  { title: 'شفيعك يوم القيامة', body: '«اقرؤوا القرآن؛ فإنه يأتي شفيعاً لأصحابه». اقرأ صفحة.', titleEn: 'Your Intercessor', bodyEn: '“Read the Qur’an, for it will come as an intercessor for its people.” Read a page.' },
  { title: 'موعدك مع القرآن', body: 'لا تدع اليوم يمضي دون صفحةٍ من القرآن ✨', titleEn: 'Your Appointment with the Qur’an', bodyEn: 'Don’t let the day pass without a page of the Qur’an ✨' },
];

// Pick a message that rotates by day so users don't see the same text twice in a row.
export function pickByDay(pool: NotifMessage[], dayIndex: number): NotifMessage {
  return pool[((dayIndex % pool.length) + pool.length) % pool.length];
}
