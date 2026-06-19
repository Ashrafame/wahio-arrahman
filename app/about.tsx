import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../src/store/SettingsContext';
import { IslamicPatternBackground } from '../src/components/IslamicPatternBackground';
import { Palette } from '../src/theme/colors';

const APP_VERSION = '1.0.0';
const DEVELOPER_AR = 'اشرف بن الاشهر';
const DEVELOPER_EN = 'Ashraf Ben Lashher';
const YEAR = '2025';

export default function AboutScreen() {
  const { isRTL, palette, scaleFont } = useSettings();
  const insets = useSafeAreaInsets();
  const ar = isRTL;

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: ar ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={ar ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>
          {ar ? 'حول التطبيق' : 'About'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, gap: 20, paddingBottom: 48 }}
      >
        {/* ── Identity block ──────────────────────────────────────────────── */}
        <View style={[styles.identityCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {/* Ornamental top line */}
          <View style={[styles.identityAccent, { backgroundColor: palette.primary }]} />

          <Text style={[styles.appNameAr, { color: palette.primary }]}>
            وَحْيُ الرَّحْمَن
          </Text>
          <Text style={[styles.appNameEn, { color: palette.textMuted }]}>
            Wahio Arr'ah'maan
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: palette.primary + '15', borderColor: palette.primary + '35' }]}>
              <Ionicons name="layers-outline" size={12} color={palette.primary} />
              <Text style={[styles.badgeText, { color: palette.primary }]}>
                {ar ? `الإصدار ${APP_VERSION}` : `Version ${APP_VERSION}`}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#2A9D8F14', borderColor: '#2A9D8F35' }]}>
              <Ionicons name="gift-outline" size={12} color="#2A9D8F" />
              <Text style={[styles.badgeText, { color: '#2A9D8F' }]}>
                {ar ? 'مجاني بالكامل' : 'Completely Free'}
              </Text>
            </View>
          </View>

          <Text style={[styles.tagline, { color: palette.textMuted }]}>
            {ar
              ? 'اقرأ القرآن · افهمه · شاركه'
              : 'Read the Quran · Understand it · Share it'}
          </Text>
        </View>

        {/* ── Mission ─────────────────────────────────────────────────────── */}
        <AboutSection
          icon="compass-outline"
          title={ar ? 'رسالة التطبيق' : 'Our Mission'}
          palette={palette}
          ar={ar}
        >
          <BodyText ar={ar} scaleFont={scaleFont} palette={palette}>
            {ar
              ? 'وَحْيُ الرَّحْمَن منصة دعوية تعليمية تهدف إلى تقديم القرآن الكريم بلغات متعددة، ليتمكن كل إنسان — مسلماً كان أم غير مسلم — من قراءة كلام الله وفهمه مباشرةً.\n\nالمسلم الحق يؤمن بجميع الأنبياء والمرسلين من آدم وإبراهيم وموسى وعيسى وحتى محمد ﷺ دون تفريق أو تمييز، ويحمل رسالة السلام والرحمة والمحبة للبشرية جمعاء. هذا ما يدعو إليه هذا التطبيق.'
              : 'Wahio Arr\'ah\'maan is a free educational and outreach (da\'wa) app that makes the Holy Quran accessible to everyone — Muslim and non-Muslim alike.\n\nA true Muslim believes in all prophets: from Adam, Abraham, Moses, and Jesus, to Muhammad ﷺ — without distinction. Islam\'s message is one of peace, mercy, and compassion for all of humanity. This app is an invitation to read and understand that message directly from its source.'}
          </BodyText>
        </AboutSection>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <AboutSection
          icon="star-outline"
          title={ar ? 'ما يقدمه التطبيق' : 'What the App Offers'}
          palette={palette}
          ar={ar}
        >
          {[
            { icon: 'book-outline',          ar: 'القرآن الكريم كاملاً — روايتا حفص وقالون',         en: 'Complete Quran — Hafs & Qaloon narrations' },
            { icon: 'language-outline',      ar: 'ترجمة إنجليزية واضحة وأمينة',                     en: 'Clear and faithful English translation' },
            { icon: 'reader-outline',        ar: 'تفاسير من مصادر علمية موثوقة',                     en: 'Tafsir from trusted scholarly sources' },
            { icon: 'musical-notes-outline', ar: 'تلاوات صوتية بأصوات كبار القراء',                 en: 'Audio recitations by renowned reciters' },
            { icon: 'search-outline',        ar: 'بحث متقدم في السور والآيات',                      en: 'Advanced search across surahs and verses' },
            { icon: 'aperture-outline',      ar: 'التنقل بين الأجزاء الثلاثين',                     en: 'Navigate all 30 Juz effortlessly' },
            { icon: 'time-outline',          ar: 'مواقيت الصلاة وتوجيه القبلة والأذكار والتقويم',   en: 'Prayer times, Qibla, Azkar & Hijri calendar' },
            { icon: 'color-palette-outline', ar: 'واجهة قابلة للتخصيص الكامل',                     en: 'Fully customizable interface & themes' },
            { icon: 'wifi-outline',          ar: 'القرآن والتفسير الأساسي يعملان بدون إنترنت',       en: 'Core Quran & tafsir work fully offline' },
          ].map((item, i) => (
            <View key={i} style={[styles.featureRow, { flexDirection: ar ? 'row-reverse' : 'row' }]}>
              <View style={[styles.featureIconWrap, { backgroundColor: palette.accent + '18' }]}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={14} color={palette.accent} />
              </View>
              <Text style={[styles.featureText, { color: palette.text, textAlign: ar ? 'right' : 'left', fontSize: scaleFont(13) }]}>
                {ar ? item.ar : item.en}
              </Text>
            </View>
          ))}
        </AboutSection>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <AboutSection
          icon="pricetag-outline"
          title={ar ? 'التسعير والتوفر' : 'Pricing & Availability'}
          palette={palette}
          ar={ar}
        >
          <View style={[styles.freeBlock, { backgroundColor: '#2A9D8F12', borderColor: '#2A9D8F30' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#2A9D8F" />
            <Text style={[styles.freeTitle, { color: '#2A9D8F' }]}>
              {ar ? 'مجاني للأبد' : 'Free Forever'}
            </Text>
          </View>
          <BodyText ar={ar} scaleFont={scaleFont} palette={palette}>
            {ar
              ? 'التطبيق مجاني بالكامل وسيبقى كذلك دائماً. لا توجد إعلانات، ولا اشتراكات، ولا مشتريات داخل التطبيق من أي نوع. الغرض من هذا العمل خالص لوجه الله، وإيصال رسالة القرآن إلى أكبر عدد ممكن من الناس.'
              : 'This app is completely free and will always remain so. There are no advertisements, no subscriptions, and no in-app purchases of any kind. This work is dedicated sincerely to God, with the sole goal of bringing the Quran\'s message to as many people as possible.'}
          </BodyText>
        </AboutSection>

        {/* ── Developer ───────────────────────────────────────────────────── */}
        <AboutSection
          icon="person-circle-outline"
          title={ar ? 'المطوّر' : 'Developer'}
          palette={palette}
          ar={ar}
        >
          <View style={[styles.devCard, { backgroundColor: palette.surfaceAlt, borderColor: palette.border, flexDirection: ar ? 'row-reverse' : 'row' }]}>
            <View style={[styles.devAvatar, { backgroundColor: palette.primary }]}>
              <Text style={{ color: palette.primaryText, fontSize: 22, fontFamily: 'Amiri-Bold' }}>أ</Text>
            </View>
            <View style={{ flex: 1, gap: 3, alignItems: ar ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.devName, { color: palette.text }]}>
                {ar ? DEVELOPER_AR : DEVELOPER_EN}
              </Text>
              <Text style={[styles.devSub, { color: palette.textMuted }]}>
                {ar ? 'Ashraf Ben Lashher · Ben Lasheer' : 'اشرف بن الاشهر · بن الأشير'}
              </Text>
              <Text style={[styles.devRole, { color: palette.accent }]}>
                {ar ? 'مطوّر مستقل · داعية' : 'Independent Developer · Da\'wa'}
              </Text>
            </View>
          </View>
        </AboutSection>

        {/* ── Content Sources ─────────────────────────────────────────────── */}
        <AboutSection
          icon="library-outline"
          title={ar ? 'مصادر المحتوى' : 'Content Sources'}
          palette={palette}
          ar={ar}
        >
          {[
            {
              label: ar ? 'نص القرآن الكريم' : 'Quran Text',
              value: 'Tanzil.net',
              sub: ar ? 'روايتا حفص وقالون' : 'Hafs & Qaloon narrations',
            },
            {
              label: ar ? 'الترجمة الإنجليزية' : 'English Translation',
              value: ar ? 'القرآن الواضح' : 'The Clear Quran',
              sub: ar ? 'د. مصطفى خطاب' : 'Dr. Mustafa Khattab',
            },
            {
              label: ar ? 'التفسير الميسّر' : 'Al-Muyassar Tafsir',
              value: ar ? 'مجمع الملك فهد لطباعة المصحف الشريف' : 'King Fahd Quran Printing Complex',
              sub: '',
            },
            {
              label: ar ? 'تفسير ابن كثير' : 'Ibn Kathir Tafsir',
              value: ar ? 'عبر واجهة برمجية مفتوحة' : 'Via open API',
              sub: '',
            },
          ].map((item, i) => (
            <View
              key={i}
              style={[styles.sourceRow, { borderColor: palette.border, flexDirection: ar ? 'row-reverse' : 'row' }]}
            >
              <View style={[styles.sourceDot, { backgroundColor: palette.accent }]} />
              <View style={{ flex: 1, alignItems: ar ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.sourceLabel, { color: palette.textMuted, fontSize: scaleFont(12) }]}>
                  {item.label}
                </Text>
                <Text style={[styles.sourceValue, { color: palette.text, fontSize: scaleFont(13) }]}>
                  {item.value}
                </Text>
                {item.sub ? (
                  <Text style={[styles.sourceSub, { color: palette.textMuted, fontSize: scaleFont(11) }]}>
                    {item.sub}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </AboutSection>

        {/* ── Privacy ─────────────────────────────────────────────────────── */}
        <AboutSection
          icon="shield-checkmark-outline"
          title={ar ? 'الخصوصية وحماية البيانات' : 'Privacy & Data Protection'}
          palette={palette}
          ar={ar}
        >
          {[
            {
              icon: 'close-circle-outline',
              ar: 'لا يُجمع أي بيان شخصي',
              en: 'No personal data is collected',
            },
            {
              icon: 'close-circle-outline',
              ar: 'لا يوجد تسجيل أو إنشاء حسابات',
              en: 'No registration or accounts required',
            },
            {
              icon: 'close-circle-outline',
              ar: 'لا تتبع ولا إحصاءات سلوكية',
              en: 'No tracking or behavioral analytics',
            },
            {
              icon: 'phone-portrait-outline',
              ar: 'جميع الإعدادات محفوظة محلياً على الجهاز فقط',
              en: 'All settings stored locally on your device only',
            },
            {
              icon: 'cloud-download-outline',
              ar: 'اتصال الإنترنت مطلوب فقط لتحميل التفاسير والتلاوات',
              en: 'Internet required only to stream tafsir & audio recitations',
            },
          ].map((item, i) => (
            <View key={i} style={[styles.privacyRow, { flexDirection: ar ? 'row-reverse' : 'row' }]}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={15}
                color={item.icon === 'close-circle-outline' ? '#E07070' : palette.primary}
              />
              <Text style={[styles.privacyText, { color: palette.text, textAlign: ar ? 'right' : 'left', fontSize: scaleFont(13) }]}>
                {ar ? item.ar : item.en}
              </Text>
            </View>
          ))}
        </AboutSection>

        {/* ── Legal ───────────────────────────────────────────────────────── */}
        <AboutSection
          icon="document-text-outline"
          title={ar ? 'إشعار قانوني' : 'Legal Notice'}
          palette={palette}
          ar={ar}
        >
          <BodyText ar={ar} scaleFont={scaleFont} palette={palette} muted small>
            {ar
              ? 'نصوص القرآن الكريم وترجماته وتفاسيره مستخدمة لأغراض تعليمية غير تجارية. جميع المحتويات الإسلامية مقدَّمة بأمانة ودقة واحترام. التلاوات الصوتية متاحة بموجب تصاريح أو مصادر مفتوحة. يتحمل المستخدم مسؤولية الاطلاع على شروط استخدام أي محتوى خارجي.'
              : 'Quran texts, translations, and tafsir are used for non-commercial educational purposes only. All Islamic content is presented with accuracy, integrity, and respect. Audio recitations are used under permission or via open-source licensing. Users are responsible for reviewing the terms of any external content they access.'}
          </BodyText>
        </AboutSection>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <View style={[styles.footer, { borderColor: palette.border }]}>
          <Text style={[styles.footerApp, { color: palette.primary }]}>
            وَحْيُ الرَّحْمَن
          </Text>
          <Text style={[styles.footerVersion, { color: palette.textMuted }]}>
            v{APP_VERSION} · {ar ? 'الإصدار الأول' : 'First Release'}
          </Text>
          <Text style={[styles.footerCopy, { color: palette.textMuted }]}>
            {ar
              ? `© ${YEAR} ${DEVELOPER_AR} — جميع الحقوق محفوظة`
              : `© ${YEAR} ${DEVELOPER_EN} — All rights reserved`}
          </Text>
          <Text style={[styles.footerMade, { color: palette.accent }]}>
            {ar ? 'صُنع بنية الدعوة إلى الله ❤' : 'Made with the intention of da\'wa for God ❤'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Local helpers ─────────────────────────────────────────────────────────────

function AboutSection({
  icon,
  title,
  children,
  palette,
  ar,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
  palette: Palette;
  ar: boolean;
}) {
  return (
    <View style={[styles.section, { borderColor: palette.border, backgroundColor: palette.surface }]}>
      <View
        style={[
          styles.sectionHeader,
          { flexDirection: ar ? 'row-reverse' : 'row', borderBottomColor: palette.border },
        ]}
      >
        <View style={[styles.sectionIconWrap, { backgroundColor: palette.primary + '18' }]}>
          <Ionicons name={icon} size={15} color={palette.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BodyText({
  ar,
  scaleFont,
  palette,
  children,
  muted,
  small,
}: {
  ar: boolean;
  scaleFont: (n: number) => number;
  palette: Palette;
  children: string;
  muted?: boolean;
  small?: boolean;
}) {
  const size = small ? scaleFont(12) : scaleFont(14);
  return (
    <Text
      style={{
        color: muted ? palette.textMuted : palette.text,
        fontSize: size,
        lineHeight: size * 1.75,
        textAlign: ar ? 'right' : 'left',
        writingDirection: ar ? 'rtl' : 'ltr',
        fontFamily: ar ? 'Cairo-Variable' : undefined,
      }}
    >
      {children}
    </Text>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },

  identityCard: {
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 18,
  },
  identityAccent: { height: 4, width: '100%', marginBottom: 18 },
  appNameAr: { fontSize: 32, fontFamily: 'Amiri-Bold', textAlign: 'center' },
  appNameEn: { fontSize: 13, marginTop: 4, textAlign: 'center', letterSpacing: 0.5 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  tagline: { marginTop: 10, fontSize: 12, letterSpacing: 1, opacity: 0.8 },

  section: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  sectionHeader: { alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  sectionBody: { padding: 14, gap: 10 },

  freeBlock: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12 },
  freeTitle: { fontSize: 16, fontWeight: '800' },

  featureRow: { alignItems: 'center', gap: 10 },
  featureIconWrap: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 13 },

  devCard: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', gap: 14 },
  devAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  devName: { fontSize: 15, fontWeight: '700' },
  devSub: { fontSize: 12 },
  devRole: { fontSize: 12, fontWeight: '600' },

  sourceRow: { alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  sourceDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  sourceLabel: { fontSize: 11 },
  sourceValue: { fontSize: 13, fontWeight: '600', marginTop: 1 },
  sourceSub: { fontSize: 11, marginTop: 1 },

  privacyRow: { alignItems: 'center', gap: 10 },
  privacyText: { flex: 1, fontSize: 13 },

  footer: { borderTopWidth: 1, paddingTop: 20, alignItems: 'center', gap: 5, marginTop: 4 },
  footerApp: { fontSize: 20, fontFamily: 'Amiri-Bold' },
  footerVersion: { fontSize: 12, marginTop: 2 },
  footerCopy: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  footerMade: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
});
