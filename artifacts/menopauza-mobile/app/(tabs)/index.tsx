import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getGetDashboardQueryKey, getGetProfileQueryKey, useCreateSymptom, useGetDashboard, useGetProfile } from '@workspace/api-client-react';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const symptomOptions = ['Uderzenia gorąca', 'Sen', 'Nastrój', 'Energia'];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, user: savedUser, signOut } = useAuth();
  const profile = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), enabled: Boolean(token) } });
  const user = profile.data ?? savedUser;
  const userId = user?.id ?? 0;
  const dashboard = useGetDashboard(userId, { query: { queryKey: getGetDashboardQueryKey(userId), enabled: Boolean(userId) } });
  const createSymptom = useCreateSymptom();
  const [selectedSymptom, setSelectedSymptom] = useState(symptomOptions[0]);
  const [severity, setSeverity] = useState(5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile.isError && !savedUser) {
      Alert.alert('Sesja wygasła', 'Zaloguj się ponownie, żeby wrócić do swojej przestrzeni.', [
        { text: 'Zaloguj się', onPress: () => router.replace('/login') },
      ]);
    }
  }, [profile.isError, savedUser]);

  const saveSymptom = () => {
    if (!userId) return;
    createSymptom.mutate(
      { data: { userId, symptom: selectedSymptom, severity, date: new Date().toISOString() } },
      {
        onSuccess: () => {
          setSaved(true);
          void dashboard.refetch();
          setTimeout(() => setSaved(false), 2400);
        },
        onError: () => Alert.alert('Nie udało się zapisać', 'Spróbuj ponownie za chwilę.'),
      },
    );
  };

  const logout = async () => {
    await signOut();
    router.replace('/');
  };

  if (profile.isLoading && !user) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;

  const summary = dashboard.data;
  const latest = summary?.latestSymptoms ?? [];
  const today = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' }).format(new Date());

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 35, paddingTop: insets.top + 18 }}
      refreshControl={<RefreshControl refreshing={dashboard.isRefetching} onRefresh={() => void dashboard.refetch()} tintColor={colors.primary} />}
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <View style={styles.topbar}>
          <BrandMark />
          <Pressable accessibilityLabel="Wyloguj się" onPress={logout} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}>
            <Feather name="log-out" size={17} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Twoja przestrzeń</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Dzień dobry, {user?.firstName || 'Ty'}.</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{today}. Sprawdź, czego dziś potrzebujesz.</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.primaryForeground }]}>Mój dzień</Text>
            <Text style={[styles.datePill, { backgroundColor: '#4d806c', color: colors.primaryForeground }]}>{today}</Text>
          </View>
          <View style={[styles.feelingCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>JAK SIĘ DZIŚ CZUJESZ?</Text>
            <View style={styles.feelingRow}>
              <Text style={[styles.feeling, { color: colors.foreground }]}>Zatrzymaj się na chwilę</Text>
              <Feather name="sun" size={24} color={colors.secondaryForeground} />
            </View>
            <View style={[styles.progress, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { backgroundColor: colors.accent }]} /></View>
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>Twój rytm, nie ranking</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat icon="activity" value={summary ? summary.averageSeverity.toFixed(1) : '—'} label="średnia objawów" colors={colors} />
          <Stat icon="heart" value={summary ? String(summary.symptomsLogged) : '—'} label="zapisanych obserwacji" colors={colors} />
        </View>

        <Pressable onPress={() => router.push('/doctor-report')} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.reportIcon, { backgroundColor: colors.secondary }]}><Feather name="file-text" size={20} color={colors.primary} /></View>
          <View style={styles.reportCopy}><Text style={[styles.reportTitle, { color: colors.foreground }]}>Raport dla lekarza</Text><Text style={[styles.reportText, { color: colors.mutedForeground }]}>Kup lub przywróć raport PDF</Text></View>
          <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
        </Pressable>

        <View style={styles.sectionHeader}>
          <View><Text style={[styles.sectionEyebrow, { color: colors.accentForeground }]}>Dziennik</Text><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Jak jest dzisiaj?</Text></View>
          <Feather name="edit-3" size={20} color={colors.primary} />
        </View>
        <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.prompt, { color: colors.mutedForeground }]}>Wybierz, co chcesz zauważyć</Text>
          <View style={styles.chips}>
            {symptomOptions.map((option) => (
              <Pressable key={option} onPress={() => setSelectedSymptom(option)} style={[styles.chip, { backgroundColor: selectedSymptom === option ? colors.primary : colors.muted }]}>
                <Text style={[styles.chipText, { color: selectedSymptom === option ? colors.primaryForeground : colors.foreground }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.prompt, { color: colors.mutedForeground }]}>Nasilenie: <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold' }}>{severity}/10</Text></Text>
          <View style={styles.severityRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Pressable key={value} accessibilityLabel={`Nasilenie ${value}`} onPress={() => setSeverity(value)} style={[styles.severity, { backgroundColor: value <= severity ? colors.accent : colors.muted }]} />
            ))}
          </View>
          <PrimaryButton icon="check" loading={createSymptom.isPending} onPress={saveSymptom}>Zapisz obserwację</PrimaryButton>
          {saved && <Text style={[styles.saved, { color: colors.primary }]}>Zapisane. Dziękuję, że się zauważasz.</Text>}
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={[styles.sectionEyebrow, { color: colors.accentForeground }]}>Ostatnio</Text><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Twoje obserwacje</Text></View>
          <Feather name="activity" size={20} color={colors.primary} />
        </View>
        {latest.length ? latest.slice(0, 3).map((item) => (
          <View key={item.id} style={[styles.latestRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.latestDot, { backgroundColor: colors.accent }]} />
            <View style={styles.latestCopy}><Text style={[styles.latestName, { color: colors.foreground }]}>{item.symptom}</Text><Text style={[styles.latestDate, { color: colors.mutedForeground }]}>{new Date(item.date).toLocaleDateString('pl-PL')}</Text></View>
            <Text style={[styles.latestScore, { color: colors.primary }]}>{item.severity}/10</Text>
          </View>
        )) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>Pierwsza obserwacja może zacząć się właśnie dziś.</Text>}
      </View>
    </ScrollView>
  );
}

