import { useMutation, useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type PurchasesPackage } from 'react-native-purchases';
import { useAuth } from '@/context/AuthContext';

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = 'doctor_report';
export const REVENUECAT_OFFERING_IDENTIFIER = 'doctor_report';
export const REVENUECAT_PRODUCT_IDENTIFIER = 'doctor_report_39_pln';
const customerId = (userId: number) => `menopauza-user-${userId}`;

let configured = false;

function getRevenueCatApiKey() {
  const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  if (__DEV__ || Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') return testKey;
  if (Platform.OS === 'ios') return iosKey;
  if (Platform.OS === 'android') return androidKey;
  return testKey;
}

export function initializeRevenueCat() {
  if (configured) return;
  const apiKey = getRevenueCatApiKey();
  if (!apiKey) throw new Error('Brakuje publicznego klucza RevenueCat.');
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });
  configured = true;
}

function useSubscriptionContext() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (userId) return;
    void Purchases.isAnonymous().then((anonymous) => {
      if (!anonymous) return Purchases.logOut();
    });
  }, [userId]);

  const identity = useQuery({
    queryKey: ['revenuecat', 'identity', userId],
    queryFn: () => Purchases.logIn(customerId(userId!)),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });
  const customerInfo = useQuery({
    queryKey: ['revenuecat', 'customer-info', userId],
    queryFn: () => Purchases.getCustomerInfo(),
    enabled: identity.isSuccess,
  });
  const offerings = useQuery({
    queryKey: ['revenuecat', 'offerings'],
    queryFn: () => Purchases.getOfferings(),
    staleTime: 5 * 60 * 1000,
  });
  const purchaseMutation = useMutation({
    mutationFn: (packageToPurchase: PurchasesPackage) =>
      Purchases.purchasePackage(packageToPurchase),
    onSuccess: () => customerInfo.refetch(),
  });
  const restoreMutation = useMutation({
    mutationFn: () => Purchases.restorePurchases(),
    onSuccess: () => customerInfo.refetch(),
  });

  return {
    customerInfo: customerInfo.data,
    offering: offerings.data?.all[REVENUECAT_OFFERING_IDENTIFIER] ?? offerings.data?.current,
    hasReport: Boolean(customerInfo.data?.entitlements.active[REVENUECAT_ENTITLEMENT_IDENTIFIER]),
    identityReady: identity.isSuccess,
    isLoading: identity.isLoading || customerInfo.isLoading || offerings.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContext();
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return value;
}