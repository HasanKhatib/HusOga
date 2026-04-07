import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { getReport, saveReport } from '../src/core/services/storage';
import { computeRisk, MODEL_VERSION } from '../src/core/services/riskEngine';
import { validateNumeric, validateAddress } from '../src/core/validation';
import { i18n } from '../src/i18n/translations';
import type {
  Byggnadstyp, YttertakType, FasadType,
  Grundlaeggning, Uppvarmning, Ventilation, Report, HouseInputs,
} from '../src/core/models/types';

// ─── Picker helpers ───────────────────────────────────────────────────────────

function SegmentRow<T extends string>({
  label, options, value, onChange,
}: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.segmentRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, value === opt && styles.chipActive]}
              onPress={() => onChange(opt)}
            >
              <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>
                {i18n.t(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function NumberInput({ label, value, onChangeText, error, placeholder, optional }: {
  label: string; value: string; onChangeText: (v: string) => void;
  error?: string; placeholder?: string; optional?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}{optional ? <Text style={styles.optional}> ({i18n.t('other').toLowerCase()})</Text> : null}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FormScreen() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  const [loading, setLoading] = useState(!!reportId);
  const [existingId, setExistingId] = useState<string | null>(null);

  const [address, setAddress] = useState('');
  const [byggnadstyp, setByggnadstyp] = useState<Byggnadstyp>('enplanshus');
  const [byggnadsar, setByggnadsar] = useState('');
  const [size, setSize] = useState('');
  const [grundlaeggning, setGrundlaeggning] = useState<Grundlaeggning>('betongplatta');
  const [yttertakType, setYttertakType] = useState<YttertakType>('betongpannor');
  const [yttertakAge, setYttertakAge] = useState('');
  const [fasadType, setFasadType] = useState<FasadType>('tegel');
  const [fasadAge, setFasadAge] = useState('');
  const [uppvarmning, setUppvarmning] = useState<Uppvarmning>('bergvarme');
  const [ventilation, setVentilation] = useState<Ventilation>('ftxMekanisk');
  const [draneringAge, setDraneringAge] = useState('');
  const [vatrumAge, setVatrumAge] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reportId) return;
    getReport(reportId).then((r) => {
      if (!r) { Alert.alert('', i18n.t('reportNotFound')); router.back(); return; }
      const i = r.inputs;
      setExistingId(r.id);
      setAddress(r.houseLabel);
      setByggnadstyp(i.byggnadstyp);
      setByggnadsar(String(i.byggnadsar));
      setSize(String(i.size));
      setGrundlaeggning(i.grundlaeggning);
      setYttertakType(i.yttertakType);
      setYttertakAge(String(i.yttertakAge));
      setFasadType(i.fasadType);
      setFasadAge(String(i.fasadAge));
      setUppvarmning(i.uppvarmning);
      setVentilation(i.ventilation);
      if (i.draneringAge != null) setDraneringAge(String(i.draneringAge));
      if (i.vatrumAge != null) setVatrumAge(String(i.vatrumAge));
      setLoading(false);
    });
  }, [reportId]);

  // Auto-save with debounce when editing an existing report
  function scheduleAutoSave() {
    if (!existingId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void autoSave(); }, 500);
  }

  async function autoSave() {
    const numErrors = validateNumeric({
      byggnadsar: byggnadsar ? Number(byggnadsar) : null,
      size: size ? Number(size) : null,
      yttertakAge: yttertakAge ? Number(yttertakAge) : null,
      fasadAge: fasadAge ? Number(fasadAge) : null,
      draneringAge: draneringAge ? Number(draneringAge) : undefined,
      vatrumAge: vatrumAge ? Number(vatrumAge) : undefined,
    });
    if (Object.keys(numErrors).length > 0) return;
    if (!byggnadsar || !size || !yttertakAge || !fasadAge) return;
    await persist(existingId!);
  }

  async function persist(id: string): Promise<Report> {
    const inputs: HouseInputs = {
      byggnadstyp, byggnadsar: Number(byggnadsar), size: Number(size),
      grundlaeggning, yttertakType, yttertakAge: Number(yttertakAge),
      fasadType, fasadAge: Number(fasadAge), uppvarmning, ventilation,
      houseLabel: address.trim() || undefined,
      draneringAge: draneringAge ? Number(draneringAge) : undefined,
      vatrumAge: vatrumAge ? Number(vatrumAge) : undefined,
    };
    const outputs = computeRisk(inputs);
    const report: Report = {
      id, houseLabel: address.trim(),
      inputs, outputs,
      timestamp: new Date().toISOString(),
      modelVersion: MODEL_VERSION,
    };
    await saveReport(report);
    return report;
  }

  async function handleCalculate() {
    const numErrors = validateNumeric({
      byggnadsar: byggnadsar ? Number(byggnadsar) : null,
      size: size ? Number(size) : null,
      yttertakAge: yttertakAge ? Number(yttertakAge) : null,
      fasadAge: fasadAge ? Number(fasadAge) : null,
      draneringAge: draneringAge ? Number(draneringAge) : undefined,
      vatrumAge: vatrumAge ? Number(vatrumAge) : undefined,
    });
    const addrErr = validateAddress(address || null);
    if (addrErr) numErrors.address = addrErr;

    if (Object.keys(numErrors).length > 0) { setErrors(numErrors); return; }
    setErrors({});

    const id = existingId ?? uuidv4();
    setExistingId(id);
    const report = await persist(id);
    router.push({ pathname: '/result', params: { reportId: report.id } });
  }

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{i18n.t('address')}</Text>
          <TextInput
            style={[styles.input, errors.address ? styles.inputError : undefined]}
            value={address}
            onChangeText={(v) => { setAddress(v); scheduleAutoSave(); }}
            placeholder={i18n.t('addressHint')}
            placeholderTextColor="#bbb"
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
        </View>

        <SegmentRow
          label={i18n.t('buildingType')}
          options={['enplanshus', 'tvåplanshus', 'suterrang', 'parhus', 'kedjehus', 'radhus', 'other'] as Byggnadstyp[]}
          value={byggnadstyp}
          onChange={(v) => { setByggnadstyp(v); scheduleAutoSave(); }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <NumberInput label={i18n.t('buildYear')} value={byggnadsar}
              onChangeText={(v) => { setByggnadsar(v); scheduleAutoSave(); }}
              error={errors.byggnadsar} placeholder={i18n.t('buildYearHint')} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <NumberInput label={i18n.t('livingArea')} value={size}
              onChangeText={(v) => { setSize(v); scheduleAutoSave(); }}
              error={errors.size} placeholder={i18n.t('livingAreaHint')} />
          </View>
        </View>

        <SegmentRow
          label={i18n.t('foundation')}
          options={['betongplatta', 'krypgrund', 'kallare', 'suterrang', 'other'] as Grundlaeggning[]}
          value={grundlaeggning}
          onChange={(v) => { setGrundlaeggning(v); scheduleAutoSave(); }}
        />

        <SegmentRow
          label={i18n.t('roofType')}
          options={['takpapp', 'gummiduk', 'betongpannor', 'tegeltak', 'plattak', 'other'] as YttertakType[]}
          value={yttertakType}
          onChange={(v) => { setYttertakType(v); scheduleAutoSave(); }}
        />

        <NumberInput label={i18n.t('roofAge')} value={yttertakAge}
          onChangeText={(v) => { setYttertakAge(v); scheduleAutoSave(); }}
          error={errors.yttertakAge} />

        <SegmentRow
          label={i18n.t('facadeType')}
          options={['tegel', 'tra', 'puts', 'blandad'] as FasadType[]}
          value={fasadType}
          onChange={(v) => { setFasadType(v); scheduleAutoSave(); }}
        />

        <NumberInput label={i18n.t('facadeAge')} value={fasadAge}
          onChangeText={(v) => { setFasadAge(v); scheduleAutoSave(); }}
          error={errors.fasadAge} />

        <SegmentRow
          label={i18n.t('heating')}
          options={['bergvarme', 'luftvarmepump', 'fjärrvärme', 'direktverkandeEl', 'pellets', 'ved', 'olja', 'other'] as Uppvarmning[]}
          value={uppvarmning}
          onChange={(v) => { setUppvarmning(v); scheduleAutoSave(); }}
        />

        <SegmentRow
          label={i18n.t('ventilation')}
          options={['ftxMekanisk', 'fMekanisk', 'sjalvdrag'] as Ventilation[]}
          value={ventilation}
          onChange={(v) => { setVentilation(v); scheduleAutoSave(); }}
        />

        {/* Optional fields */}
        <NumberInput label={i18n.t('drainageAge')} value={draneringAge}
          onChangeText={(v) => { setDraneringAge(v); scheduleAutoSave(); }}
          error={errors.draneringAge} optional />

        <NumberInput label={i18n.t('wetRoomsAge')} value={vatrumAge}
          onChangeText={(v) => { setVatrumAge(v); scheduleAutoSave(); }}
          error={errors.vatrumAge} optional />

        <TouchableOpacity style={styles.calculateBtn} onPress={handleCalculate}>
          <Text style={styles.calculateText}>🔍 {i18n.t('calculate')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, gap: 4, paddingBottom: 40 },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { fontWeight: '400', color: '#aaa', textTransform: 'none' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1a1a2e' },
  inputError: { borderColor: '#c0392b' },
  errorText: { color: '#c0392b', fontSize: 12, marginTop: 4 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  chipActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  calculateBtn: { marginTop: 20, backgroundColor: '#1a1a2e', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  calculateText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