function Stat({ icon, value, label, colors }: { icon: keyof typeof Feather.glyphMap; value: string; label: string; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name={icon} size={18} color={colors.primary} /><Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  container: { paddingHorizontal: 22 },
  topbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  iconButton: { alignItems: 'center', borderRadius: 13, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  greeting: { marginTop: 39 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 33, fontWeight: '600', letterSpacing: -1.2, marginTop: 10 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 8 },
  heroCard: { borderRadius: 26, marginTop: 24, padding: 16 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  cardTitle: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '600' },
  datePill: { borderRadius: 99, fontFamily: 'Inter_500Medium', fontSize: 10, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6 },
  feelingCard: { borderRadius: 18, padding: 16 },
  smallLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  feelingRow: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between', marginTop: 12 },
  feeling: { flex: 1, fontFamily: 'Georgia', fontSize: 26, fontWeight: '600', letterSpacing: -0.7 },
  progress: { borderRadius: 99, height: 7, marginTop: 17, overflow: 'hidden' },
  progressFill: { borderRadius: 99, height: '100%', width: '62%' },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 7, textAlign: 'right' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: { borderRadius: 18, borderWidth: 1, flex: 1, padding: 14 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 24, marginTop: 11 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15, marginTop: 3 },
  reportCard: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 12, padding: 14 },
  reportIcon: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  reportCopy: { flex: 1 },
  reportTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  reportText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13, marginTop: 31 },
  sectionEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 25, fontWeight: '600', letterSpacing: -0.6, marginTop: 5 },
  logCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
  prompt: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 19 },
  chip: { borderRadius: 99, paddingHorizontal: 11, paddingVertical: 9 },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  severityRow: { flexDirection: 'row', gap: 5, marginBottom: 18 },
  severity: { borderRadius: 99, flex: 1, height: 22 },
  saved: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 12, textAlign: 'center' },
  latestRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 13 },
  latestDot: { borderRadius: 99, height: 10, marginRight: 12, width: 10 },
  latestCopy: { flex: 1 },
  latestName: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  latestDate: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  latestScore: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  empty: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, paddingBottom: 8 },
});
