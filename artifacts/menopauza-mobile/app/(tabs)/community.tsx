import { Feather } from '@expo/vector-icons';
import {
  getGetProfileQueryKey,
  getListForumPostsQueryKey,
  useCreateForumPost,
  useGetProfile,
  useListForumPosts,
  type ForumPost,
} from '@workspace/api-client-react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommunityScreen() {
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
  const posts = useListForumPosts();
  const createPost = useCreateForumPost();
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  const submit = () => {
    const userId = user?.id;
    if (!userId || title.trim().length < 3 || !content.trim()) return;
    createPost.mutate(
      { data: { userId, title: title.trim(), content: content.trim() } },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setComposerOpen(false);
          void queryClient.invalidateQueries({ queryKey: getListForumPostsQueryKey() });
        },
        onError: () => Alert.alert('Nie udało się opublikować', 'Spróbuj ponownie za chwilę.'),
      },
    );
  };

  if (!hydrated || (profile.isLoading && !user) || posts.isLoading) {
    return <LoadingState colors={colors} />;
  }

  if ((profile.isError && !user) || posts.isError) {
    return <ErrorState onRetry={() => { void profile.refetch(); void posts.refetch(); }} colors={colors} />;
  }

  const items = posts.data ?? [];

  return (
    <KeyboardAwareScrollViewCompat
      bottomOffset={90}
      contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingTop: insets.top + 20 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={posts.isRefetching}
          onRefresh={() => void posts.refetch()}
          tintColor={colors.primary}
        />
      }
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Razem raźniej</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Społeczność</Text>
          </View>
          <Pressable
            accessibilityLabel="Rozpocznij nową rozmowę"
            accessibilityRole="button"
            onPress={() => setComposerOpen((open) => !open)}
            style={({ pressed }) => [
              styles.newButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            testID="button-new-post"
          >
            <Feather name={isComposerOpen ? 'x' : 'plus'} size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Pytaj, dziel się i czytaj historie kobiet, które też uczą się swojego nowego rytmu.
        </Text>

        {isComposerOpen && (
          <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[styles.composerTitle, { color: colors.foreground }]}>Rozpocznij rozmowę</Text>
            <TextInput
              accessibilityLabel="Tytuł rozmowy"
              maxLength={120}
              onChangeText={setTitle}
              placeholder="O czym chcesz porozmawiać?"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]}
              testID="input-post-title"
              value={title}
            />
            <TextInput
              accessibilityLabel="Treść rozmowy"
              multiline
              onChangeText={setContent}
              placeholder="Napisz kilka słów…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, styles.textarea, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]}
              testID="input-post-content"
              value={content}
            />
            <Pressable
              accessibilityRole="button"
              disabled={createPost.isPending || title.trim().length < 3 || !content.trim()}
              onPress={submit}
              style={[
                styles.publishButton,
                { backgroundColor: colors.primary, opacity: createPost.isPending || title.trim().length < 3 || !content.trim() ? 0.45 : 1 },
              ]}
              testID="button-submit-post"
            >
              {createPost.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text style={[styles.publishText, { color: colors.primaryForeground }]}>Opublikuj</Text>
                  <Feather name="send" size={16} color={colors.primaryForeground} />
                </>
              )}
            </Pressable>
          </View>
        )}

        {items.length ? (
          items.map((post) => (
            <PostCard colors={colors} key={post.id} onPress={() => setSelectedPost(post)} post={post} />
          ))
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.muted }]}>
            <Feather name="users" size={27} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Pierwsza rozmowa czeka</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Zadaj pytanie albo podziel się tym, co dziś jest dla Ciebie ważne.
            </Text>
          </View>
        )}
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function PostCard({
  post,
  colors,
  onPress,
}: {
  post: ForumPost;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.postCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
      ]}
      testID={`card-forum-post-${post.id}`}
    >
      <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
          {post.authorName.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.postCopy}>
        <View style={styles.postTitleRow}>
          <Text style={[styles.postTitle, { color: colors.foreground }]}>{post.title}</Text>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
          {post.authorName} · {formatDate(post.createdAt)}
        </Text>
        <Text numberOfLines={2} style={[styles.postContent, { color: colors.mutedForeground }]}>
          {post.content}
        </Text>
        <View style={styles.postStats}>
          <Feather name="message-circle" size={14} color={colors.mutedForeground} />
          <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{post.replies} odpowiedzi</Text>
          <Feather name="eye" size={14} color={colors.mutedForeground} />
          <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{post.views} wyświetleń</Text>
        </View>
      </View>
    </Pressable>
  );
}

function PostDetail({ post, onBack }: { post: ForumPost; onBack: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingTop: insets.top + 20 }}
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton} testID="button-back-community">
          <Feather name="arrow-left" size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Wróć do społeczności</Text>
        </Pressable>
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Rozmowa społeczności</Text>
        <Text style={[styles.detailTitle, { color: colors.foreground }]}>{post.title}</Text>
        <Text style={[styles.postMeta, { color: colors.mutedForeground }]}>
          {post.authorName} · {formatDate(post.createdAt)}
        </Text>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.detailContent, { color: colors.foreground }]}>{post.content}</Text>
          <View style={[styles.detailStats, { borderTopColor: colors.border }]}>
            <Feather name="message-circle" size={16} color={colors.mutedForeground} />
            <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{post.replies} odpowiedzi</Text>
            <Feather name="eye" size={16} color={colors.mutedForeground} />
            <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{post.views} wyświetleń</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function LoadingState({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.centered, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
}

function ErrorState({ onRetry, colors }: { onRetry: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Feather name="wifi-off" size={26} color={colors.accent} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nie udało się otworzyć społeczności</Text>
      <Pressable onPress={onRetry} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.publishText, { color: colors.primaryForeground }]}>Spróbuj ponownie</Text>
      </Pressable>
    </View>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 22 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headingCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 35, fontWeight: '600', letterSpacing: -1.2, marginTop: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 9 },
  newButton: { alignItems: 'center', borderRadius: 15, height: 48, justifyContent: 'center', marginLeft: 14, width: 48 },
  composer: { borderRadius: 19, borderWidth: 1, marginTop: 23, padding: 16 },
  composerTitle: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '600', marginBottom: 14 },
  input: { borderRadius: 13, borderWidth: 1, fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 10, minHeight: 50, paddingHorizontal: 14 },
  textarea: { minHeight: 110, paddingTop: 14, textAlignVertical: 'top' },
  publishButton: { alignItems: 'center', borderRadius: 13, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 48, marginTop: 2 },
  publishText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  postCard: { borderRadius: 19, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 12, padding: 15 },
  avatar: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  postCopy: { flex: 1, minWidth: 0 },
  postTitleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  postTitle: { flex: 1, fontFamily: 'Georgia', fontSize: 19, fontWeight: '600', lineHeight: 23 },
  postMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  postContent: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 12 },
  postStats: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 15 },
  postStatText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginRight: 8 },
  empty: { alignItems: 'center', borderRadius: 19, marginTop: 17, padding: 25 },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 7, textAlign: 'center' },
  backButton: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 27 },
  backText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  detailTitle: { fontFamily: 'Georgia', fontSize: 35, fontWeight: '600', letterSpacing: -1.2, lineHeight: 39, marginTop: 15 },
  detailCard: { borderRadius: 19, borderWidth: 1, marginTop: 24, padding: 18 },
  detailContent: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 26 },
  detailStats: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', gap: 5, marginTop: 24, paddingTop: 15 },
  retryButton: { borderRadius: 13, marginTop: 18, paddingHorizontal: 18, paddingVertical: 13 },
});