import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ── Where the app learns about newer versions ────────────────────────────────
// A tiny public JSON manifest that YOU control is the most flexible source: it
// works on iOS and Android AND for side-loaded APKs (which Play in-app-updates
// can't reach). Host it as a public GitHub Gist "raw" URL or on your own server,
// then paste that URL here. See version.json in the repo root for the shape.
//
// Leave it empty ('') to skip the manifest; on iOS the app then falls back to
// Apple's public lookup API automatically (works once the app is on the store).
export const VERSION_MANIFEST_URL = '';

// Used only for the iOS App Store fallback lookup.
const IOS_BUNDLE_ID = 'com.wahioarrahman.app';

export interface UpdateInfo {
  latestVersion: string;
  url: string; // store page or APK download link
  mandatory: boolean;
  notes?: string;
}

/** The version of the currently-installed app (from app.json → version). */
export function currentAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/** Semantic-ish compare: is `latest` strictly newer than `current`? */
export function isNewerVersion(latest: string, current: string): boolean {
  const a = String(latest).split('.').map((n) => parseInt(n, 10) || 0);
  const b = String(current).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

async function fromManifest(): Promise<UpdateInfo | null> {
  if (!VERSION_MANIFEST_URL) return null;
  const res = await fetch(VERSION_MANIFEST_URL, { cache: 'no-store' as RequestCache });
  if (!res.ok) return null;
  const m = await res.json();
  const latest = String(m.latestVersion ?? '');
  if (!latest || !isNewerVersion(latest, currentAppVersion())) return null;
  return {
    latestVersion: latest,
    url: (Platform.OS === 'ios' ? m.iosUrl : m.androidUrl) ?? m.url ?? '',
    mandatory: !!m.mandatory,
    notes: typeof m.notes === 'string' ? m.notes : undefined,
  };
}

async function fromAppleLookup(): Promise<UpdateInfo | null> {
  if (Platform.OS !== 'ios') return null;
  const res = await fetch(`https://itunes.apple.com/lookup?bundleId=${IOS_BUNDLE_ID}`, {
    cache: 'no-store' as RequestCache,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const info = data?.results?.[0];
  if (!info?.version || !isNewerVersion(info.version, currentAppVersion())) return null;
  return { latestVersion: info.version, url: info.trackViewUrl ?? '', mandatory: false };
}

/**
 * Returns update details when a newer store/manifest version exists, else null.
 * Best-effort and silent on any network/parse error.
 */
export async function checkForAppUpdate(): Promise<UpdateInfo | null> {
  try {
    const m = await fromManifest();
    if (m) return m;
  } catch {
    /* ignore */
  }
  try {
    return await fromAppleLookup();
  } catch {
    return null;
  }
}
