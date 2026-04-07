import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReport } from '../src/core/services/storage';
import { i18n } from '../src/i18n/translations';
import type { Report, LifecycleFlag } from '../src/core/models/types';
import { Banner, Card, PageHeader, Screen, SectionTitle } from '../src/ui/components';
import { useTheme } from '../src/ui/theme';

function formatSEK(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} kSEK`;
  return `${amount} SEK`;
}

function bandColor(band: string, t: ReturnType<typeof useTheme>): string {
  if (band === 'high') return t.colors.danger;
  if (band === 'medium') return t.colors.warn;
  return t.colors.ok;
}

function FlagCard({ flag }: { flag: LifecycleFlag }) {
  const t = useTheme();
  const isHigh = flag.level === 'highRisk';
  const left = isHigh ? t.colors.danger : t.colors.warn;
  const bg = isHigh ? (t.isDark ? '#201215' : '#FFF5F5') : (t.isDark ? '#201B10' : '#FFFBF0');
  return (
    <View
      style={{
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: left,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Text style={{ fontSize: 16 }}>{isHigh ? '⚠️' : 'ℹ️'}</Text>
        <Text style={{ flex: 1, fontSize: 12, fontWeight: '800', color: t.colors.text2, letterSpacing: 0.6 }}>
          {flag.component.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 12, color: t.colors.text2, fontWeight: '800' }}>{flag.contributionPercent}%</Text>
      </View>
      <Text style={{ fontSize: 15, color: t.colors.text, fontWeight: '700', marginBottom: 6 }}>
        {i18n.t(flag.messageKey)}
      </Text>
      <Text style={{ fontSize: 12, color: t.colors.text2, fontWeight: '600' }}>
        Triggered by: {flag.triggeredBy.join(', ')}
      </Text>
    </View>
  );
}

export default function ResultScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const t = useTheme();

  useEffect(() => {
    if (reportId) getReport(reportId).then(setReport);
  }, [reportId]);

  if (!report) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const { outputs } = report;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('result')} />

          <Card>
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ fontSize: 80, fontWeight: '900', letterSpacing: -1, color: bandColor(outputs.scoreBand, t) }}>
                {outputs.score}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: t.colors.text2, marginTop: 4 }}>
                {i18n.t(outputs.scoreBand)}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: t.colors.text2 }}>/100</Text>
            </View>
          </Card>

          <View style={{ height: t.space.xl }} />

          {outputs.lifecycleFlags.length > 0 ? (
            <Card>
              <SectionTitle>{i18n.t('lifecycleFlags') ?? 'Lifecycle Flags'}</SectionTitle>
              {outputs.lifecycleFlags.map((f, i) => (
                <FlagCard key={i} flag={f} />
              ))}
            </Card>
          ) : null}

          <View style={{ height: t.space.xl }} />

          <Card>
            <SectionTitle>{i18n.t('costEstimate')}</SectionTitle>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <CostPill label={i18n.t('minCost')} value={formatSEK(outputs.costBand.min)} />
              <CostPill label={i18n.t('likelyCost')} value={formatSEK(outputs.costBand.likely)} highlight />
              <CostPill label={i18n.t('maxCost')} value={formatSEK(outputs.costBand.max)} />
            </View>
          </Card>

          <View style={{ height: t.space.xl }} />

          <Card>
            <SectionTitle>{i18n.t('negotiationChecklist')}</SectionTitle>
            {outputs.negotiationChecklist.map((key, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <Text style={{ color: t.colors.ok, fontWeight: '900', fontSize: 16, marginTop: 1 }}>✓</Text>
                <Text style={{ flex: 1, color: t.colors.text, fontWeight: '600', fontSize: 15, lineHeight: 22 }}>
                  {i18n.t(key)}
                </Text>
              </View>
            ))}
          </Card>

          <View style={{ height: t.space.xl }} />

          <Banner text={i18n.t('disclaimer')} />
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}

function CostPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: highlight ? t.colors.brand : (t.isDark ? '#0B1220' : '#F1F3F8'),
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '800', color: highlight ? '#C7D0E0' : t.colors.text2, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 4, color: highlight ? '#fff' : t.colors.text }}>
        {value}
      </Text>
    </View>
  );
}
