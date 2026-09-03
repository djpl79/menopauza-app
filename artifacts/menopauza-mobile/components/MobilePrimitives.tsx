import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { BrandMark } from '@/components/BrandMark';

export function ScreenTopBar({
  icon,
  onIconPress,
  accessibilityLabel,
}: {
  icon?: keyof typeof Feather.glyphMap;
  onIconPress?: () => void;
  accessibilityLabel?: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.topbar}>
      <BrandMark />
      {icon && onIconPress ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onPress={onIconPress}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Feather name={icon} size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.intro}>
      <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>{eyebrow}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  const colors = useColors();

  return (
    <View style={[styles.centerState, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const colors = useColors();

  return (
    <View style={[styles.centerState, { backgroundColor: colors.background, paddingHorizontal: 28 }]}>
      <Feather name="cloud-off" size={28} color={colors.accent} />
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>Nie udało się wczytać</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
        Coś po drodze się zgubiło. Spróbuj ponownie za chwilę.
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            { borderColor: colors.primary, opacity: pressed ? 0.65 : 1 },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.primary }]}>Spróbuj ponownie</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
}) {
  const colors = useColors();

  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={26} color={colors.primary} />
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat('pl-PL', includeTime
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export function Avatar({ name, size = 42 }: { name: string; size?: number }) {
  const colors = useColors();
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.avatar, { backgroundColor: colors.secondary, height: size, width: size }]}>
      <Text style={[styles.avatarText, { color: colors.secondaryForeground, fontSize: size * 0.28 }]}>
        {initials}
      </Text>
    </View>
  );
}

export const screenStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 112, paddingHorizontal: 22 },
  card: { borderRadius: 20, borderWidth: 1, padding: 17 },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  muted: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
});

const styles = StyleSheet.create({
  topbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  intro: { marginTop: 31 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 34, fontWeight: '600', letterSpacing: -1.2, marginTop: 9 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 9 },
  centerState: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 },
  stateTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  stateText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, maxWidth: 300, textAlign: 'center' },
  retryButton: { borderRadius: 12, borderWidth: 1, marginTop: 5, paddingHorizontal: 16, paddingVertical: 11 },
  retryText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  emptyState: { alignItems: 'center', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, padding: 28 },
  avatar: { alignItems: 'center', borderRadius: 99, justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold' },
});