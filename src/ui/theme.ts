export type Theme = ReturnType<typeof buildTheme>;

export function buildTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  const bg = isDark ? '#0B0F17' : '#F6F7FB';
  const surface = isDark ? '#101827' : '#FFFFFF';
  const surface2 = isDark ? '#0F172A' : '#FFFFFF';
  const text = isDark ? '#E8EEF8' : '#0B1220';
  const text2 = isDark ? '#A7B4C6' : '#5B677A';
  const border = isDark ? '#1F2A3B' : '#E6E8EF';

  return {
    mode,
    isDark,
    colors: {
      bg,
      surface,
      surface2,
      text,
      text2,
      border,
      brand: '#0B1220',
      brandOn: '#FFFFFF',
      danger: '#E5484D',
      ok: '#1FA971',
      warn: '#E7A92E',
      info: '#2B7FFF',
      bannerBg: isDark ? '#2A2412' : '#FFF3C4',
      bannerText: isDark ? '#F7D98A' : '#8A3B12',
    },
    radius: {
      s: 10,
      m: 14,
      l: 18,
    },
    space: {
      xs: 6,
      s: 10,
      m: 14,
      l: 18,
      xl: 24,
    },
    text: {
      h1: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
      h2: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.2 },
      label: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.6 },
      body: { fontSize: 16, fontWeight: '500' as const },
      meta: { fontSize: 13, fontWeight: '600' as const },
      small: { fontSize: 12, fontWeight: '600' as const },
    },
    shadow: isDark
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 6,
          shadowOffset: { width: 0, height: 8 },
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 3,
          shadowOffset: { width: 0, height: 8 },
        },
  };
}
