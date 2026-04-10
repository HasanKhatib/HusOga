import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ComponentCondition, ConditionLevel, HouseInputs, Report } from '../core/models/types';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSEK(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} MSEK`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} kSEK`;
  return `${amount} SEK`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function levelDotColor(level: ConditionLevel): string {
  if (level === 'priority') return '#E5484D';
  if (level === 'attention') return '#E7A92E';
  return '#1FA971';
}

function levelLabelText(level: ConditionLevel): string {
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

// ─── Share text ───────────────────────────────────────────────────────────────

function buildShareText(report: Report): string {
  const out = report.outputs;
  const lines: string[] = [];
  lines.push(`HusÖga — ${i18n.t('konditionsoverikt')}`);
  lines.push(report.houseLabel || '');
  lines.push(report.timestamp.slice(0, 10));
  lines.push('');
  for (const cc of out.componentConditions) {
    const name = i18n.t(COMPONENT_LABEL_KEY[cc.component]);
    const label = levelLabelText(cc.level);
    const icon = cc.level === 'priority' ? '🔴' : cc.level === 'attention' ? '🟡' : '🟢';
    lines.push(`${name}: ${label} ${icon}`);
  }
  const hasAnyCost = out.costBand.likely > 0;
  if (hasAnyCost) {
    lines.push('');
    lines.push(`${i18n.t('costForecastTitle')}: ca ${formatSEK(out.costBand.likely)} (${formatSEK(out.costBand.min)}–${formatSEK(out.costBand.max)})`);
  }
  lines.push('');
  lines.push(i18n.t('disclaimer'));
  return lines.join('\n');
}

// ─── PDF HTML ─────────────────────────────────────────────────────────────────

function buildPdfHtml(report: Report): string {
  const out = report.outputs;
  const title = escapeHtml(report.houseLabel || 'HusÖga');
  const date = report.timestamp.slice(0, 10);
  const disclaimer = escapeHtml(i18n.t('disclaimer'));
  const hasAnyCost = out.costBand.likely > 0;

  const conditionRows = out.componentConditions.map((cc) => {
    const name = escapeHtml(i18n.t(COMPONENT_LABEL_KEY[cc.component]));
    const label = escapeHtml(levelLabelText(cc.level));
    const color = levelDotColor(cc.level);
    return `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #E6E8EF;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>
        <strong>${name}</strong>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #E6E8EF;color:${color};font-weight:700;">${label}</td>
    </tr>`;
  }).join('');

  const tipRows = out.viewingTips.map((k) =>
    `<li style="margin-bottom:6px;">${escapeHtml(i18n.t(k))}</li>`
  ).join('');

  const costSection = hasAnyCost
    ? `<div class="card">
        <h3>${escapeHtml(i18n.t('costForecastTitle'))}</h3>
        <p>${escapeHtml(i18n.t('costForecastProse'))} <strong>${escapeHtml(formatSEK(out.costBand.min))} – ${escapeHtml(formatSEK(out.costBand.max))}</strong>, ${escapeHtml(i18n.t('likelyCost').toLowerCase())} <strong>${escapeHtml(formatSEK(out.costBand.likely))}</strong>.</p>
      </div>`
    : `<div class="card"><p style="color:#1FA971;font-weight:700;">${escapeHtml(i18n.t('costForecastNone'))}</p></div>`;

  const lifetimeRows = out.componentConditions
    .filter((cc) => cc.ageYears != null && cc.lifespanYears != null)
    .map((cc) => {
      const pct = Math.round((cc.ageYears! / cc.lifespanYears!) * 100);
      const color = levelDotColor(cc.level);
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #E6E8EF;">${escapeHtml(i18n.t(COMPONENT_LABEL_KEY[cc.component]))}</td>
        <td style="padding:8px;border-bottom:1px solid #E6E8EF;">${cc.ageYears} / ${cc.lifespanYears}</td>
        <td style="padding:8px;border-bottom:1px solid #E6E8EF;color:${color};font-weight:700;">${pct}%</td>
      </tr>`;
    }).join('');

  const greenRows = out.greenSignals.map((s) =>
    `<li style="margin-bottom:6px;color:#1FA971;">✓ ${escapeHtml(i18n.t(s.messageKey))}</li>`
  ).join('');

  return `<!doctype html>
<html lang="sv">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; padding: 24px 28px; color: #0B1220; max-width: 680px; margin: 0 auto; }
      h1 { font-size: 26px; margin: 0 0 4px; }
      h2 { font-size: 18px; margin: 0 0 12px; color: #0B1220; }
      h3 { font-size: 15px; margin: 0 0 10px; }
      .muted { color: #5B677A; font-size: 14px; }
      .card { border: 1px solid #E6E8EF; border-radius: 14px; padding: 16px 20px; margin: 16px 0; }
      table { width: 100%; border-collapse: collapse; }
      ul { margin: 0; padding-left: 18px; }
      .disclaimer { font-size: 11px; color: #5B677A; border-top: 1px solid #E6E8EF; margin-top: 32px; padding-top: 12px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p class="muted">HusÖga · ${escapeHtml(date)}</p>

    <div class="card">
      <h2>${escapeHtml(i18n.t('konditionsoverikt'))}</h2>
      <table>${conditionRows}</table>
    </div>

    <div class="card">
      <h2>${escapeHtml(i18n.t('viewingTipsTitle'))}</h2>
      <ul>${tipRows}</ul>
    </div>

    ${costSection}

    ${lifetimeRows ? `<div class="card">
      <h2>${escapeHtml(i18n.t('lifetimeAnalysisTitle'))}</h2>
      <table>
        <thead><tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #E6E8EF;">${escapeHtml(i18n.t('lifetimeComponent'))}</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #E6E8EF;">${escapeHtml(i18n.t('lifetimeAge'))} / ${escapeHtml(i18n.t('lifetimeLifespan'))}</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #E6E8EF;">${escapeHtml(i18n.t('lifetimeUsed'))}</th>
        </tr></thead>
        <tbody>${lifetimeRows}</tbody>
      </table>
    </div>` : ''}

    ${greenRows ? `<div class="card">
      <h2>${escapeHtml(i18n.t('greenStrengthsTitle'))}</h2>
      <ul>${greenRows}</ul>
    </div>` : ''}

    <div class="disclaimer">${disclaimer}</div>
  </body>
</html>`;
}

// ─── Sources ──────────────────────────────────────────────────────────────────

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
                <Pressable onPress={() => onOpen(s)} style={({ pressed }) => ({ paddingVertical: 10, opacity: pressed ? 0.85 : 1 })}>
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

// ─── Assumptions table ────────────────────────────────────────────────────────

function AssumptionsTable({ inputs }: { inputs: HouseInputs }) {
  const t = useTheme();
  const rows: { label: string; value: string }[] = [
    { label: i18n.t('roofType'), value: `${i18n.t(inputs.yttertakType)} → ${roofLifespans[inputs.yttertakType] ?? roofLifespans.other}y` },
    {
      label: i18n.t('facadeType'),
      value: fasadLifespans[inputs.fasadType] == null
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
            <Text style={{ color: t.colors.text2, fontWeight: '800', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>{r.label}</Text>
            <Text style={{ color: t.colors.text, fontWeight: '800', marginTop: 4 }}>{r.value}</Text>
          </View>
          {idx < rows.length - 1 ? <View style={{ height: 1, backgroundColor: t.colors.border }} /> : null}
        </View>
      ))}
    </View>
  );
}

// ─── CostCell ─────────────────────────────────────────────────────────────────

function CostCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const t = useTheme();
  const highlightBg = t.isDark ? '#141F31' : t.colors.brand;
  const highlightBorder = t.isDark ? t.colors.info : t.colors.brand;
  const highlightLabel = t.isDark ? '#BFD3FF' : '#C7D0E0';
  const highlightValue = t.isDark ? '#E8EEF8' : '#fff';
  return (
    <View style={{
      flex: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center',
      backgroundColor: highlight ? highlightBg : (t.isDark ? '#0B1220' : '#F1F3F8'),
      borderWidth: highlight ? 1.5 : 1,
      borderColor: highlight ? highlightBorder : t.colors.border,
    }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: highlight ? highlightLabel : t.colors.text2, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '900', marginTop: 4, color: highlight ? highlightValue : t.colors.text }}>
        {value}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

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

  useEffect(() => {
    if (!reportId) return;
    if (!entitled) {
      router.replace({ pathname: '/paywall', params: { reportId } });
    }
  }, [entitled, reportId, router]);

  if (!report) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: t.colors.text2, fontWeight: '700' }}>…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const out = report.outputs;
  const hasAnyCost = out.costBand.likely > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('detailedReportTitle')} subtitle={report.houseLabel || undefined} />

          {/* Export buttons */}
          <Card>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Pressable
                onPress={async () => {
                  if (Platform.OS === 'web') { Alert.alert('', i18n.t('exportNotAvailableOnWeb')); return; }
                  const text = buildShareText(report);
                  await Share.share({ title: i18n.t('shareTitle'), message: text });
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                  borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface2,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: t.colors.text, fontWeight: '900' }}>{i18n.t('exportShare')}</Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  if (Platform.OS === 'web') { Alert.alert('', i18n.t('exportNotAvailableOnWeb')); return; }
                  const html = buildPdfHtml(report);
                  const { uri } = await Print.printToFileAsync({ html, base64: false });
                  if (!(await Sharing.isAvailableAsync())) { Alert.alert('', i18n.t('exportedPdf')); return; }
                  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                  borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface2,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: t.colors.text, fontWeight: '900' }}>{i18n.t('exportPdf')}</Text>
              </Pressable>
            </View>
          </Card>

          <View style={{ height: t.space.xl }} />

          {/* Konditionsöversikt */}
          <Card>
            <SectionTitle>{i18n.t('konditionsoverikt')}</SectionTitle>
            {out.componentConditions.map((cc) => {
              const dotColor = levelDotColor(cc.level);
              return (
                <View key={cc.component} style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                  borderBottomWidth: 1, borderBottomColor: t.colors.border, gap: 12,
                }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: t.colors.text }}>
                    {i18n.t(COMPONENT_LABEL_KEY[cc.component])}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: dotColor }}>
                    {levelLabelText(cc.level)}
                  </Text>
                </View>
              );
            })}
          </Card>

          <View style={{ height: t.space.xl }} />

          {/* Cost forecast */}
          <Card>
            <SectionTitle>{i18n.t('costForecastTitle')}</SectionTitle>
            {hasAnyCost ? (
              <>
                <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22, marginBottom: t.space.m }}>
                  {i18n.t('costForecastProse')} {formatSEK(out.costBand.min)} – {formatSEK(out.costBand.max)}, {i18n.t('likelyCost').toLowerCase()} {formatSEK(out.costBand.likely)}.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <CostCell label={i18n.t('minCost')} value={formatSEK(out.costBand.min)} />
                  <CostCell label={i18n.t('likelyCost')} value={formatSEK(out.costBand.likely)} highlight />
                  <CostCell label={i18n.t('maxCost')} value={formatSEK(out.costBand.max)} />
                </View>
              </>
            ) : (
              <Text style={{ color: t.colors.ok, fontWeight: '600', lineHeight: 22 }}>
                {i18n.t('costForecastNone')}
              </Text>
            )}
          </Card>

          <View style={{ height: t.space.xl }} />

          {/* Lifetime analysis */}
          <Card>
            <SectionTitle>{i18n.t('lifetimeAnalysisTitle')}</SectionTitle>
            {out.componentConditions.map((cc) => {
              if (cc.ageYears == null || cc.lifespanYears == null) return null;
              const pct = Math.round((cc.ageYears / cc.lifespanYears) * 100);
              const dotColor = levelDotColor(cc.level);
              return (
                <View key={cc.component} style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
                  borderBottomWidth: 1, borderBottomColor: t.colors.border, gap: 8,
                }}>
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

          {/* Green strengths */}
          {out.greenSignals.length > 0 ? (
            <>
              <View style={{ height: t.space.xl }} />
              <Card>
                <SectionTitle>{i18n.t('greenStrengthsTitle')}</SectionTitle>
                {out.greenSignals.map((s, i) => (
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

          <View style={{ height: t.space.xl }} />

          {/* Assumptions */}
          <Card>
            <SectionTitle>{i18n.t('assumptionsUsed')}</SectionTitle>
            <AssumptionsTable inputs={report.inputs} />
          </Card>

          <View style={{ height: t.space.xl }} />

          {/* Sources */}
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
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
