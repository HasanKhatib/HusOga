import { useMemo } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';

import { useTheme } from '../ui/ThemeProvider';
import { Card, PageHeader, Screen } from '../ui/components';
import { i18n } from '../i18n/translations';

function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function WebViewScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string; title?: string }>();

  const url = useMemo(() => {
    const raw = params.url ? decodeURIComponent(params.url) : '';
    return raw;
  }, [params.url]);

  const title = useMemo(() => {
    const raw = params.title ? decodeURIComponent(params.title) : '';
    return raw || i18n.t('sources');
  }, [params.title]);

  const safe = isSafeHttpUrl(url);

  async function openExternal() {
    if (!safe) {
      Alert.alert('', i18n.t('invalidLink'));
      return;
    }
    await Linking.openURL(url);
  }

  async function copyLink() {
    if (!safe) {
      Alert.alert('', i18n.t('invalidLink'));
      return;
    }
    await Clipboard.setStringAsync(url);
    Alert.alert('', i18n.t('linkCopied'));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: t.colors.bg },
          headerTitleStyle: { color: t.colors.text },
          headerTintColor: t.colors.text,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 14, paddingRight: 8 }}>
              <Pressable onPress={openExternal} hitSlop={10} accessibilityLabel={i18n.t('openInBrowser')}>
                <Ionicons name="open-outline" size={22} color={t.colors.text} />
              </Pressable>
              <Pressable onPress={copyLink} hitSlop={10} accessibilityLabel={i18n.t('copyLink')}>
                <Ionicons name="copy-outline" size={22} color={t.colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />

      {!safe ? (
        <ScrollView>
          <Screen>
            <PageHeader title={i18n.t('invalidLinkTitle')} subtitle={i18n.t('invalidLinkBody')} />
            <Card>
              <Text style={{ color: t.colors.text2, fontWeight: '700' }}>{url}</Text>
            </Card>
          </Screen>
        </ScrollView>
      ) : Platform.OS === 'web' ? (
        <ScrollView>
          <Screen>
            <PageHeader title={title} subtitle={i18n.t('webviewNotSupportedOnWeb')} />
            <Card>
              <Text style={{ color: t.colors.text2, fontWeight: '600', lineHeight: 22, marginBottom: 12 }}>
                {i18n.t('openInBrowser')}
              </Text>
              <Pressable
                onPress={openExternal}
                style={({ pressed }) => ({
                  alignSelf: 'flex-start',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  backgroundColor: t.colors.surface2,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: t.colors.text, fontWeight: '800' }}>{i18n.t('openInBrowser')}</Text>
              </Pressable>
            </Card>
          </Screen>
        </ScrollView>
      ) : (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: t.colors.bg }}
          startInLoadingState
          setSupportMultipleWindows={false}
          originWhitelist={['http://*', 'https://*']}
        />
      )}
    </SafeAreaView>
  );
}
