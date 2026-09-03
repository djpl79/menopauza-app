import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useRegister } from '@workspace/api-client-react';

export default function RegisterScreen() {
  const colors = useColors();
  const { saveSession } = useAuth();
  const register = useRegister();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
  const update = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    register.mutate(
      { data: form },
      {
        onSuccess: async (response) => {
          await saveSession(response.token, response.user);
          router.replace('/(tabs)');
        },
        onError: () => Alert.alert('Nie udało się utworzyć konta', 'Sprawdź formularz i spróbuj ponownie.'),
      },
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      bottomOffset={80}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.topbar}><Feather name="arrow-left" size={21} color={colors.foreground} onPress={() => router.back()} /><BrandMark /></View>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Zacznij łagodnie</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Stwórz swoją przestrzeń.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Kilka danych i możesz zacząć zauważać siebie.</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.row}>
          <Field label="Imię" value={form.firstName} onChangeText={update('firstName')} placeholder="Anna" colors={colors} />
          <Field label="Nazwisko" value={form.lastName} onChangeText={update('lastName')} placeholder="Kowalska" colors={colors} />
        </View>
        <Field label="Nazwa użytkowniczki" value={form.username} onChangeText={update('username')} placeholder="anna_k" autoCapitalize="none" colors={colors} />
        <Field label="Adres e-mail" value={form.email} onChangeText={update('email')} placeholder="ty@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
        <Field label="Hasło" value={form.password} onChangeText={update('password')} placeholder="Minimum 6 znaków" secureTextEntry colors={colors} />
        <PrimaryButton onPress={submit} loading={register.isPending} disabled={Object.values(form).some((value) => !value.trim())}>Utwórz konto</PrimaryButton>
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.bottomText, { color: colors.mutedForeground }]}>Masz już konto?</Text>
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/login')}>Zaloguj się</Text>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function Field({ label, colors, ...props }: { label: string; colors: ReturnType<typeof useColors> } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 24, paddingHorizontal: 24, paddingTop: 24 },
  topbar: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  heading: { marginTop: 47 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 35, fontWeight: '600', letterSpacing: -1.4, marginTop: 11 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 12 },
  form: { gap: 16, marginTop: 30 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  input: { borderRadius: 14, borderWidth: 1, fontFamily: 'Inter_400Regular', fontSize: 14, minHeight: 53, paddingHorizontal: 14 },
  bottom: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 'auto', paddingTop: 30 },
  bottomText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  link: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});