import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function PrimaryButton({
  children,
  onPress,
  loading = false,
  disabled = false,
  icon = 'arrow-right',
  testID,
}: {
  children: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  testID?: string;
}) {
  const colors = useColors();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: inactive ? 0.55 : pressed ? 0.82 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.label, { color: colors.primaryForeground }]}>{children}</Text>}
      {!loading && <Feather name={icon} size={17} color={colors.primaryForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', gap: 10, justifyContent: 'center', minHeight: 54, paddingHorizontal: 20 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});