import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HouseInputs, LifecycleFlag, Report } from '../core/models/types';
import { getReport } from '../core/services/storage';
import { i18n } from '../i18n/translations';
import { Card, PageHeader, Screen, SectionTitle } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';
import { drainageLifespan, fasadLifespans, roofLifespans, vatrumLifespan } from '../core/data/lifespans';
import { drainageCost, fasadCostPerSqm, roofCosts, vatrumCost } from '../core/data/costs';
import { SOURCES, TOPIC_ORDER, type Source, type SourceTopic } from '../core/data/sources';
import { useSettings } from '../context/SettingsContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function DetailedReportScreen() {
  const t = useTheme();
  const router = useRouter();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const { settings, isDevUnlocked } = useSettings();
  const entitled = settings.purchased || isDevUnlocked;

  useEffect(() => {
    if (reportId) getReport(reportId).then(setReport);
  }, [reportId]);

  const topFlags = useMemo(() => {
    if (!report) return [] as LifecycleFlag[];
    return [...report.outputs.lifecycleFlags]
      .sort((a, b) => b.contributionPercent - a.contributionPercent)
      .slice(0, 3);
  }, [report]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('detailedReportTitle')} subtitle={report?.houseLabel || undefined} />

          {!report ? (
            <Card>
              <Text style={{ color: t.colors.text2, fontWeight: '700' }}>…</Text>
            </Card>
          ) : (
            <>
              <Card>
                <SectionTitle>{i18n.t('result')}</SectionTitle>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                  <Text style={{ color: t.colors.text, fontWeight: '900', fontSize: 44 }}>
                    {report.outputs.score}
                  </Text>
                  <Text style={{ color: t.colors.text2, fontWeight: '800', fontSize: 16 }}>
                    {i18n.t(report.outputs.scoreBand)}
                  </Text>
                </View>
                <View style={{ height: t.space.m }} />

                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <Pressable
                    onPress={async () => {
                      if (!entitled) {
                        router.push({ pathname: '/paywall', params: { reportId } });
                        return;
                      }
                      if (Platform.OS === 'web') {
                        Alert.alert('', i18n.t('exportNotAvailableOnWeb'));
                        return;
                      }
                      const text = buildShareText(report);
                      await Share.share({ title: i18n.t('shareTitle'), message: text });
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      backgroundColor: t.colors.surface2,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text style={{ color: t.colors.text, fontWeight: '900' }}>{i18n.t('exportShare')}</Text>
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      if (!entitled) {
                        router.push({ pathname: '/paywall', params: { reportId } });
                        return;
                      }
                      if (Platform.OS === 'web') {
                        Alert.alert('', i18n.t('exportNotAvailableOnWeb'));
                        return;
                      }

                      const html = buildPdfHtml(report);
                      const { uri } = await Print.printToFileAsync({ html, base64: false });
                      if (!(await Sharing.isAvailableAsync())) {
                        Alert.alert('', i18n.t('exportedPdf'));
                        return;
                      }
                      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: t.colors.border,
                      backgroundColor: t.colors.surface2,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text style={{ color: t.colors.text, fontWeight: '900' }}>{i18n.t('exportPdf')}</Text>
                  </Pressable>
                </View>

                {topFlags.length === 0 ? (
                  <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22 }}>
                    {i18n.t('noMajorRisks')}
                  </Text>
                ) : (
                  <>
                    <Text style={{ color: t.colors.text2, fontWeight: '700', marginBottom: 8 }}>
                      {i18n.t('topDrivers')}
                    </Text>
                    {topFlags.map((f, idx) => (
                      <View key={idx} style={{ marginBottom: 10 }}>
                        <Text style={{ color: t.colors.text, fontWeight: '800' }}>{i18n.t(f.messageKey)}</Text>
                        <Text style={{ color: t.colors.text2, fontWeight: '600' }}>{f.contributionPercent}%</Text>
                      </View>
                    ))}
                  </>
                )}
              </Card>

              <View style={{ height: t.space.xl }} />

              <Card>
                <SectionTitle>{i18n.t('componentBreakdown')}</SectionTitle>
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="roof" />
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="facade" />
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="drainage" />
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="wetRooms" />
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="ventilation" />
                <ComponentCard inputs={report.inputs} flags={report.outputs.lifecycleFlags} component="heating" />
              </Card>

              <View style={{ height: t.space.xl }} />

              <Card>
                <SectionTitle>{i18n.t('assumptionsUsed')}</SectionTitle>
                <AssumptionsTable inputs={report.inputs} />
              </Card>

              <View style={{ height: t.space.xl }} />

              <Card>
                <SectionTitle>{i18n.t('costEstimate')}</SectionTitle>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <CostCell label={i18n.t('minCost')} value={formatSEK(report.outputs.costBand.min)} />
                  <CostCell label={i18n.t('likelyCost')} value={formatSEK(report.outputs.costBand.likely)} highlight />
                  <CostCell label={i18n.t('maxCost')} value={formatSEK(report.outputs.costBand.max)} />
                </View>
              </Card>

              <View style={{ height: t.space.xl }} />

              <Card>
                <SectionTitle>{i18n.t('sources')}</SectionTitle>
                <SourcesInline
                  onOpen={(s) =>
                    router.push({
                      pathname: '/webview',
                      params: { title: encodeURIComponent(s.title), url: encodeURIComponent(s.url) },
                    })
                  }
                />
              </Card>
            </>
          )}
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}

