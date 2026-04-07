import { getSettings, getDevUnlock, saveSettings } from './settings';

export const FREE_REPORT_LIMIT = 1;

export async function canCreateReport(currentCount: number): Promise<boolean> {
  const settings = await getSettings();
  if (settings.purchased) return true;
  if (await getDevUnlock()) return true;
  return currentCount < FREE_REPORT_LIMIT;
}

/**
 * Stub for v1 — manually sets the purchased flag.
 * Replace with expo-in-app-purchases for App Store release.
 */
export async function unlockPurchased(): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, purchased: true });
}
