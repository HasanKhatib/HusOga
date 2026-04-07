import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../core/services/settings';
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
    getSettings().then((s) => {
      setSettings(s);
      i18n.locale = s.locale;
    });
  }, []);

  async function setLocale(locale: 'en' | 'sv') {
    const updated = { ...settings, locale };
    i18n.locale = locale;
    setSettings(updated);
    await saveSettings(updated);
  }

  return (
    <SettingsContext.Provider value={{ settings, setLocale, isDevUnlocked, setDevUnlock: setIsDevUnlocked }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
