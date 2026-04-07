import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';
import { useTheme } from '../src/ui/theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <SettingsProvider>
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
      </Stack>
    </SettingsProvider>
  );
}
