import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SOURCES, TOPIC_ORDER, type Source, type SourceTopic } from '../core/data/sources';
import { i18n } from '../i18n/translations';
import { Card, PageHeader, Screen, SectionTitle } from '../ui/components';
import { useTheme } from '../ui/ThemeProvider';

function topicLabel(topic: SourceTopic): string {
  if (topic === 'lifespans') return i18n.t('topicLifespans');
  if (topic === 'ventilation_moisture') return i18n.t('topicVentilationMoisture');
  if (topic === 'maintenance_cost') return i18n.t('topicMaintenanceCost');
  return i18n.t('topicSwedishGuidance');
}

export default function SourcesScreen() {
  const t = useTheme();
  const router = useRouter();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView>
        <Screen>
          <PageHeader title={i18n.t('sources')} subtitle={i18n.t('sourcesIntro')} />

          {TOPIC_ORDER.map((topic) => {
            const items = grouped.get(topic) ?? [];
            if (items.length === 0) return null;
            return (
              <View key={topic} style={{ marginBottom: t.space.xl }}>
                <Card>
                  <SectionTitle>{topicLabel(topic)}</SectionTitle>
                  {items.map((s, idx) => (
                    <View key={s.id}>
                      <Pressable
                        onPress={() => {
                          router.push({
                            pathname: '/webview',
                            params: {
                              title: encodeURIComponent(s.title),
                              url: encodeURIComponent(s.url),
                            },
                          });
                        }}
                        style={({ pressed }) => ({
                          paddingVertical: 12,
                          opacity: pressed ? 0.85 : 1,
                        })}
                      >
                        <Text style={{ color: t.colors.text, fontWeight: '900', fontSize: 16 }}>
                          {s.title}
                        </Text>
                        <Text style={{ color: t.colors.text2, fontWeight: '700', marginTop: 2 }}>
                          {s.publisher}
                        </Text>
                        <Text style={{ color: t.colors.text2, fontWeight: '600', marginTop: 6, lineHeight: 20 }}>
                          {s.summary}
                        </Text>
                      </Pressable>
                      {idx < items.length - 1 ? (
                        <View style={{ height: 1, backgroundColor: t.colors.border }} />
                      ) : null}
                    </View>
                  ))}
                </Card>
              </View>
            );
          })}
        </Screen>
      </ScrollView>
    </SafeAreaView>
  );
}
