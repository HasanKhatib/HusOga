import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ThemeProvider, useTheme } from '../src/ui/ThemeProvider';

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
