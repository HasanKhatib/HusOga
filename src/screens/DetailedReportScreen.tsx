import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Report } from '../core/models/types';
import { getReport } from '../core/services/storage';
import { i18n } from '../i18n/translations';
import { Card, PageHeader, Screen, SectionTitle } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';

export default function DetailedReportScreen() {
  const t = useTheme();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (reportId) getReport(reportId).then(setReport);
  }, [reportId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('detailedReportTitle')} subtitle={report?.houseLabel || undefined} />
          <Card>
            <SectionTitle>{i18n.t('comingSoon')}</SectionTitle>
            <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22 }}>
              {i18n.t('detailedReportPlaceholder')}
            </Text>
          </Card>
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
