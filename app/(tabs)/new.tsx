import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { canCreateReport } from '../../src/core/services/purchase';
import { listReports } from '../../src/core/services/storage';
import { i18n } from '../../src/i18n/translations';

export default function NewTab() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const reports = await listReports();
      const ok = await canCreateReport(reports.length);
      if (!ok) {
        Alert.alert('', i18n.t('deleteToAddAnother'));
        router.replace('/');
        return;
      }
      // Jump straight into the form when the middle tab is selected.
      router.replace('/form');
    })();
  }, [router]);

  return null;
}
