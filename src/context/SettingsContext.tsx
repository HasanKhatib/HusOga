import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Localization from 'expo-localization';
import { getDevUnlock, getSettings, saveSettings, setDevUnlock } from '../core/services/settings';
import { i18n } from '../i18n/translations';
import type { AppSettings } from '../core/models/types';

interface SettingsContextValue {
  settings: AppSettings;
  setLocale: (locale: 'en' | 'sv') => Promise<void>;
  isDevUnlocked: boolean;
  setDevUnlock: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({ locale: 'sv', purchased: false });
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      const dev = await getDevUnlock();

      // If the user never changed locale, prefer device locale (en/sv) else default sv.
      const device = Localization.getLocales()?.[0]?.languageCode;
      const resolvedLocale = s.locale ?? (device === 'en' || device === 'sv' ? device : 'sv');
      const resolved = { ...s, locale: resolvedLocale as 'en' | 'sv' };

      setSettings(resolved);
      setIsDevUnlocked(dev);
      i18n.locale = resolved.locale;
    })();
  }, []);

  async function setLocale(locale: 'en' | 'sv') {
    const updated = { ...settings, locale };
    i18n.locale = locale;
    setSettings(updated);
    await saveSettings(updated);
  }

  async function setDev(val: boolean) {
    setIsDevUnlocked(val);
    await setDevUnlock(val);
  }

  return (
    <SettingsContext.Provider value={{ settings, setLocale, isDevUnlocked, setDevUnlock: setDev }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