function buildShareText(report: Report): string {
  const out = report.outputs;
  const lines: string[] = [];
  lines.push(`HusÖga - ${report.houseLabel || 'Report'}`);
  lines.push(`Score: ${out.score}/100 (${out.scoreBand})`);
  lines.push(`Cost (5-10y): min ${formatSEK(out.costBand.min)}, likely ${formatSEK(out.costBand.likely)}, max ${formatSEK(out.costBand.max)}`);
  if (out.lifecycleFlags.length > 0) {
    lines.push('');
    lines.push('Top findings:');
    for (const f of [...out.lifecycleFlags].sort((a, b) => b.contributionPercent - a.contributionPercent).slice(0, 5)) {
      lines.push(`- ${f.component}: ${f.level} (${f.contributionPercent}%)`);
    }
  }
  lines.push('');
  lines.push(i18n.t('disclaimer'));
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPdfHtml(report: Report): string {
  const out = report.outputs;
  const title = escapeHtml(report.houseLabel || 'HusÖga report');
  const flags = [...out.lifecycleFlags]
    .sort((a, b) => b.contributionPercent - a.contributionPercent)
    .map((f) => `<li><strong>${escapeHtml(f.component)}</strong>: ${escapeHtml(f.level)} (${f.contributionPercent}%)</li>`)
    .join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; color: #0B1220; }
        h1 { font-size: 24px; margin: 0 0 8px; }
        .muted { color: #5B677A; }
        .card { border: 1px solid #E6E8EF; border-radius: 14px; padding: 16px; margin: 16px 0; }
        .row { display: flex; gap: 12px; flex-wrap: wrap; }
        .pill { border: 1px solid #E6E8EF; border-radius: 999px; padding: 8px 12px; font-weight: 700; }
        ul { margin: 8px 0 0 18px; }
        .disclaimer { font-size: 12px; color: #5B677A; margin-top: 24px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="muted">HusÖga detailed report</div>
      <div class="card">
        <div class="row">
          <div class="pill">Score: ${out.score}/100 (${escapeHtml(out.scoreBand)})</div>
          <div class="pill">Cost (5-10y): ${formatSEK(out.costBand.likely)}</div>
        </div>
        <div style="margin-top: 12px" class="muted">Cost band: min ${formatSEK(out.costBand.min)}, likely ${formatSEK(out.costBand.likely)}, max ${formatSEK(out.costBand.max)}</div>
      </div>
      <div class="card">
        <strong>Findings</strong>
        <ul>${flags || '<li>No major risks flagged.</li>'}</ul>
      </div>
      <div class="disclaimer">${escapeHtml(i18n.t('disclaimer'))}</div>
    </body>
  </html>`;
}

function topicLabel(topic: SourceTopic): string {
  if (topic === 'lifespans') return i18n.t('topicLifespans');
  if (topic === 'ventilation_moisture') return i18n.t('topicVentilationMoisture');
  if (topic === 'maintenance_cost') return i18n.t('topicMaintenanceCost');
  return i18n.t('topicSwedishGuidance');
}

function SourcesInline({ onOpen }: { onOpen: (s: Source) => void }) {
  const t = useTheme();

  const grouped = useMemo(() => {
    const map = new Map<SourceTopic, Source[]>();
    for (const topic of TOPIC_ORDER) map.set(topic, []);
    for (const s of SOURCES) {
      for (const topic of s.topics) {
        if (!map.has(topic)) map.set(topic, []);
        map.get(topic)!.push(s);
      }
    }
    return map;
  }, []);

  return (
    <>
      <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22, marginBottom: 12 }}>
        {i18n.t('sourcesIntro')}
      </Text>

      {TOPIC_ORDER.map((topic) => {
        const items = grouped.get(topic) ?? [];
        if (items.length === 0) return null;
        return (
          <View key={topic} style={{ marginBottom: 14 }}>
            <Text style={{ color: t.colors.text2, fontWeight: '900', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
              {topicLabel(topic)}
            </Text>
            {items.map((s, idx) => (
              <View key={s.id}>
                <Pressable
                  onPress={() => onOpen(s)}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: t.colors.text, fontWeight: '900' }}>{s.title}</Text>
                  <Text style={{ color: t.colors.text2, fontWeight: '700', marginTop: 2 }}>{s.publisher}</Text>
                </Pressable>
                {idx < items.length - 1 ? <View style={{ height: 1, backgroundColor: t.colors.border }} /> : null}
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

function formatSEK(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} kSEK`;
  return `${amount} SEK`;
}

function CostCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const t = useTheme();
  const highlightBg = t.isDark ? '#141F31' : t.colors.brand;
  const highlightBorder = t.isDark ? t.colors.info : t.colors.brand;
  const highlightLabel = t.isDark ? '#BFD3FF' : '#C7D0E0';
  const highlightValue = t.isDark ? '#E8EEF8' : '#fff';
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: highlight ? highlightBg : (t.isDark ? '#0B1220' : '#F1F3F8'),
        borderWidth: highlight ? 1.5 : 1,
        borderColor: highlight ? highlightBorder : t.colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '800',
          color: highlight ? highlightLabel : t.colors.text2,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 4, color: highlight ? highlightValue : t.colors.text }}>
        {value}
      </Text>
    </View>
  );
}

function ComponentCard({
  inputs,
  flags,
  component,
}: {
  inputs: HouseInputs;
  flags: LifecycleFlag[];
  component: LifecycleFlag['component'];
}) {
  const t = useTheme();
  const flag = flags.find((f) => f.component === component);
  const title =
    component === 'roof'
      ? `${i18n.t('roofType')}: ${i18n.t(inputs.yttertakType)}`
      : component === 'facade'
        ? `${i18n.t('facadeType')}: ${i18n.t(inputs.fasadType)}`
        : component === 'drainage'
          ? i18n.t('drainageAge')
          : component === 'wetRooms'
            ? i18n.t('wetRoomsAge')
            : component === 'ventilation'
              ? `${i18n.t('ventilation')}: ${i18n.t(inputs.ventilation)}`
              : `${i18n.t('heating')}: ${i18n.t(inputs.uppvarmning)}`;

  const level = flag?.level;
  const badgeColor = level === 'highRisk' ? t.colors.danger : level === 'risk' ? t.colors.warn : t.colors.ok;
  const badgeText = level ? i18n.t(level === 'highRisk' ? 'high' : 'medium') : i18n.t('low');

  const lifespanText = componentLifespanText(inputs, component);
  const costText = componentCostText(inputs, component);

  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: t.colors.surface2,
        padding: t.space.l,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ flex: 1, color: t.colors.text, fontWeight: '900', fontSize: 16 }}>{title}</Text>
        <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: badgeColor }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{badgeText}</Text>
        </View>
      </View>

      {flag ? (
        <>
          <View style={{ height: 8 }} />
          <Text style={{ color: t.colors.text2, fontWeight: '700' }}>{i18n.t(flag.messageKey)}</Text>
        </>
      ) : null}

      {lifespanText ? (
        <>
          <View style={{ height: 8 }} />
          <Text style={{ color: t.colors.text2, fontWeight: '600' }}>{lifespanText}</Text>
        </>
      ) : null}

      {costText ? (
        <>
          <View style={{ height: 6 }} />
          <Text style={{ color: t.colors.text2, fontWeight: '600' }}>{costText}</Text>
        </>
      ) : null}
    </View>
  );
}

