import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReport } from '../src/core/services/storage';
import { i18n } from '../src/i18n/translations';
import type { Report, LifecycleFlag } from '../src/core/models/types';

function formatSEK(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} kSEK`;
  return `${amount} SEK`;
}

function bandColor(band: string): string {
  if (band === 'high') return '#c0392b';
  if (band === 'medium') return '#e67e22';
  return '#27ae60';
}

function FlagCard({ flag }: { flag: LifecycleFlag }) {
  const isHigh = flag.level === 'highRisk';
  return (
    <View style={[styles.flagCard, isHigh ? styles.flagHigh : styles.flagMedium]}>
      <View style={styles.flagHeader}>
        <Text style={styles.flagIcon}>{isHigh ? '⚠️' : 'ℹ️'}</Text>
        <Text style={styles.flagComponent}>{flag.component.toUpperCase()}</Text>
        <Text style={styles.flagPct}>{flag.contributionPercent}%</Text>
      </View>
      <Text style={styles.flagMessage}>{i18n.t(flag.messageKey)}</Text>
      <Text style={styles.flagTriggered}>Triggered by: {flag.triggeredBy.join(', ')}</Text>
    </View>
  );
}

export default function ResultScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (reportId) getReport(reportId).then(setReport);
  }, [reportId]);

  if (!report) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} /></SafeAreaView>;
  }

  const { outputs } = report;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Score card */}
        <View style={[styles.scoreCard, { borderColor: bandColor(outputs.scoreBand) }]}>
          <Text style={[styles.scoreNumber, { color: bandColor(outputs.scoreBand) }]}>
            {outputs.score}
          </Text>
          <Text style={styles.scoreBand}>{i18n.t(outputs.scoreBand)}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>

        {/* Lifecycle flags */}
        {outputs.lifecycleFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifecycle Flags</Text>
            {outputs.lifecycleFlags.map((f, i) => <FlagCard key={i} flag={f} />)}
          </View>
        )}

        {/* Cost band */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('costEstimate')}</Text>
          <View style={styles.costRow}>
            <View style={styles.costCell}>
              <Text style={styles.costLabel}>{i18n.t('minCost')}</Text>
              <Text style={styles.costValue}>{formatSEK(outputs.costBand.min)}</Text>
            </View>
            <View style={[styles.costCell, styles.costCellHighlight]}>
              <Text style={styles.costLabel}>{i18n.t('likelyCost')}</Text>
              <Text style={[styles.costValue, styles.costValueHighlight]}>{formatSEK(outputs.costBand.likely)}</Text>
            </View>
            <View style={styles.costCell}>
              <Text style={styles.costLabel}>{i18n.t('maxCost')}</Text>
              <Text style={styles.costValue}>{formatSEK(outputs.costBand.max)}</Text>
            </View>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('negotiationChecklist')}</Text>
          {outputs.negotiationChecklist.map((key, i) => (
            <View key={i} style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>{i18n.t(key)}</Text>
            </View>
          ))}
        </View>

        {/* Legal disclaimer */}
        <Text style={styles.disclaimer}>{i18n.t('disclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, gap: 4, paddingBottom: 40 },
  scoreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 3, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  scoreNumber: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  scoreBand: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 4 },
  scoreLabel: { fontSize: 14, color: '#aaa' },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  flagCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  flagHigh: { backgroundColor: '#fff5f5', borderLeftColor: '#c0392b' },
  flagMedium: { backgroundColor: '#fffbf0', borderLeftColor: '#e67e22' },
  flagHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  flagIcon: { fontSize: 16 },
  flagComponent: { flex: 1, fontSize: 12, fontWeight: '700', color: '#333', letterSpacing: 0.5 },
  flagPct: { fontSize: 12, color: '#888', fontWeight: '600' },
  flagMessage: { fontSize: 14, color: '#333', marginBottom: 4 },
  flagTriggered: { fontSize: 11, color: '#aaa' },
  costRow: { flexDirection: 'row', gap: 8 },
  costCell: { flex: 1, alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 10, padding: 12 },
  costCellHighlight: { backgroundColor: '#1a1a2e' },
  costLabel: { fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
  costValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  costValueHighlight: { color: '#fff' },
  checkItem: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  checkIcon: { color: '#27ae60', fontWeight: '700', fontSize: 15, marginTop: 1 },
  checkText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  disclaimer: { fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 16, padding: 8 },
});
