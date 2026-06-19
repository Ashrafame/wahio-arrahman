import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  FontFamilyId,
  FontSizeId,
  ThemeId,
  useSettings,
} from '../src/store/SettingsContext';
import { Qiraah } from '../src/lib/quranData';
import {
  Palette,
  PrimaryColorId,
  BgColorId,
  PatternStyleId,
  PRIMARY_COLORS,
  BG_PRESETS,
  PATTERN_STYLES,
} from '../src/theme/colors';
import { IslamicPatternBackground } from '../src/components/IslamicPatternBackground';

// ── Color conversion helpers ──────────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// 12 evenly-spaced hue segments for the rainbow wheel
const RAINBOW_SEGS = Array.from({ length: 12 }, (_, i) => hslToHex(i * 30, 85, 50));

// ── Rainbow wheel component ───────────────────────────────────────────────────

function RainbowCircle({ size = 36 }: { size?: number }) {
  const r = size / 2;
  const or = r - 0.5;
  const ir = r * 0.38;
  return (
    <Svg width={size} height={size}>
      {RAINBOW_SEGS.map((color, i) => {
        const a1 = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const a2 = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
        const x1 = (r + or * Math.cos(a1)).toFixed(2);
        const y1 = (r + or * Math.sin(a1)).toFixed(2);
        const x2 = (r + or * Math.cos(a2)).toFixed(2);
        const y2 = (r + or * Math.sin(a2)).toFixed(2);
        return (
          <Path
            key={i}
            d={`M${r},${r} L${x1},${y1} A${or},${or} 0 0,1 ${x2},${y2} Z`}
            fill={color}
          />
        );
      })}
      <Circle cx={r} cy={r} r={ir} fill="white" />
    </Svg>
  );
}

// ── HSL Color picker modal ────────────────────────────────────────────────────

