import { Feather } from '@expo/vector-icons';
import {
  getGetProfileQueryKey,
  getListMessagesQueryKey,
  useCreateMessage,
  useGetProfile,
  useListMessages,
  type Message,
} from '@workspace/api-client-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

const teamInboxId = 0;

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { hydrated, token, user: savedUser } = useAuth();
  const profile = useGetProfile({
    query: {
      queryKey: getGetProfileQueryKey(),
      enabled: hydrated && Boolean(token),
    },
  });
  const user = profile.data ?? savedUser;
  const userId = user?.id ?? 0;
  const messages = useListMessages(userId, teamInboxId, {
    query: {
      queryKey: getListMessagesQueryKey(userId, teamInboxId),
      enabled: Boolean(userId),
      refetchInterval: 15_000,
    },
  });
  const sendMessage = useCreateMessage();
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState(false);

  const submit = () => {
    const value = text.trim();
    if (!value || !userId) return;
    setSendError(false);
    sendMessage.mutate(
      { data: { senderId: userId, recipientId: teamInboxId, content: value } },
      {
        onSuccess: () => {
          setText('');
          void queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(userId, teamInboxId) });
        },
        onError: () => setSendError(true),
      },
    );
  };

  if (!hydrated || (profile.isLoading && !user) || messages.isLoading) {
    return <LoadingState colors={colors} />;
  }

  if ((profile.isError && !user) || messages.isError) {
    return <ErrorState onRetry={() => { void profile.refetch(); void messages.refetch(); }} colors={colors} />;
  }

  const items = messages.data ?? [];

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={{ backgroundColor: colors.background, flex: 1 }}
    >
      <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
        <View style={styles.container}>
          <View style={styles.eyebrowRow}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Prywatnie</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>Wiadomości</Text>
            </View>
            <View style={[styles.lock, { backgroundColor: colors.secondary }]}>
              <Feather name="lock" size={17} color={colors.secondaryForeground} />
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Rozmowa z asystentem AI i zespołem, w Twoim tempie.
          </Text>

          <View style={[styles.contact, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
              <Feather name="heart" size={19} color={colors.primaryForeground} />
            </View>
            <View style={styles.contactCopy}>
              <Text style={[styles.contactTitle, { color: colors.foreground }]}>Zespół Menopauza + AI</Text>
              <View style={styles.onlineRow}>
                <View style={[styles.onlineDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>Wiadomość widzi również zespół</Text>
              </View>
            </View>
          </View>

          <View style={[styles.chat, { backgroundColor: colors.muted }]}>
            <FlatList
              contentContainerStyle={styles.chatContent}
              data={[...items].reverse()}
              inverted
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <View style={styles.emptyChat}>
                  <Feather name="message-circle" size={29} color={colors.primary} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Cisza też jest początkiem</Text>
                  <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                    Napisz pierwszą wiadomość, gdy będziesz gotowa.
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={messages.isRefetching}
                  onRefresh={() => void messages.refetch()}
                  tintColor={colors.primary}
                />
              }
              renderItem={({ item }) => <MessageBubble item={item} userId={userId} colors={colors} />}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
            <Feather name="info" size={14} color={colors.secondaryForeground} />
            <Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>
              AI nie zastępuje lekarza i może się mylić. W nagłej sytuacji skontaktuj się z lekarzem lub zadzwoń pod 112.
            </Text>
          </View>

          <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              accessibilityLabel="Treść wiadomości"
              editable={!sendMessage.isPending}
              multiline
              onChangeText={(value) => { setText(value); setSendError(false); }}
              onSubmitEditing={submit}
              placeholder="Napisz wiadomość…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.messageInput, { backgroundColor: colors.muted, color: colors.foreground }]}
              testID="input-message"
              value={text}
            />
            <Pressable
              accessibilityLabel="Wyślij wiadomość"
              accessibilityRole="button"
              disabled={sendMessage.isPending || !text.trim()}
              onPress={submit}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: colors.primary, opacity: sendMessage.isPending || !text.trim() ? 0.45 : pressed ? 0.8 : 1 },
              ]}
              testID="button-send-message"
            >
              {sendMessage.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Feather name="send" size={17} color={colors.primaryForeground} />
              )}
            </Pressable>
          </View>
          {sendError && (
            <Text style={[styles.status, { color: colors.accent }]} testID="status-message-error">
              Nie udało się wysłać wiadomości. Spróbuj ponownie.
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  item,
  userId,
  colors,
}: {
  item: Message;
  userId: number;
  colors: ReturnType<typeof useColors>;
}) {
  const mine = item.senderId === userId;
  const ai = item.senderId === teamInboxId && item.content.startsWith('[AI] ');
  const content = ai ? item.content.slice(5) : item.content;

  return (
    <View style={[styles.bubbleWrap, { alignItems: mine ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? colors.primary : colors.card,
            borderBottomRightRadius: mine ? 4 : 17,
            borderBottomLeftRadius: mine ? 17 : 4,
            borderColor: colors.border,
            borderWidth: mine ? 0 : 1,
          },
        ]}
      >
        {ai && <Text style={[styles.aiLabel, { color: colors.primary }]}>ODPOWIEDŹ AI</Text>}
        <Text style={[styles.bubbleText, { color: mine ? colors.primaryForeground : colors.foreground }]}>{content}</Text>
        <Text style={[styles.bubbleDate, { color: mine ? colors.primaryForeground : colors.mutedForeground }]}>
          {new Date(item.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function LoadingState({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
}

function ErrorState({ onRetry, colors }: { onRetry: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Feather name="wifi-off" size={26} color={colors.accent} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nie udało się otworzyć wiadomości</Text>
      <Pressable onPress={onRetry} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.publishText, { color: colors.primaryForeground }]}>Spróbuj ponownie</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 22 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  eyebrowRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 35, fontWeight: '600', letterSpacing: -1.2, marginTop: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 9 },
  lock: { alignItems: 'center', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  contact: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 20, padding: 13 },
  contactAvatar: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  contactCopy: { flex: 1 },
  contactTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  onlineRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 5 },
  onlineDot: { borderRadius: 99, height: 6, width: 6 },
  onlineText: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  chat: { borderRadius: 18, flex: 1, marginTop: 12, minHeight: 230, overflow: 'hidden' },
  chatContent: { flexGrow: 1, justifyContent: 'flex-end', padding: 13 },
  emptyChat: { alignItems: 'center', justifyContent: 'center', padding: 25, transform: [{ scaleY: -1 }] },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '600', marginTop: 11, textAlign: 'center' },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, marginTop: 6, textAlign: 'center' },
  bubbleWrap: { flexDirection: 'row', marginBottom: 9, width: '100%' },
  bubble: { maxWidth: '82%', borderRadius: 17, paddingHorizontal: 13, paddingVertical: 10 },
  aiLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, marginBottom: 5 },
  bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  bubbleDate: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 5, opacity: 0.65, textAlign: 'right' },
  notice: { alignItems: 'flex-start', borderRadius: 13, flexDirection: 'row', gap: 8, marginTop: 10, padding: 10 },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15 },
  composer: { alignItems: 'flex-end', borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 8, marginTop: 10, padding: 8 },
  messageInput: { borderRadius: 12, flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, maxHeight: 96, minHeight: 45, paddingHorizontal: 12, paddingTop: 12, textAlignVertical: 'top' },
  sendButton: { alignItems: 'center', borderRadius: 12, height: 45, justifyContent: 'center', width: 45 },
  status: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 7, textAlign: 'center' },
  retryButton: { borderRadius: 13, marginTop: 18, paddingHorizontal: 18, paddingVertical: 13 },
  publishText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});