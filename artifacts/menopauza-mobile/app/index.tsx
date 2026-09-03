import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hydrated, token } = useAuth();

  if (!hydrated) {
    return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (token) return <Redirect href="/(tabs)" />;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <BrandMark />
        <View style={[styles.status, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={13} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>prywatnie</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={[styles.eyebrow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="sun" size={14} color={colors.primary} />
          <Text style={[styles.eyebrowText, { color: colors.primary }]}>Twoja spokojniejsza codzienność</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Zauważaj</Text>
        <Text style={[styles.titleAccent, { color: colors.accent }]}>siebie.</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Menopauza to zmiana, nie diagnoza. Znajdź własny rytm dzięki uważnemu śledzeniu objawów, wiedzy i rozmowom bez oceniania.
        </Text>
      </View>

      <View style={[styles.preview, { backgroundColor: colors.primary }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewTitle, { color: colors.primaryForeground }]}>Mój dzień</Text>
          <Text style={[styles.previewDate, { color: colors.primaryForeground, backgroundColor: '#4d806c' }]}>dzisiaj</Text>
        </View>
        <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>JAK SIĘ DZIŚ CZUJESZ?</Text>
          <Text style={[styles.previewFeeling, { color: colors.foreground }]}>Dobrze, dziękuję</Text>
          <View style={[styles.progress, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { backgroundColor: colors.accent }]} /></View>
          <Text style={[styles.previewCaption, { color: colors.mutedForeground }]}>Twój rytm, nie ranking</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton onPress={() => router.push('/register')}>Zacznij po swojemu</PrimaryButton>
        <Pressable accessibilityRole="button" onPress={() => router.push('/login')} style={({ pressed }) => [styles.loginLink, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.loginText, { color: colors.primary }]}>Mam już konto</Text>
          <Feather name="log-in" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  screen: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  status: { alignItems: 'center', borderRadius: 99, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  hero: { paddingTop: 50 },
  eyebrow: { alignSelf: 'flex-start', borderRadius: 99, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 11, paddingVertical: 7 },
  eyebrowText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  title: { fontFamily: 'Georgia', fontSize: 53, fontWeight: '600', letterSpacing: -2.8, lineHeight: 54, marginTop: 26 },
  titleAccent: { fontFamily: 'Georgia', fontSize: 53, fontStyle: 'italic', letterSpacing: -2.8, lineHeight: 54 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 25, marginTop: 22 },
  preview: { borderRadius: 27, marginTop: 28, padding: 17, transform: [{ rotate: '1deg' }] },
  previewHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 17 },
  previewTitle: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '600' },
  previewDate: { borderRadius: 99, fontFamily: 'Inter_500Medium', fontSize: 11, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6 },
  previewCard: { borderRadius: 18, padding: 17 },
  previewLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  previewFeeling: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '600', letterSpacing: -1, marginTop: 13 },
  progress: { borderRadius: 99, height: 7, marginTop: 17, overflow: 'hidden' },
  progressFill: { borderRadius: 99, height: '100%', width: '62%' },
  previewCaption: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 7, textAlign: 'right' },
  actions: { gap: 13, marginTop: 22 },
  loginLink: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 8, padding: 8 },
  loginText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});