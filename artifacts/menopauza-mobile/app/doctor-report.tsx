import { Feather } from '@expo/vector-icons';
import {
  downloadDoctorReport,
  getGetLatestReportPurchaseQueryKey,
  useGetLatestReportPurchase,
  useSyncRevenueCatReportPurchase,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColors } from '@/hooks/useColors';
import { REVENUECAT_PRODUCT_IDENTIFIER, useSubscription } from '@/lib/revenuecat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DoctorReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const subscription = useSubscription();
  const latest = useGetLatestReportPurchase({ query: { queryKey: getGetLatestReportPurchaseQueryKey(), retry: false } });
  const sync = useSyncRevenueCatReportPurchase();
  const [confirming, setConfirming] = useState(false);
  const packageToPurchase = subscription.offering?.availablePackages.find(
    (item) => item.product.identifier === REVENUECAT_PRODUCT_IDENTIFIER,
  );
  const price = packageToPurchase?.product.priceString;
  const paidPurchase = !latest.isError && latest.data?.status === 'paid' ? latest.data : undefined;

  useFocusEffect(
    useCallback(() => {
      void latest.refetch();
    }, [latest.refetch]),
  );

  const confirmOnServer = async () => {
    await sync.mutateAsync();
    await queryClient.invalidateQueries({ queryKey: getGetLatestReportPurchaseQueryKey() });
  };

  const purchase = async () => {
    if (!packageToPurchase) return;
    setConfirming(false);
    try {
      await subscription.purchase(packageToPurchase);
      await confirmOnServer();
      Alert.alert('Raport odblokowany', 'Zakup został potwierdzony na Twoim koncie.');
    } catch (error: unknown) {
      const cancelled = typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled;
      if (!cancelled) Alert.alert('Nie udało się kupić raportu', 'Spróbuj ponownie za chwilę.');
    }
  };

  const restore = async () => {
    try {
      await subscription.restore();
      await confirmOnServer();
      Alert.alert('Zakup przywrócony', 'Raport jest znów dostępny na Twoim koncie.');
    } catch {
      Alert.alert('Nie znaleziono zakupu', 'Upewnij się, że używasz tego samego konta sklepu.');
    }
  };

  const download = async () => {
    if (!paidPurchase) return;
    try {
      const blob = await downloadDoctorReport(paidPurchase.id);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.readAsDataURL(blob);
      });
      const path = `${FileSystem.cacheDirectory}raport-menopauza-${paidPurchase.id}.pdf`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Zapisz raport dla lekarza' });
      } else {
        Alert.alert('Raport pobrany', `Plik zapisano jako ${path}.`);
      }
    } catch {
      Alert.alert('Nie udało się pobrać raportu', 'Sprawdź połączenie i spróbuj ponownie.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingTop: insets.top + 16 }} style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={20} color={colors.foreground} /><Text style={[styles.backText, { color: colors.foreground }]}>Wróć</Text></Pressable>
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Dla lekarza</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Raport z ostatniego miesiąca</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>Uporządkowane objawy i obserwacje w prywatnym pliku PDF.</Text>
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <Feather name={paidPurchase ? 'check-circle' : 'file-text'} size={32} color="#fff" />
          <Text style={styles.cardTitle}>{paidPurchase ? 'Twój raport jest gotowy.' : 'Kup jednorazowy dostęp.'}</Text>
          <Text style={styles.cardText}>{paidPurchase ? 'PDF jest przypisany do Twojego konta.' : `Bez subskrypcji. ${price ? `Cena: ${price}.` : 'Cena zostanie pokazana przez sklep.'}`}</Text>
          {subscription.isLoading || latest.isLoading ? <ActivityIndicator color="#fff" style={styles.loader} /> : paidPurchase ? (
            <PrimaryButton onPress={download}>Pobierz raport PDF</PrimaryButton>
          ) : (
            <PrimaryButton onPress={() => setConfirming(true)} disabled={!packageToPurchase || !subscription.identityReady || subscription.isPurchasing} loading={subscription.isPurchasing}>{`Kup raport ${price ?? ''}`.trim()}</PrimaryButton>
          )}
          {!paidPurchase && <Pressable onPress={restore} disabled={subscription.isRestoring} style={styles.restore}><Text style={styles.restoreText}>{subscription.isRestoring ? 'Przywracamy…' : 'Przywróć zakup'}</Text></Pressable>}
        </View>
      </View>
      <Modal transparent animationType="fade" visible={confirming} onRequestClose={() => setConfirming(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Potwierdź zakup</Text>
          <Text style={[styles.modalText, { color: colors.mutedForeground }]}>Sklep pobierze {price ?? 'cenę widoczną w sklepie'} za jednorazowy raport.</Text>
          <PrimaryButton onPress={purchase}>Przejdź do płatności</PrimaryButton>
          <Pressable onPress={() => setConfirming(false)} style={styles.cancel}><Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Anuluj</Text></Pressable>
        </View></View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 22 },
  back: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, marginTop: 36, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 36, fontWeight: '600', letterSpacing: -1.2, lineHeight: 41, marginTop: 10 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 12 },
  card: { borderRadius: 26, marginTop: 28, padding: 22 },
  cardTitle: { color: '#fff', fontFamily: 'Georgia', fontSize: 28, fontWeight: '600', marginTop: 22 },
  cardText: { color: 'rgba(255,255,255,.78)', fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginBottom: 24, marginTop: 10 },
  loader: { marginVertical: 18 },
  restore: { alignItems: 'center', padding: 14 },
  restoreText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13, textDecorationLine: 'underline' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,.45)', flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 24, padding: 22, width: '100%' },
  modalTitle: { fontFamily: 'Georgia', fontSize: 27, fontWeight: '600' },
  modalText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginBottom: 22, marginTop: 10 },
  cancel: { alignItems: 'center', paddingTop: 16 },
  cancelText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});