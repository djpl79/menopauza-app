import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getGetDashboardQueryKey,
  getGetProfileQueryKey,
  getListNotificationsQueryKey,
  useGetProfile,
  useListNotifications,
  useMarkNotificationRead,
  type Notification,
} from '@workspace/api-client-react';
import { EmptyState, ErrorState, formatDate, LoadingState, PageIntro, ScreenTopBar, screenStyles } from '@/components/MobilePrimitives';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { token, user: savedUser } = useAuth();
  const profile = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), enabled: Boolean(token) } });
  const user = profile.data ?? savedUser;
  const userId = user?.id ?? 0;
  const notifications = useListNotifications(userId, { query: { queryKey: getListNotificationsQueryKey(userId), enabled: Boolean(userId) } });
  const markRead = useMarkNotificationRead();
  const items = notifications.data ?? [];

  const read = (notification: Notification) => {
    if (notification.read || markRead.isPending) return;
    markRead.mutate(
      { id: notification.id },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData<Notification[]>(
            getListNotificationsQueryKey(userId),
            (current) => current?.map((item) => item.id === updated.id ? updated : item) ?? [],
          );
          void queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey(userId) });
        },
      },
    );
  };

  if ((profile.isLoading && !user) || notifications.isLoading) return <LoadingState label="Sprawdzamy, co u Ciebie…" />;
  if (notifications.isError) return <ErrorState onRetry={() => void notifications.refetch()} />;

  return (
    <ScrollView
      style={[screenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[screenStyles.content, { paddingTop: insets.top + 18 }]}
      refreshControl={<RefreshControl refreshing={notifications.isRefetching} onRefresh={() => void notifications.refetch()} tintColor={colors.primary} />}
    >
      <ScreenTopBar />
      <PageIntro
        eyebrow="Dla Ciebie"
        title="Powiadomienia"
        description="Ważne rzeczy, spokojnie i bez nadmiaru hałasu. Dotknij wiadomości, aby oznaczyć ją jako przeczytaną."
      />

      <View style={styles.summary}>
        <Text style={[styles.summaryNumber, { color: colors.primary }]}>{items.filter((item) => !item.read).length}</Text>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>nieprzeczytane</Text>
      </View>

      {items.length ? items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.read ? 'Przeczytane' : 'Nieprzeczytane'} powiadomienie: ${item.title}`}
          onPress={() => read(item)}
          testID={`button-notification-${item.id}`}
          style={({ pressed }) => [
            styles.notification,
            {
              backgroundColor: item.read ? colors.card : colors.secondary,
              borderColor: item.read ? colors.border : colors.secondary,
              opacity: pressed ? 0.78 : 1,
            },
          ]}
        >
          <View style={[styles.icon, { backgroundColor: item.read ? colors.muted : colors.card }]}>
            <Feather name={notificationIcon(item.type)} size={17} color={colors.primary} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
              {!item.read ? <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} /> : null}
            </View>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>{item.body}</Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(item.createdAt, true)}</Text>
          </View>
        </Pressable>
      )) : (
        <EmptyState icon="check-circle" title="Jesteś na bieżąco" body="Nie ma tu nic, co domagałoby się Twojej uwagi. To dobry znak." />
      )}
    </ScrollView>
  );
}

function notificationIcon(type: string): keyof typeof Feather.glyphMap {
  if (type === 'article') return 'book-open';
  if (type === 'community') return 'users';
  return 'heart';
}

const styles = StyleSheet.create({
  summary: { alignItems: 'baseline', flexDirection: 'row', gap: 7, marginBottom: 8, marginTop: 25 },
  summaryNumber: { fontFamily: 'Georgia', fontSize: 30, fontWeight: '600' },
  summaryText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  notification: { alignItems: 'flex-start', borderRadius: 19, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 10, padding: 15 },
  icon: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  copy: { flex: 1 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  title: { flex: 1, fontFamily: 'Georgia', fontSize: 19, fontWeight: '600', lineHeight: 22 },
  unreadDot: { borderRadius: 99, height: 8, marginTop: 7, width: 8 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 6 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 9 },
});