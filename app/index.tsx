import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listReports, deleteReport } from '../src/core/services/storage';
import { canCreateReport } from '../src/core/services/purchase';
import { i18n } from '../src/i18n/translations';
import type { Report } from '../src/core/models/types';

export default function ReportListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listReports();
    setReports(list);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleCreate() {
    const ok = await canCreateReport(reports.length);
    if (!ok) {
      Alert.alert('', i18n.t('deleteToAddAnother'));
      return;
    }
    router.push('/form');
  }

  async function handleDelete(report: Report) {
    const label = report.houseLabel || i18n.t('report');
    Alert.alert(
      i18n.t('deleteReportTitle'),
      i18n.t('removeReport', { label }),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteReport(report.id);
            load();
          },
        },
      ]
    );
  }

  const bandColor = (band: string) => {
    if (band === 'high') return '#c0392b';
    if (band === 'medium') return '#e67e22';
    return '#27ae60';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>HusÖga</Text>
          <Text style={styles.slogan}>{i18n.t('appSlogan')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* List or empty state */}
      {loading ? (
        <View style={styles.center}><Text>…</Text></View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>{i18n.t('noReportsYet')}</Text>
          <Text style={styles.emptyBody}>{i18n.t('createFirstAssessment')}</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: r }) => {
            const label = r.houseLabel || `${i18n.t('report')} ${r.timestamp.slice(0, 10)}`;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/form', params: { reportId: r.id } })}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.cardLabel} numberOfLines={1}>{label}</Text>
                  <Text style={styles.cardMeta}>{r.timestamp.slice(0, 10)}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.scoreBadge, { backgroundColor: bandColor(r.outputs.scoreBand) }]}>
                    {r.outputs.score}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(r)} hitSlop={8}>
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={handleCreate}>
        <Text style={styles.fabText}>＋ {i18n.t('createReport')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerLeft: { flex: 1 },
  appName: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  slogan: { fontSize: 13, color: '#888', marginTop: 2 },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 6 },
  emptyBody: { fontSize: 14, color: '#888', textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardLeft: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  cardMeta: { fontSize: 12, color: '#aaa', marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreBadge: { color: '#fff', fontWeight: '700', fontSize: 15, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  deleteIcon: { fontSize: 18 },
  fab: { margin: 20, backgroundColor: '#1a1a2e', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
