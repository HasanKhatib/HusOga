import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '../i18n/translations';
import { Card, PageHeader, PrimaryButton, Screen } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';
import { unlockPurchased } from '../core/services/purchase';

export default function PaywallScreen() {
  const t = useTheme();
  const router = useRouter();
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('upgradeTitle')} subtitle={i18n.t('upgradeSubtitle')} />

          <Card>
            <Text style={{ color: t.colors.text, fontWeight: '800', fontSize: 18, marginBottom: 10 }}>
              {i18n.t('upgradeValueHeader')}
            </Text>

            {([
              'upgradeValueDetailed',
              'upgradeValueAssumptions',
              'upgradeValueExport',
              'upgradeValueUnlimited',
            ] as const).map((k) => (
              <View key={k} style={{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <Text style={{ color: t.colors.ok, fontWeight: '900', fontSize: 16, marginTop: 1 }}>✓</Text>
                <Text style={{ flex: 1, color: t.colors.text, fontWeight: '600', fontSize: 15, lineHeight: 22 }}>
                  {i18n.t(k)}
                </Text>
              </View>
            ))}

            <View style={{ height: t.space.l }} />

            <PrimaryButton
              label={i18n.t('upgrade')}
              onPress={async () => {
                // Stubbed purchase flow for now.
                await unlockPurchased();
                if (reportId) router.replace({ pathname: '/detailed', params: { reportId } });
                else router.back();
              }}
            />
          </Card>
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
