import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useListForumPosts } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, formatDate, LoadingState, screenStyles, ScreenTopBar } from '@/components/MobilePrimitives';

export default function ForumPostDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const posts = useListForumPosts();
  const post = posts.data?.find((item) => item.id === id);

  if (posts.isLoading) return <LoadingState label="Otwieramy rozmowę…" />;
  if (posts.isError) return <ErrorState onRetry={() => void posts.refetch()} />;
  if (!post) return <EmptyState icon="message-circle" title="Nie znaleziono wpisu" body="Ten wpis mógł zostać usunięty albo nie jest już dostępny." />;

  return (
    <ScrollView style={[screenStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[screenStyles.content, { paddingTop: insets.top + 18 }]}>
      <ScreenTopBar icon="arrow-left" onIconPress={() => router.back()} accessibilityLabel="Wróć do społeczności" />
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
        <Feather name="arrow-left" size={15} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Wróć do społeczności</Text>
      </Pressable>
      <Text style={[styles.meta, { color: colors.accentForeground }]}>{post.authorName} · {formatDate(post.createdAt)}</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{post.title}</Text>
      <Text style={[styles.body, { color: colors.foreground }]}>{post.content}</Text>
      <Text style={[styles.stats, { color: colors.mutedForeground }]}>
        {post.views} wyświetleń  ·  {post.replies} odpowiedzi
      </Text>
      <EmptyState icon="heart" title="To miejsce na Twoją historię" body="Chcesz odpowiedzieć? Wróć do społeczności i rozpocznij własną rozmowę." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backLink: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 27 },
  backText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  meta: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, marginTop: 28, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 34, fontWeight: '600', letterSpacing: -1.2, lineHeight: 39, marginTop: 14 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 26, marginTop: 24 },
  stats: { fontFamily: 'Inter_500Medium', fontSize: 11, marginTop: 22 },
});