function ColorPickerModal({
  visible,
  initial,
  title,
  onConfirm,
  onClose,
  palette,
  isRTL,
}: {
  visible: boolean;
  initial: string | null;
  title: string;
  onConfirm: (hex: string) => void;
  onClose: () => void;
  palette: Palette;
  isRTL: boolean;
}) {
  const [h, setH] = useState(150);
  const [s, setS] = useState(65);
  const [l, setL] = useState(35);

  useEffect(() => {
    if (!visible) return;
    if (initial && /^#[0-9a-fA-F]{6}$/.test(initial)) {
      const [h0, s0, l0] = hexToHsl(initial);
      setH(h0); setS(s0); setL(l0);
    } else {
      setH(150); setS(65); setL(35);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hex = hslToHex(h, s, l);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={cpStyles.overlay} onPress={onClose}>
        <Pressable style={[cpStyles.card, { backgroundColor: palette.surface }]} onPress={() => {}}>
          <Text style={[cpStyles.title, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {title}
          </Text>

          {/* Color preview */}
          <View style={[cpStyles.preview, { backgroundColor: hex }]}>
            <Text style={{ color: parseInt(hex.slice(1, 3), 16) * 0.299 + parseInt(hex.slice(3, 5), 16) * 0.587 + parseInt(hex.slice(5, 7), 16) * 0.114 > 128 ? '#000' : '#fff', fontFamily: 'Amiri-Bold', fontSize: 15 }}>
              {hex.toUpperCase()}
            </Text>
          </View>

          {/* Hue */}
          <View style={cpStyles.sliderRow}>
            <View style={[cpStyles.sliderLabel, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={{ color: palette.textMuted, fontSize: 12, width: 26 }}>H</Text>
              <Text style={{ color: palette.text, fontSize: 12 }}>{Math.round(h)}°</Text>
            </View>
            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={360}
              step={1}
              value={h}
              onValueChange={setH}
              minimumTrackTintColor={hslToHex(h, 85, 50)}
              maximumTrackTintColor={palette.border}
              thumbTintColor={hex}
            />
          </View>

          {/* Saturation */}
          <View style={cpStyles.sliderRow}>
            <View style={[cpStyles.sliderLabel, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={{ color: palette.textMuted, fontSize: 12, width: 26 }}>S</Text>
              <Text style={{ color: palette.text, fontSize: 12 }}>{Math.round(s)}%</Text>
            </View>
            <Slider
              style={{ flex: 1 }}
              minimumValue={10}
              maximumValue={100}
              step={1}
              value={s}
              onValueChange={setS}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor={palette.border}
              thumbTintColor={hex}
            />
          </View>

          {/* Lightness */}
          <View style={cpStyles.sliderRow}>
            <View style={[cpStyles.sliderLabel, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={{ color: palette.textMuted, fontSize: 12, width: 26 }}>L</Text>
              <Text style={{ color: palette.text, fontSize: 12 }}>{Math.round(l)}%</Text>
            </View>
            <Slider
              style={{ flex: 1 }}
              minimumValue={10}
              maximumValue={85}
              step={1}
              value={l}
              onValueChange={setL}
              minimumTrackTintColor={palette.primary}
              maximumTrackTintColor={palette.border}
              thumbTintColor={hex}
            />
          </View>

          {/* Buttons */}
          <View style={[cpStyles.buttons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable
              onPress={onClose}
              style={[cpStyles.btn, { borderColor: palette.border, backgroundColor: palette.surface }]}
            >
              <Text style={{ color: palette.textMuted, fontSize: 14 }}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { onConfirm(hex); onClose(); }}
              style={[cpStyles.btn, { backgroundColor: hex, borderColor: hex }]}
            >
              <Text style={{ color: parseInt(hex.slice(1, 3), 16) * 0.299 + parseInt(hex.slice(3, 5), 16) * 0.587 + parseInt(hex.slice(5, 7), 16) * 0.114 > 128 ? '#000' : '#fff', fontSize: 14, fontWeight: '700' }}>
                {isRTL ? 'اختيار' : 'Select'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const cpStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  title: { fontSize: 16, fontWeight: '700' },
  preview: {
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderRow: { gap: 4 },
  sliderLabel: { justifyContent: 'space-between', paddingHorizontal: 2 },
  buttons: { gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
});

// ── Main settings screen ──────────────────────────────────────────────────────

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
    palette,
    primaryColorId,
    bgColorId,
    patternStyleId,
    customPrimaryColor,
    customBgColor,
    setPrimaryColorId,
    setBgColorId,
    setPatternStyleId,
    setCustomPrimaryColor,
    setCustomBgColor,
    resetAppearance,
  } = useSettings();
  const insets = useSafeAreaInsets();

  const [colorPickerTarget, setColorPickerTarget] = useState<'primary' | 'bg' | null>(null);

  const handleColorConfirm = (hex: string) => {
    if (colorPickerTarget === 'primary') setCustomPrimaryColor(hex);
    else if (colorPickerTarget === 'bg') setCustomBgColor(hex);
  };

  const pickerInitial = colorPickerTarget === 'primary' ? customPrimaryColor : customBgColor;
  const pickerTitle = colorPickerTarget === 'primary'
    ? (isRTL ? 'لون التطبيق المخصص' : 'Custom App Color')
    : (isRTL ? 'لون الخلفية المخصص' : 'Custom Background Color');

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <IslamicPatternBackground />
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
              { id: 'diwan', label: 'الديواني' },
              { id: 'ruqa', label: 'الرقعة' },
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

        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <Section title={t('appearance')} palette={palette} isRTL={isRTL}>
          <View style={{ gap: 16 }}>

            {/* Primary color swatches */}
            <View>
              <Text style={[styles.subLabel, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('primaryColor')}
              </Text>
              <View style={[styles.swatchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {(Object.keys(PRIMARY_COLORS) as PrimaryColorId[]).map((id) => {
                  const color = theme === 'dark' ? PRIMARY_COLORS[id].dark : PRIMARY_COLORS[id].light;
                  const selected = customPrimaryColor === null && primaryColorId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => { setPrimaryColorId(id); setCustomPrimaryColor(null); }}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selected && styles.swatchSelected,
                        selected && { borderColor: palette.accent },
                      ]}
                    />
                  );
                })}
                {/* Custom color swatch */}
                <Pressable
                  onPress={() => setColorPickerTarget('primary')}
                  style={[
                    styles.colorSwatch,
                    { overflow: 'hidden' },
                    customPrimaryColor !== null && styles.swatchSelected,
                    customPrimaryColor !== null && { borderColor: palette.accent },
                  ]}
                >
                  {customPrimaryColor ? (
                    <View style={{ flex: 1, backgroundColor: customPrimaryColor }} />
                  ) : (
                    <RainbowCircle size={36} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Background color swatches */}
            <View>
              <Text style={[styles.subLabel, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('bgColor')}
              </Text>
              <View style={[styles.swatchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {(Object.keys(BG_PRESETS) as BgColorId[]).map((id) => {
                  const color = theme === 'dark' ? BG_PRESETS[id].dark.background : BG_PRESETS[id].light.background;
                  const selected = customBgColor === null && bgColorId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => { setBgColorId(id); setCustomBgColor(null); }}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color, borderWidth: 1, borderColor: palette.border },
                        selected && styles.swatchSelected,
                        selected && { borderColor: palette.accent },
                      ]}
                    />
                  );
                })}
                {/* Custom background color swatch */}
                <Pressable
                  onPress={() => setColorPickerTarget('bg')}
                  style={[
                    styles.colorSwatch,
                    { overflow: 'hidden' },
                    customBgColor !== null && styles.swatchSelected,
                    customBgColor !== null && { borderColor: palette.accent },
                  ]}
                >
                  {customBgColor ? (
                    <View style={{ flex: 1, backgroundColor: customBgColor }} />
                  ) : (
                    <RainbowCircle size={36} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Pattern style */}
            <View>
              <Text style={[styles.subLabel, { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                {t('backgroundPattern')}
              </Text>
              <View style={[styles.optionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {(Object.keys(PATTERN_STYLES) as PatternStyleId[]).map((id) => {
                  const label = isRTL ? PATTERN_STYLES[id].labelAr : PATTERN_STYLES[id].labelEn;
                  const selected = patternStyleId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setPatternStyleId(id)}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: selected ? palette.primary : palette.surface,
                          borderColor: selected ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text style={{ color: selected ? palette.primaryText : palette.text, fontSize: 12 }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Reset */}
            <Pressable
              onPress={resetAppearance}
              style={[styles.resetButton, { borderColor: palette.border, backgroundColor: palette.surface }]}
            >
              <Ionicons name="refresh-outline" size={16} color={palette.textMuted} />
              <Text style={{ color: palette.textMuted, fontSize: 13, marginLeft: 6 }}>
                {t('resetAppearance')}
              </Text>
            </Pressable>
          </View>
        </Section>

        <Text style={[styles.about, { color: palette.textMuted }]}>{t('sources')}</Text>

        {/* About / about the app */}
        <Pressable
          onPress={() => router.push('/about')}
          style={[styles.aboutRow, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          <Ionicons name="information-circle-outline" size={20} color={palette.primary} />
          <Text style={{ color: palette.text, fontSize: 14, fontWeight: '600', flex: 1, marginHorizontal: 10, textAlign: isRTL ? 'right' : 'left' }}>
            {t('about')}
          </Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={palette.textMuted} />
        </Pressable>
      </ScrollView>

      <ColorPickerModal
        visible={colorPickerTarget !== null}
        initial={pickerInitial}
        title={pickerTitle}
        onConfirm={handleColorConfirm}
        onClose={() => setColorPickerTarget(null)}
        palette={palette}
        isRTL={isRTL}
      />
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
  palette: Palette;
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
  palette: Palette;
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
  subLabel: { fontSize: 12, marginBottom: 8, opacity: 0.7 },
  optionRow: { flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  swatchRow: { flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  swatchSelected: { borderWidth: 3 },
  sliderRow: { alignItems: 'center', gap: 8 },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  about: { fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 18 },
  aboutRow: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
});
