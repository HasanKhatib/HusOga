import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from './ThemeProvider';

export function Screen({
  children,
  padding = true,
}: {
  children: React.ReactNode;
  padding?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.colors.bg }, padding && { padding: t.space.xl }]}>
      {children}
    </View>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: t.space.xl }}>
      <Text style={[t.text.h1, { color: t.colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[t.text.body, { color: t.colors.text2, marginTop: 6 }]}>{subtitle}</Text>
      ) : null}
      <View
        style={{
          height: 1,
          backgroundColor: t.colors.border,
          marginTop: t.space.l,
        }}
      />
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.l,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: t.space.l,
        },
        t.shadow,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Text style={[t.text.h2, { color: t.colors.text, marginBottom: t.space.m }]}>
      {children}
    </Text>
  );
}

export function Banner({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.colors.bannerBg,
        borderRadius: t.radius.m,
        padding: t.space.l,
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Text style={[t.text.body, { color: t.colors.bannerText, lineHeight: 22 }]}>{text}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? t.colors.border : t.colors.brand,
          borderRadius: 18,
          paddingVertical: 18,
          alignItems: 'center',
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Text style={{ color: t.colors.brandOn, fontWeight: '800', fontSize: 18 }}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: t.space.l }}>
      <Text style={[t.text.label, { color: t.colors.text2, marginBottom: t.space.s }]}>
        {label.toUpperCase()}
      </Text>
      {children}
      {error ? (
        <Text style={{ color: t.colors.danger, marginTop: 6, fontSize: 12, fontWeight: '600' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  hasError,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  hasError?: boolean;
}) {
  const t = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor={t.isDark ? '#607089' : '#9AA4B2'}
      style={{
        backgroundColor: t.colors.surface2,
        borderWidth: 1,
        borderColor: hasError ? t.colors.danger : t.colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: Platform.select({ ios: 14, android: 12, default: 12 }),
        fontSize: 18,
        color: t.colors.text,
      }}
    />
  );
}

export function SelectField<T extends string>({
  value,
  items,
  onChange,
  placeholder,
  hasError,
}: {
  value: T;
  items: { label: string; value: T }[];
  onChange: (v: T) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const t = useTheme();
  const [open, setOpen] = React.useState(false);
  const selected = items.find((i) => i.value === value);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          {
            backgroundColor: t.colors.surface2,
            borderWidth: 1,
            borderColor: hasError ? t.colors.danger : t.colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: selected ? t.colors.text : t.colors.text2,
          }}
        >
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Text style={{ color: t.colors.text2, fontSize: 18, fontWeight: '900' }}>⌄</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: t.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
            padding: t.space.xl,
            justifyContent: 'center',
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: t.colors.surface,
              borderRadius: t.radius.l,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: t.space.l,
              maxHeight: '80%',
            }}
          >
            <FlatList
              data={items}
              keyExtractor={(it) => it.value}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: t.colors.border }} />}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={{
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: '700' }}>
                      {item.label}
                    </Text>
                    {isSelected ? <Text style={{ color: t.colors.ok, fontSize: 18, fontWeight: '900' }}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
