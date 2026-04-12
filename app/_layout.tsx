import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ThemeProvider, useTheme } from '../src/ui/ThemeProvider';
import { RC_CONFIG } from '../src/core/services/iapConfig';

/**
 * Initialise RevenueCat on app startup.
 * Skipped on web and when the API key is not yet configured.
 */
function useRevenueCat() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!RC_CONFIG.apiKey) return;

    let cancelled = false;
    import('react-native-purchases')
      .then((mod) => {
        if (cancelled) return;
        mod.default.configure({ apiKey: RC_CONFIG.apiKey });
      })
      .catch(() => {
        // Native module not available (e.g. Expo Go) — silently skip.
      });

    return () => {
      cancelled = true;
    };
  }, []);
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </SettingsProvider>
  );
}

function ThemedStack() {
  useRevenueCat();
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.bg },
        headerTitleStyle: { color: t.colors.text },
        headerTintColor: t.colors.text,
        contentStyle: { backgroundColor: t.colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ title: '' }} />
      <Stack.Screen name="detailed" options={{ title: '' }} />
      <Stack.Screen name="paywall" options={{ title: '' }} />
      <Stack.Screen name="sources" options={{ title: '' }} />
      <Stack.Screen name="webview" options={{ title: '' }} />
    </Stack>
  );
}
