import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteReport, listReports } from '../../src/core/services/storage';
import { i18n } from '../../src/i18n/translations';
import type { Report } from '../../src/core/models/types';
import { Banner, Card, PageHeader } from '../../src/ui/components';
import { useTheme } from '../../src/ui/theme';

export default function ReportsTab() {
  const t = useTheme();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listReports();
    setReports(list);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function bandPill(band: string) {
    if (band === 'high') return { bg: '#E5484D', text: '#fff' };
    if (band === 'medium') return { bg: '#E7A92E', text: '#0B1220' };
    return { bg: '#1FA971', text: '#fff' };
  }

  async function handleDelete(r: Report) {
    const label = r.houseLabel || i18n.t('report');
    Alert.alert(i18n.t('deleteReportTitle'), i18n.t('removeReport', { label }), [
      { text: i18n.t('cancel'), style: 'cancel' },
      {
        text: i18n.t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteReport(r.id);
          await load();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <FlatList
        data={loading ? [] : reports}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: t.space.xl, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: t.space.m }} />}
        ListHeaderComponent={
          <>
            <PageHeader title="HusÖga" subtitle={i18n.t('reports')} />
            <Banner text={i18n.t('disclaimer')} />
            <View style={{ height: t.space.xl }} />
            {loading ? <Text style={{ color: t.colors.text2 }}>…</Text> : null}
            {!loading && reports.length === 0 ? (
              <Text style={{ color: t.colors.text2 }}>{i18n.t('noReportsYet')}</Text>
            ) : null}
          </>
        }
        renderItem={({ item: r }) => {
          const label = r.houseLabel || `${i18n.t('report')} ${r.timestamp.slice(0, 10)}`;
          const pill = bandPill(r.outputs.scoreBand);
          return (
            <Pressable onPress={() => router.push({ pathname: '/result', params: { reportId: r.id } })}>
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: t.colors.text }]} numberOfLines={1}>
                      {label}
                    </Text>
                    <Text style={[styles.meta, { color: t.colors.text2 }]}>{r.timestamp.slice(0, 10)}</Text>
                    <View style={{ height: 10 }} />
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: pill.bg,
                      }}
                    >
                      <Text style={{ color: pill.text, fontWeight: '800' }}>
                        {r.outputs.score} - {i18n.t(r.outputs.scoreBand)}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDelete(r)} hitSlop={10}>
                    <Text style={{ fontSize: 22, color: t.colors.danger }}>🗑</Text>
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  meta: { fontSize: 14, fontWeight: '600' },
});
