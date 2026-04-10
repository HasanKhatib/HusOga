import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReport, saveReport } from '../src/core/services/storage';
import { i18n } from '../src/i18n/translations';
import type { Report, ComponentCondition, ConditionLevel } from '../src/core/models/types';
import { Banner, Card, PageHeader, PrimaryButton, Screen, SectionTitle } from '../src/ui/components';
import { useTheme } from '../src/ui/ThemeProvider';
import { useSettings } from '../src/context/SettingsContext';
import { computeRisk, buildDecisionPoints, MODEL_VERSION } from '../src/core/services/riskEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSEK(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} kSEK`;
  return `${amount} SEK`;
}

function levelColor(level: ConditionLevel, t: ReturnType<typeof useTheme>): string {
  if (level === 'priority') return t.colors.danger;
  if (level === 'attention') return t.colors.warn;
  return t.colors.ok;
}

function levelLabel(level: ConditionLevel): string {
  if (level === 'priority') return i18n.t('levelPriority');
  if (level === 'attention') return i18n.t('levelAttention');
  return i18n.t('levelOk');
}

const COMPONENT_LABEL_KEY: Record<ComponentCondition['component'], string> = {
  roof: 'componentRoof',
  facade: 'componentFacade',
  grund: 'componentGrund',
  vatrum: 'componentVatrum',
  ventilation: 'componentVentilation',
  uppvarmning: 'componentUppvarmning',
};

const FIELD_LABEL_KEY: Record<string, string> = {
  yttertakType: 'fieldYttertakType',
  yttertakAge: 'fieldYttertakAge',
  fasadType: 'fieldFasadType',
  fasadAge: 'fieldFasadAge',
  draneringAge: 'fieldDraneringAge',
  vatrumAge: 'fieldVatrumAge',
  ventilation: 'fieldVentilation',
  uppvarmning: 'fieldUppvarmning',
  byggnadsar: 'fieldByggnadsar',
  grundlaeggning: 'fieldGrunlaeggning',
};

function localizeField(key: string): string {
  const i18nKey = FIELD_LABEL_KEY[key];
  return i18nKey ? i18n.t(i18nKey) : key;
}

// ─── ComponentRow ─────────────────────────────────────────────────────────────

