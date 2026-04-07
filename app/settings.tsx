import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../src/context/SettingsContext';
import { i18n } from '../src/i18n/translations';

const isDev = __DEV__;

export default function SettingsScreen() {
  const { settings, setLocale, isDevUnlocked, setDevUnlock } = useSettings();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{i18n.t('language')}</Text>
        <TouchableOpacity
          style={[styles.row, settings.locale === 'sv' && styles.rowActive]}
          onPress={() => setLocale('sv')}
        >
          <Text style={styles.rowText}>{i18n.t('languageSwedish')}</Text>
          {settings.locale === 'sv' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.row, settings.locale === 'en' && styles.rowActive]}
          onPress={() => setLocale('en')}
        >
          <Text style={styles.rowText}>{i18n.t('languageEnglish')}</Text>
          {settings.locale === 'en' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      </View>

      {isDev && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>{i18n.t('devUnlock')}</Text>
            <Switch value={isDevUnlocked} onValueChange={setDevUnlock} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', borderRadius: 14, margin: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, padding: 16, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  rowActive: { backgroundColor: '#f0f7ff' },
  rowText: { fontSize: 16, color: '#1a1a2e' },
  check: { fontSize: 16, color: '#1a1a2e', fontWeight: '700' },
});
