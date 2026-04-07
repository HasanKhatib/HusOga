import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'HusÖga', headerShown: false }} />
        <Stack.Screen name="form" options={{ title: 'House Data' }} />
        <Stack.Screen name="result" options={{ title: 'Result' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </SettingsProvider>
  );
}
