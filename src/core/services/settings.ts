import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../models/types';

const SETTINGS_KEY = '@husoga:settings';
const DEV_UNLOCK_KEY = '@husoga:dev_unlock';

const DEFAULT_SETTINGS: AppSettings = { locale: 'sv', purchased: false, themeMode: 'system' };

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getDevUnlock(): Promise<boolean> {
  const val = await AsyncStorage.getItem(DEV_UNLOCK_KEY);
  return val === 'true';
}

export async function setDevUnlock(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(DEV_UNLOCK_KEY, enabled ? 'true' : 'false');
}
