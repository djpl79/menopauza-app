import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark } from '@/components/BrandMark';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useLogin } from '@workspace/api-client-react';

export default function LoginScreen() {
  const colors = useColors();
  const { saveSession } = useAuth();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    login.mutate(
      { data: { email: email.trim(), password } },
      {
        onSuccess: async (response) => {
          await saveSession(response.token, response.user);
          router.replace('/(tabs)');
        },
        onError: () => Alert.alert('Nie udało się zalogować', 'Sprawdź adres e-mail i hasło, a następnie spróbuj ponownie.'),
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
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Witaj ponownie</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Dobrze Cię widzieć.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Zaloguj się, żeby wrócić do swojej przestrzeni.</Text>
      </View>
      <View style={styles.form}>
        <Field label="Adres e-mail" value={email} onChangeText={setEmail} placeholder="ty@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} testID="input-login-email" />
        <Field label="Hasło" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry colors={colors} testID="input-login-password" />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Twoje dane są prywatne i służą tylko Tobie.</Text>
        <PrimaryButton onPress={submit} loading={login.isPending} disabled={!email.trim() || !password} testID="button-login">Zaloguj się</PrimaryButton>
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.bottomText, { color: colors.mutedForeground }]}>Nie masz jeszcze konta?</Text>
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push('/register')}>Załóż je tutaj</Text>
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
  heading: { marginTop: 64 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 36, fontWeight: '600', letterSpacing: -1.4, marginTop: 11 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 12 },
  form: { gap: 17, marginTop: 34 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  input: { borderRadius: 14, borderWidth: 1, fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 54, paddingHorizontal: 16 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginBottom: 3 },
  bottom: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 'auto', paddingTop: 34 },
  bottomText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  link: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});