function ComponentRow({ cc }: { cc: ComponentCondition }) {
  const t = useTheme();
  const [expanded, setExpanded] = useState(false);
  const dotColor = levelColor(cc.level, t);
  const rowBg = expanded
    ? (t.isDark ? '#141C2A' : '#F5F7FF')
    : 'transparent';

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: t.colors.border,
        backgroundColor: rowBg,
        borderRadius: expanded ? 10 : 0,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor }} />
        <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: t.colors.text }}>
          {i18n.t(COMPONENT_LABEL_KEY[cc.component])}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: dotColor }}>
          {levelLabel(cc.level)}
        </Text>
        <Text style={{ fontSize: 12, color: t.colors.text2, marginLeft: 4 }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </View>

      {expanded ? (
        <View style={{ marginTop: 10, paddingLeft: 24 }}>
          <Text style={{ fontSize: 14, color: t.colors.text, fontWeight: '600', lineHeight: 20, marginBottom: 6 }}>
            {i18n.t(cc.messageKey)}
          </Text>
          {cc.ageYears != null && cc.lifespanYears != null ? (
            <Text style={{ fontSize: 12, color: t.colors.text2, fontWeight: '600' }}>
              {cc.ageYears} {i18n.t('lifetimeAge').toLowerCase()} / {cc.lifespanYears} {i18n.t('lifetimeLifespan').toLowerCase()} ({Math.round((cc.ageYears / cc.lifespanYears) * 100)}% {i18n.t('lifetimeUsed').toLowerCase()})
            </Text>
          ) : null}
          {cc.triggeredBy.length > 0 ? (
            <Text style={{ fontSize: 11, color: t.colors.text2, marginTop: 4 }}>
              {cc.triggeredBy.map(localizeField).join(', ')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

// ─── CostPill ─────────────────────────────────────────────────────────────────

function CostPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const t = useTheme();
  const highlightBg = t.isDark ? '#141F31' : t.colors.brand;
  const highlightBorder = t.isDark ? t.colors.info : t.colors.brand;
  const highlightLabel = t.isDark ? '#BFD3FF' : '#C7D0E0';
  const highlightValue = t.isDark ? '#E8EEF8' : '#fff';
  return (
    <View
      style={{
        flex: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center',
        backgroundColor: highlight ? highlightBg : (t.isDark ? '#0B1220' : '#F1F3F8'),
        borderWidth: highlight ? 1.5 : 1,
        borderColor: highlight ? highlightBorder : t.colors.border,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '800', color: highlight ? highlightLabel : t.colors.text2, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 4, color: highlight ? highlightValue : t.colors.text }}>
        {value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const t = useTheme();
  const router = useRouter();
  const { settings, isDevUnlocked } = useSettings();

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
  const entitled = settings.purchased || isDevUnlocked;
  const isStale = report.modelVersion !== MODEL_VERSION;
  const decisionPoints = buildDecisionPoints(outputs.componentConditions);
  const hasAnyCost = outputs.costBand.likely > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={report.houseLabel || i18n.t('result')} subtitle={report.timestamp.slice(0, 10)} />

          {/* Stale model banner */}
          {isStale ? (
            <>
              <Card>
                <Text style={{ color: t.colors.text, fontWeight: '900', fontSize: 16, marginBottom: 6 }}>
                  {i18n.t('modelUpdatedTitle')}
                </Text>
                <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22, marginBottom: t.space.m }}>
                  {i18n.t('modelUpdatedBody')}
                </Text>
                <Pressable
                  onPress={async () => {
                    const updated: Report = {
                      ...report,
                      outputs: computeRisk(report.inputs),
                      modelVersion: MODEL_VERSION,
                    };
                    await saveReport(updated);
                    setReport(updated);
                  }}
                  style={({ pressed }) => ({
                    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10,
                    borderRadius: 12, borderWidth: 1, borderColor: t.colors.border,
                    backgroundColor: t.colors.surface2, opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ color: t.colors.text, fontWeight: '800' }}>{i18n.t('recalculate')}</Text>
                </Pressable>
              </Card>
              <View style={{ height: t.space.l }} />
            </>
          ) : null}

          {/* FREE: Konditionsöversikt — traffic-light summary */}
          <Card>
            <SectionTitle>{i18n.t('konditionsoverikt')}</SectionTitle>
            {outputs.componentConditions.map((cc) => (
              <ComponentRow key={cc.component} cc={cc} />
            ))}
          </Card>

          <View style={{ height: t.space.xl }} />

          {/* FREE: Viewing tips */}
          {outputs.viewingTips.length > 0 ? (
            <>
              <Card>
                <SectionTitle>{i18n.t('viewingTipsTitle')}</SectionTitle>
                {outputs.viewingTips.map((key, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <Text style={{ color: t.colors.info, fontWeight: '900', fontSize: 14, marginTop: 2 }}>→</Text>
                    <Text style={{ flex: 1, color: t.colors.text, fontWeight: '600', fontSize: 14, lineHeight: 21 }}>
                      {i18n.t(key)}
                    </Text>
                  </View>
                ))}
              </Card>
              <View style={{ height: t.space.xl }} />
            </>
          ) : null}

          {/* CTA to detailed report */}
          <PrimaryButton
            label={i18n.t('viewDetailedReport')}
            onPress={() => {
              if (entitled) router.push({ pathname: '/detailed', params: { reportId } });
              else router.push({ pathname: '/paywall', params: { reportId } });
            }}
          />

          {/* PAID: Decision points */}
          {entitled ? (
            <>
              <View style={{ height: t.space.xl }} />
              <Card>
                <SectionTitle>{i18n.t('decisionPointsTitle')}</SectionTitle>
                {decisionPoints.map((key, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <Text style={{ color: t.colors.ok, fontWeight: '900', fontSize: 16, marginTop: 1 }}>✓</Text>
                    <Text style={{ flex: 1, color: t.colors.text, fontWeight: '600', fontSize: 15, lineHeight: 22 }}>
                      {i18n.t(key)}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {/* PAID: Cost forecast */}
          {entitled ? (
            <>
              <View style={{ height: t.space.xl }} />
              <Card>
                <SectionTitle>{i18n.t('costForecastTitle')}</SectionTitle>
                {hasAnyCost ? (
                  <>
                    <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22, marginBottom: t.space.m }}>
                      {i18n.t('costForecastProse')} {formatSEK(outputs.costBand.min)} – {formatSEK(outputs.costBand.max)}, {i18n.t('likelyCost').toLowerCase()} {formatSEK(outputs.costBand.likely)}.
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <CostPill label={i18n.t('minCost')} value={formatSEK(outputs.costBand.min)} />
                      <CostPill label={i18n.t('likelyCost')} value={formatSEK(outputs.costBand.likely)} highlight />
                      <CostPill label={i18n.t('maxCost')} value={formatSEK(outputs.costBand.max)} />
                    </View>
                  </>
                ) : (
                  <Text style={{ color: t.colors.ok, fontWeight: '600', lineHeight: 22 }}>
                    {i18n.t('costForecastNone')}
                  </Text>
                )}
              </Card>
            </>
          ) : null}

          {/* PAID: Lifetime analysis */}
          {entitled ? (
            <>
              <View style={{ height: t.space.xl }} />
              <Card>
                <SectionTitle>{i18n.t('lifetimeAnalysisTitle')}</SectionTitle>
                {outputs.componentConditions.map((cc) => {
                  if (cc.ageYears == null || cc.lifespanYears == null) return null;
                  const pct = Math.round((cc.ageYears / cc.lifespanYears) * 100);
                  const dotColor = levelColor(cc.level, t);
                  return (
                    <View
                      key={cc.component}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
                        borderBottomWidth: 1, borderBottomColor: t.colors.border, gap: 8 }}
                    >
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                      <Text style={{ flex: 2, fontSize: 14, fontWeight: '700', color: t.colors.text }}>
                        {i18n.t(COMPONENT_LABEL_KEY[cc.component])}
                      </Text>
                      <Text style={{ flex: 1, fontSize: 13, color: t.colors.text2, textAlign: 'right' }}>
                        {cc.ageYears} / {cc.lifespanYears} {i18n.t('lifetimeAge').toLowerCase()}
                      </Text>
                      <Text style={{ width: 44, fontSize: 13, fontWeight: '800', color: dotColor, textAlign: 'right' }}>
                        {pct}%
                      </Text>
                    </View>
                  );
                })}
              </Card>
            </>
          ) : null}

          {/* PAID: Green strengths */}
          {entitled && outputs.greenSignals.length > 0 ? (
            <>
              <View style={{ height: t.space.xl }} />
              <Card>
                <SectionTitle>{i18n.t('greenStrengthsTitle')}</SectionTitle>
                {outputs.greenSignals.map((s, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <Text style={{ color: t.colors.ok, fontWeight: '900', fontSize: 16, marginTop: 1 }}>✓</Text>
                    <Text style={{ flex: 1, color: t.colors.text, fontWeight: '600', fontSize: 14, lineHeight: 21 }}>
                      {i18n.t(s.messageKey)}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {/* Sources */}
          <View style={{ height: t.space.xl }} />
          <Card>
            <SectionTitle>{i18n.t('sources')}</SectionTitle>
            <Pressable
              onPress={() => router.push('/sources')}
              style={({ pressed }) => ({
                alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10,
                borderRadius: 12, borderWidth: 1, borderColor: t.colors.border,
                backgroundColor: t.colors.surface2, opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: t.colors.text, fontWeight: '800' }}>{i18n.t('sources')}</Text>
            </Pressable>
            <View style={{ height: 10 }} />
            <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22 }}>
              {i18n.t('sourcesIntro')}
            </Text>
          </Card>

          <View style={{ height: t.space.xl }} />
          <Banner text={i18n.t('disclaimer')} />
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
