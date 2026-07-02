import { useEffect } from 'react';
import { useSettings } from '../store/SettingsContext';
import { rescheduleAll, NotificationPrefs } from '../lib/notifications';
import { getCurrentCoords } from '../lib/location';

/**
 * Keeps the scheduled-notification window in sync with the user's settings.
 * Because prayer times change daily and are scheduled as a rolling 7-day window,
 * this re-runs on every launch and whenever the relevant settings/language change.
 * Renders nothing.
 */
export function NotificationsManager() {
  const {
    ready,
    notifPrayer,
    notifReading,
    notifTahlil,
    notifGratitude,
    athanMode,
    athanSound,
    language,
    calculationMethod,
  } = useSettings();

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const prefs: NotificationPrefs = {
        prayer: notifPrayer,
        reading: notifReading,
        tahlil: notifTahlil,
        gratitude: notifGratitude,
        athanMode,
        athanSound,
        language,
      };
      let coords = null;
      // Only ask for location if prayer-time notifications are actually enabled.
      if (notifPrayer) {
        try {
          coords = await getCurrentCoords();
        } catch {
          coords = null; // reminders still get scheduled; prayer notifs skipped
        }
      }
      if (!cancelled) {
        try {
          await rescheduleAll(prefs, coords, calculationMethod);
        } catch {
          /* best effort */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, notifPrayer, notifReading, notifTahlil, notifGratitude, athanMode, athanSound, language, calculationMethod]);

  return null;
}
