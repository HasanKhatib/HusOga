import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { canCreateReport } from '../../src/core/services/purchase';
import { listReports } from '../../src/core/services/storage';
import { i18n } from '../../src/i18n/translations';
import FormScreen from '../../src/screens/FormScreen';

export default function NewTab() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const reports = await listReports();
        const ok = await canCreateReport(reports.length);
        if (cancelled) return;
        if (!ok) {
          Alert.alert('', i18n.t('deleteToAddAnother'));
          router.replace('/');
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [router])
  );

  // Render the form directly so the tab never shows a blank page.
  return <FormScreen />;
}
