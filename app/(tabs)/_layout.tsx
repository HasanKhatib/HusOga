import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/ui/theme';
import { i18n } from '../../src/i18n/translations';
import { useSettings } from '../../src/context/SettingsContext';

export default function TabsLayout() {
  const t = useTheme();
  // Subscribe so tab labels update when locale changes.
  useSettings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          height: 86,
          paddingTop: 10,
          paddingBottom: 18,
        },
        tabBarActiveTintColor: t.colors.text,
        tabBarInactiveTintColor: t.colors.text2,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('reports'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: i18n.t('newAssessment'),
          tabBarIcon: ({ color, focused }) => (
            <PlusIcon color={focused ? t.colors.text : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size ?? 22} />
          ),
        }}
      />
    </Tabs>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <Text
      style={{
        fontSize: 28,
        color,
        fontWeight: '800',
      }}
    >
      +
    </Text>
  );
}