function componentLifespanText(inputs: HouseInputs, component: LifecycleFlag['component']): string | null {
  if (component === 'roof') {
    const l = roofLifespans[inputs.yttertakType] ?? roofLifespans.other;
    return `Lifespan: ${l}y (age ${inputs.yttertakAge}y)`;
  }
  if (component === 'facade') {
    const l = fasadLifespans[inputs.fasadType];
    if (l == null) return `Lifespan: n/a (brick facade)`;
    return `Lifespan: ${l}y (age ${inputs.fasadAge}y)`;
  }
  if (component === 'drainage') {
    if (inputs.draneringAge == null) return 'Age: not provided';
    return `Lifespan: ${drainageLifespan}y (age ${inputs.draneringAge}y)`;
  }
  if (component === 'wetRooms') {
    if (inputs.vatrumAge == null) return 'Age: not provided';
    return `Lifespan: ${vatrumLifespan}y (age ${inputs.vatrumAge}y)`;
  }
  return null;
}

function componentCostText(inputs: HouseInputs, component: LifecycleFlag['component']): string | null {
  const fmt = (r: [number, number]) => `${formatSEK(r[0])}–${formatSEK(r[1])}`;
  if (component === 'roof') return `Replacement: ${fmt(roofCosts[inputs.yttertakType] ?? roofCosts.other)}`;
  if (component === 'drainage') return `Replacement: ${fmt(drainageCost)}`;
  if (component === 'wetRooms') return `Replacement: ${fmt(vatrumCost)}`;
  if (component === 'facade') {
    const cp = fasadCostPerSqm[inputs.fasadType] ?? 1500;
    if (cp <= 0) return null;
    const cost = Math.round(inputs.size * cp);
    return `Typical: ${formatSEK(Math.round(cost * 0.8))}–${formatSEK(Math.round(cost * 1.2))}`;
  }
  return null;
}

