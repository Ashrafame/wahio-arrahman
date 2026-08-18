import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { computePrayerTimes, CalculationMethodId } from './prayerTimes';
import { Coords } from './location';
import { TAHLIL_MESSAGES, GRATITUDE_MESSAGES, READING_MESSAGES, pickByDay, NotifMessage } from '../data/notificationMessages';

export type AthanMode = 'athan' | 'notification' | 'beep';

export interface NotificationPrefs {
  prayer: boolean;
  reading: boolean;
  tahlil: boolean;
  gratitude: boolean;
  athanMode: AthanMode;
  /** Which muezzin sound to use in 'athan' mode. 'default' until files ship. */
  athanSound: string;
  language: 'ar' | 'en';
}

// Rolling window of days to schedule ahead. Re-scheduled every app launch.
// 7 days × (5 prayers + 3 reminders) = 56 pending — under iOS's 64-notification cap.
const DAYS_WINDOW = 7;

// Local times for the daily reminders (24h). Chosen to be spread out and gentle.
const TAHLIL_AT = { hour: 7, minute: 30 };   // morning
const GRATITUDE_AT = { hour: 17, minute: 0 }; // late afternoon
const READING_AT = { hour: 20, minute: 30 };  // evening

// ── Athan sound registry ──────────────────────────────────────────────────────
// Future muezzin recordings plug in here: drop the file in assets/sounds/, add its
// filename to app.json → expo-notifications → "sounds", then map the setting value
// to the bundled filename below. Until then everything falls back to the OS sound.
export const ATHAN_SOUNDS: Record<string, string | undefined> = {
  default: undefined, // undefined → OS default notification sound
  // 'ashraf':   'athan_ashraf.wav',
  // 'muezzin2': 'athan_2.wav',
  // 'muezzin3': 'athan_3.wav',
  // 'muezzin4': 'athan_4.wav',
};

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const PRAYER_LABELS: Record<(typeof PRAYER_KEYS)[number], { ar: string; en: string }> = {
  fajr: { ar: 'الفجر', en: 'Fajr' },
  dhuhr: { ar: 'الظهر', en: 'Dhuhr' },
  asr: { ar: 'العصر', en: 'Asr' },
  maghrib: { ar: 'المغرب', en: 'Maghrib' },
  isha: { ar: 'العشاء', en: 'Isha' },
};

// How a foreground notification behaves while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return req.granted;
}

// Sound to attach to a prayer notification, per the chosen athan mode.
function prayerSound(prefs: NotificationPrefs): string {
  if (prefs.athanMode === 'athan') return ATHAN_SOUNDS[prefs.athanSound] ?? 'default';
  // 'notification' and 'beep' both use the OS sound until a dedicated beep asset ships.
  return 'default';
}

async function setupAndroidChannels(prefs: NotificationPrefs) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('prayer', {
    name: 'مواقيت الصلاة',
    importance: Notifications.AndroidImportance.HIGH,
    sound: prayerSound(prefs),
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'تذكيرات',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

function scheduleDate(
  when: Date,
  title: string,
  body: string,
  sound: string,
  channelId: 'prayer' | 'reminders'
) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId },
  });
}

function localized(m: NotifMessage, lang: 'ar' | 'en') {
  return lang === 'ar' ? { title: m.title, body: m.body } : { title: m.titleEn, body: m.bodyEn };
}

/**
 * Cancels everything and re-schedules a rolling window of notifications from the
 * current preferences. Call on app launch and whenever the relevant settings,
 * language, or location change.
 */
export async function rescheduleAll(
  prefs: NotificationPrefs,
  coords: Coords | null,
  methodId: CalculationMethodId
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const anyOn = prefs.prayer || prefs.reading || prefs.tahlil || prefs.gratitude;
  if (!anyOn) return;

  const granted = await ensurePermissions();
  if (!granted) return;

  await setupAndroidChannels(prefs);

  const now = new Date();
  const lang = prefs.language;
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);

  const psound = prayerSound(prefs);

  for (let i = 0; i < DAYS_WINDOW; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const di = dayOfYear + i;

    if (prefs.prayer && coords) {
      const times = computePrayerTimes(coords.latitude, coords.longitude, date, methodId);
      for (const key of PRAYER_KEYS) {
        const when = times[key];
        if (when.getTime() <= now.getTime()) continue;
        const label = PRAYER_LABELS[key][lang];
        const title = lang === 'ar' ? 'حان وقت الصلاة' : 'Prayer Time';
        const body = lang === 'ar' ? `حان الآن وقت صلاة ${label}` : `It is now time for the ${label} prayer`;
        await scheduleDate(when, title, body, psound, 'prayer');
      }
    }

    const reminders: { on: boolean; at: { hour: number; minute: number }; pool: NotifMessage[] }[] = [
      { on: prefs.tahlil, at: TAHLIL_AT, pool: TAHLIL_MESSAGES },
      { on: prefs.gratitude, at: GRATITUDE_AT, pool: GRATITUDE_MESSAGES },
      { on: prefs.reading, at: READING_AT, pool: READING_MESSAGES },
    ];
    for (const r of reminders) {
      if (!r.on) continue;
      const when = new Date(date.getFullYear(), date.getMonth(), date.getDate(), r.at.hour, r.at.minute, 0);
      if (when.getTime() <= now.getTime()) continue;
      const { title, body } = localized(pickByDay(r.pool, di), lang);
      await scheduleDate(when, title, body, 'default', 'reminders');
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
