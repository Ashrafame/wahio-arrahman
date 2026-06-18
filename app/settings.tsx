import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  FontFamilyId,
  FontSizeId,
  ThemeId,
  useSettings,
} from '../src/store/SettingsContext';
import { Qiraah } from '../src/lib/quranData';
import { getPalette } from '../src/theme/colors';

export default function SettingsScreen() {
  const {
    isRTL,
    t,
    theme,
    setTheme,
    language,
    setLanguage,
    qiraah,
    setQiraah,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    uiFontScale,
    setUiFontScale,
    showTranslation,
    setShowTranslation,
    showEnglishQuran,
    setShowEnglishQuran,
  } = useSettings();
  const palette = getPalette(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: palette.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={palette.primaryText} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.primaryText }]}>{t('settings')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Section title={t('language')} palette={palette} isRTL={isRTL}>
          <OptionRow
            options={[
              { id: 'ar', label: 'العربية' },
              { id: 'en', label: 'English' },
            ]}
            value={language}
            onChange={(v) => setLanguage(v as 'ar' | 'en')}
            palette={palette}
            isRTL={isRTL}
          />
        </Section>

        <Section title={t('qiraah')} palette={palette} isRTL={isRTL}>
          <OptionRow
            options={[
              { id: 'hafs', label: t('qiraahHafs') },
              { id: 'qaloon', label: t('qiraahQaloon') },
            ]}
            value={qiraah}
            onChange={(v) => setQiraah(v as Qiraah)}
            palette={palette}
            isRTL={isRTL}
          />
        </Section>

        <Section title={t('fontFamily')} palette={palette} isRTL={isRTL}>
          <OptionRow
            options={[
              { id: 'amiri', label: 'Amiri' },
              { id: 'scheherazade', label: 'Scheherazade' },
              { id: 'reemkufi', label: 'الخط الكوفي' },
              { id: 'jomhuria', label: 'جمهورية' },
            ]}
            value={fontFamily}
            onChange={(v) => setFontFamily(v as FontFamilyId)}
            palette={palette}
            isRTL={isRTL}
          />
        </Section>

        <Section title={t('fontSize')} palette={palette} isRTL={isRTL}>
          <OptionRow
            options={[
              { id: 'small', label: t('small') },
              { id: 'medium', label: t('medium') },
              { id: 'large', label: t('large') },
              { id: 'xlarge', label: t('extraLarge') },
            ]}
            value={fontSize}
            onChange={(v) => setFontSize(v as FontSizeId)}
            palette={palette}
            isRTL={isRTL}
          />
        </Section>

        <Section title={t('uiFontSize')} palette={palette} isRTL={isRTL}>
          <View style={[styles.sliderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="text" size={isRTL ? 22 : 14} color={palette.textMuted} />
            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={1}
              value={isRTL ? 1 - uiFontScale : uiFontScale}
              onValueChange={(v) => setUiFontScale(isRTL ? 1 - v : v)}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor={palette.border}
              thumbTintColor={palette.primary}
            />
            <Ionicons name="text" size={isRTL ? 14 : 22} color={palette.textMuted} />
          </View>
        </Section>

        <Section title={t('theme')} palette={palette} isRTL={isRTL}>
          <OptionRow
            options={[
              { id: 'light', label: t('light') },
              { id: 'dark', label: t('dark') },
            ]}
            value={theme}
            onChange={(v) => setTheme(v as ThemeId)}
            palette={palette}
            isRTL={isRTL}
          />
        </Section>

        {language === 'ar' ? (
          <Section title={t('translation')} palette={palette} isRTL={isRTL}>
            <Pressable
              onPress={() => setShowTranslation(!showTranslation)}
              style={[styles.switchRow, { flexDirection: isRTL ? 'row-reverse' : 'row', borderColor: palette.border }]}
            >
              <Text style={{ color: palette.text }}>{t('showTranslation')}</Text>
              <Ionicons
                name={showTranslation ? 'checkbox' : 'square-outline'}
                size={22}
                color={showTranslation ? palette.primary : palette.textMuted}
              />
            </Pressable>
          </Section>
        ) : (
          <Section title={t('englishQuran')} palette={palette} isRTL={isRTL}>
            <Pressable
              onPress={() => setShowEnglishQuran(!showEnglishQuran)}
              style={[styles.switchRow, { flexDirection: isRTL ? 'row-reverse' : 'row', borderColor: palette.border }]}
            >
              <Text style={{ color: palette.text }}>{t('showEnglishQuran')}</Text>
              <Ionicons
                name={showEnglishQuran ? 'checkbox' : 'square-outline'}
                size={22}
                color={showEnglishQuran ? palette.primary : palette.textMuted}
              />
            </Pressable>
          </Section>
        )}

        <Text style={[styles.about, { color: palette.textMuted }]}>{t('sources')}</Text>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  palette,
  isRTL,
}: {
  title: string;
  children: React.ReactNode;
  palette: ReturnType<typeof getPalette>;
  isRTL: boolean;
}) {
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function OptionRow<T extends string>({
  options,
  value,
  onChange,
  palette,
  isRTL,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  palette: ReturnType<typeof getPalette>;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.optionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => onChange(opt.id)}
          style={[
            styles.optionChip,
            {
              backgroundColor: value === opt.id ? palette.primary : palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={{ color: value === opt.id ? palette.primaryText : palette.text }}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'space-between' },
  iconButton: { padding: 4, width: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, opacity: 0.8 },
  optionRow: { flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  sliderRow: { alignItems: 'center', gap: 8 },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  about: { fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18 },
});
