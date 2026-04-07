import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import type {
  Byggnadstyp,
  FasadType,
  Grundlaeggning,
  HouseInputs,
  Report,
  Uppvarmning,
  Ventilation,
  YttertakType,
} from '../core/models/types';
import { getReport, saveReport } from '../core/services/storage';
import { computeRisk, MODEL_VERSION } from '../core/services/riskEngine';
import { validateAddress, validateNumeric } from '../core/validation';
import { i18n } from '../i18n/translations';
import { Card, Field, Input, PageHeader, PrimaryButton, Screen, SectionTitle, SelectField } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';

export default function FormScreen() {
  const t = useTheme();
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
      if (!r) {
        Alert.alert('', i18n.t('reportNotFound'));
        router.back();
        return;
      }
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
  }, [reportId, router]);

  function scheduleAutoSave() {
    if (!existingId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void autoSave();
    }, 500);
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
      byggnadstyp,
      byggnadsar: Number(byggnadsar),
      size: Number(size),
      grundlaeggning,
      yttertakType,
      yttertakAge: Number(yttertakAge),
      fasadType,
      fasadAge: Number(fasadAge),
      uppvarmning,
      ventilation,
      houseLabel: address.trim() || undefined,
      draneringAge: draneringAge ? Number(draneringAge) : undefined,
      vatrumAge: vatrumAge ? Number(vatrumAge) : undefined,
    };
    const outputs = computeRisk(inputs);
    const report: Report = {
      id,
      houseLabel: address.trim(),
      inputs,
      outputs,
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

    if (Object.keys(numErrors).length > 0) {
      setErrors(numErrors);
      return;
    }

    setErrors({});
    const id = existingId ?? uuidv4();
    setExistingId(id);
    const report = await persist(id);
    router.push({ pathname: '/result', params: { reportId: report.id } });
  }

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('houseData')} />

          <Card>
            <Field label={i18n.t('address')} error={errors.address}>
              <Input
                value={address}
                onChangeText={(v) => {
                  setAddress(v);
                  scheduleAutoSave();
                }}
                placeholder={i18n.t('addressHint')}
                hasError={!!errors.address}
              />
            </Field>

            <SectionTitle>{i18n.t('requiredFields') ?? 'Required Fields'}</SectionTitle>

            <Field label={i18n.t('buildingType')} error={errors.byggnadstyp}>
              <SelectField
                value={byggnadstyp}
                onChange={(v) => {
                  setByggnadstyp(v);
                  scheduleAutoSave();
                }}
                items={([
                  'enplanshus',
                  'tvåplanshus',
                  'suterrang',
                  'parhus',
                  'kedjehus',
                  'radhus',
                  'other',
                ] as Byggnadstyp[]).map((v) => ({ label: i18n.t(v), value: v }))}
              />
            </Field>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label={i18n.t('buildYear')} error={errors.byggnadsar}>
                  <Input
                    value={byggnadsar}
                    onChangeText={(v) => {
                      setByggnadsar(v);
                      scheduleAutoSave();
                    }}
                    placeholder={i18n.t('buildYearHint')}
                    keyboardType="numeric"
                    hasError={!!errors.byggnadsar}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label={i18n.t('livingArea')} error={errors.size}>
                  <Input
                    value={size}
                    onChangeText={(v) => {
                      setSize(v);
                      scheduleAutoSave();
                    }}
                    placeholder={i18n.t('livingAreaHint')}
                    keyboardType="numeric"
                    hasError={!!errors.size}
                  />
                </Field>
              </View>
            </View>

            <Field label={i18n.t('foundation')}>
              <SelectField
                value={grundlaeggning}
                onChange={(v) => {
                  setGrundlaeggning(v);
                  scheduleAutoSave();
                }}
                items={([
                  'betongplatta',
                  'krypgrund',
                  'kallare',
                  'suterrang',
                  'other',
                ] as Grundlaeggning[]).map((v) => ({ label: i18n.t(v), value: v }))}
              />
            </Field>

            <Field label={i18n.t('roofType')}>
              <SelectField
                value={yttertakType}
                onChange={(v) => {
                  setYttertakType(v);
                  scheduleAutoSave();
                }}
                items={([
                  'takpapp',
                  'gummiduk',
                  'betongpannor',
                  'tegeltak',
                  'plattak',
                  'other',
                ] as YttertakType[]).map((v) => ({ label: i18n.t(v), value: v }))}
              />
            </Field>

            <Field label={i18n.t('roofAge')} error={errors.yttertakAge}>
              <Input
                value={yttertakAge}
                onChangeText={(v) => {
                  setYttertakAge(v);
                  scheduleAutoSave();
                }}
                keyboardType="numeric"
                hasError={!!errors.yttertakAge}
              />
            </Field>

            <Field label={i18n.t('facadeType')}>
              <SelectField
                value={fasadType}
                onChange={(v) => {
                  setFasadType(v);
                  scheduleAutoSave();
                }}
                items={(['tegel', 'tra', 'puts', 'blandad'] as FasadType[]).map((v) => ({
                  label: i18n.t(v),
                  value: v,
                }))}
              />
            </Field>

            <Field label={i18n.t('facadeAge')} error={errors.fasadAge}>
              <Input
                value={fasadAge}
                onChangeText={(v) => {
                  setFasadAge(v);
                  scheduleAutoSave();
                }}
                keyboardType="numeric"
                hasError={!!errors.fasadAge}
              />
            </Field>

            <Field label={i18n.t('heating')}>
              <SelectField
                value={uppvarmning}
                onChange={(v) => {
                  setUppvarmning(v);
                  scheduleAutoSave();
                }}
                items={([
                  'bergvarme',
                  'luftvarmepump',
                  'fjärrvärme',
                  'direktverkandeEl',
                  'pellets',
                  'ved',
                  'olja',
                  'other',
                ] as Uppvarmning[]).map((v) => ({ label: i18n.t(v), value: v }))}
              />
            </Field>

            <Field label={i18n.t('ventilation')}>
              <SelectField
                value={ventilation}
                onChange={(v) => {
                  setVentilation(v);
                  scheduleAutoSave();
                }}
                items={(['ftxMekanisk', 'fMekanisk', 'sjalvdrag'] as Ventilation[]).map((v) => ({
                  label: i18n.t(v),
                  value: v,
                }))}
              />
            </Field>

            <SectionTitle>{i18n.t('optionalFields') ?? 'Optional Fields'}</SectionTitle>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label={i18n.t('drainageAge')} error={errors.draneringAge}>
                  <Input
                    value={draneringAge}
                    onChangeText={(v) => {
                      setDraneringAge(v);
                      scheduleAutoSave();
                    }}
                    keyboardType="numeric"
                    hasError={!!errors.draneringAge}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label={i18n.t('wetRoomsAge')} error={errors.vatrumAge}>
                  <Input
                    value={vatrumAge}
                    onChangeText={(v) => {
                      setVatrumAge(v);
                      scheduleAutoSave();
                    }}
                    keyboardType="numeric"
                    hasError={!!errors.vatrumAge}
                  />
                </Field>
              </View>
            </View>

            <PrimaryButton label={i18n.t('calculateRisk') ?? i18n.t('calculate')} onPress={handleCalculate} />
          </Card>
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