function AssumptionsTable({ inputs }: { inputs: HouseInputs }) {
  const t = useTheme();

  const rows: { label: string; value: string }[] = [
    { label: i18n.t('roofType'), value: `${i18n.t(inputs.yttertakType)} → ${roofLifespans[inputs.yttertakType] ?? roofLifespans.other}y` },
    {
      label: i18n.t('facadeType'),
      value:
        fasadLifespans[inputs.fasadType] == null
          ? `${i18n.t(inputs.fasadType)} → n/a`
          : `${i18n.t(inputs.fasadType)} → ${fasadLifespans[inputs.fasadType]}y`,
    },
    { label: i18n.t('drainageAge'), value: `${drainageLifespan}y (default)` },
    { label: i18n.t('wetRoomsAge'), value: `${vatrumLifespan}y (default)` },
  ];

  return (
    <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: t.colors.border }}>
      {rows.map((r, idx) => (
        <View key={r.label}>
          <View style={{ paddingVertical: 14, paddingHorizontal: 14, backgroundColor: t.colors.surface2 }}>
            <Text style={{ color: t.colors.text2, fontWeight: '800', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {r.label}
            </Text>
            <Text style={{ color: t.colors.text, fontWeight: '800', marginTop: 4 }}>{r.value}</Text>
          </View>
          {idx < rows.length - 1 ? <View style={{ height: 1, backgroundColor: t.colors.border }} /> : null}
        </View>
      ))}
    </View>
  );
}
