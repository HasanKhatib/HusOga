import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Report } from '../models/types';

const REPORTS_KEY = '@husoga:reports';

async function loadAll(): Promise<Record<string, Report>> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, Report>;
}

async function saveAll(map: Record<string, Report>): Promise<void> {
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(map));
}

export async function saveReport(report: Report): Promise<void> {
  const map = await loadAll();
  map[report.id] = report;
  await saveAll(map);
}

export async function getReport(id: string): Promise<Report | null> {
  const map = await loadAll();
  return map[id] ?? null;
}

export async function listReports(): Promise<Report[]> {
  const map = await loadAll();
  return Object.values(map).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function deleteReport(id: string): Promise<void> {
  const map = await loadAll();
  delete map[id];
  await saveAll(map);
}
