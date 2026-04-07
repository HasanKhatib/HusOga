import React from 'react';
import { View, Text, Pressable, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useSettings } from '../context/SettingsContext';
import { i18n } from '../i18n/translations';
import { Banner, Card, PageHeader, Screen, SectionTitle, PrimaryButton } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';
import { unlockPurchased } from '../core/services/purchase';

const isDev = __DEV__;

export default function SettingsScreen() {
  const t = useTheme();
  const { settings, setLocale, setThemeMode, isDevUnlocked, setDevUnlock } = useSettings();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <Screen>
          <PageHeader title={i18n.t('settings')} />

        <Card>
          <SectionTitle>{i18n.t('language')}</SectionTitle>
          <View style={styles.list}>
            <Pressable
              onPress={() => setLocale('sv')}
              style={[styles.row, { borderColor: t.colors.border }]}
            >
              <Text style={[styles.rowText, { color: t.colors.text }]}>{i18n.t('languageSwedish')}</Text>
              {settings.locale === 'sv' ? (
                <Text style={[styles.check, { color: t.colors.ok }]}>✓</Text>
              ) : null}
            </Pressable>
            <View style={{ height: 1, backgroundColor: t.colors.border }} />
            <Pressable
              onPress={() => setLocale('en')}
              style={[styles.row, { borderColor: t.colors.border }]}
            >
              <Text style={[styles.rowText, { color: t.colors.text }]}>{i18n.t('languageEnglish')}</Text>
              {settings.locale === 'en' ? (
                <Text style={[styles.check, { color: t.colors.ok }]}>✓</Text>
              ) : null}
            </Pressable>
          </View>
        </Card>

        <View style={{ height: t.space.xl }} />

        <Card>
          <SectionTitle>{i18n.t('appearance')}</SectionTitle>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              backgroundColor: t.isDark ? '#0B1220' : '#F1F3F8',
              borderRadius: 16,
              padding: 10,
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          >
            <ThemeChip
              selected={settings.themeMode === 'system'}
              onPress={() => setThemeMode('system')}
              icon="phone-portrait-outline"
              label={i18n.t('themeSystem')}
            />
            <ThemeChip
              selected={settings.themeMode === 'light'}
              onPress={() => setThemeMode('light')}
              icon="sunny-outline"
              label={i18n.t('themeLight')}
            />
            <ThemeChip
              selected={settings.themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
              icon="moon-outline"
              label={i18n.t('themeDark')}
            />
          </View>
        </Card>

        <View style={{ height: t.space.xl }} />

        <Card>
          <SectionTitle>{i18n.t('purchaseStatus')}</SectionTitle>
          <Text style={{ color: t.colors.text2, fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
            {settings.purchased || isDevUnlocked ? i18n.t('paidUnlimited') : i18n.t('freeOneReport')}
          </Text>
          <Text style={{ color: t.colors.text2, fontWeight: '600', marginBottom: t.space.l }}>
            {i18n.t('upgradeForUnlimited')}
          </Text>
          <PrimaryButton
            label={i18n.t('upgrade')}
            onPress={async () => {
              // Stubbed purchase flow for now.
              await unlockPurchased();
              Alert.alert('', i18n.t('upgraded'));
            }}
          />
          <View style={{ height: t.space.m }} />
          <Pressable onPress={() => Alert.alert('', i18n.t('restoreNotImplemented'))}>
            <Text style={{ textAlign: 'center', color: t.colors.text2, fontWeight: '700', fontSize: 16 }}>
              {i18n.t('restorePurchases')}
            </Text>
          </Pressable>
        </Card>

        {isDev ? (
          <>
            <View style={{ height: t.space.xl }} />
            <Card>
              <SectionTitle>Developer</SectionTitle>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: t.colors.text, fontWeight: '700', fontSize: 16 }}>
                  {i18n.t('devUnlock')}
                </Text>
                <Switch value={isDevUnlocked} onValueChange={setDevUnlock} />
              </View>
            </Card>
          </>
        ) : null}

        <View style={{ height: t.space.xl }} />

        <Banner text={i18n.t('disclaimer')} />

        <View style={{ height: t.space.xl }} />

          <Text style={{ textAlign: 'center', color: t.colors.text2, fontWeight: '600' }}>HusÖga v1.0.0</Text>
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}

function ThemeChip({
  selected,
  onPress,
  icon,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  const t = useTheme();

  // Keep selected state visible but subtle in dark mode.
  const selectedBg = t.isDark ? '#141F31' : t.colors.brand;
  const selectedBorder = t.isDark ? '#2B7FFF' : t.colors.brand;
  const selectedIcon = t.isDark ? '#E8EEF8' : t.colors.brandOn;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          height: 52,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? selectedBg : t.colors.surface,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected ? selectedBorder : t.colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={selected ? selectedIcon : t.colors.text2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowText: { fontSize: 18, fontWeight: '700' },
  check: { fontSize: 18, fontWeight: '900' },
});
