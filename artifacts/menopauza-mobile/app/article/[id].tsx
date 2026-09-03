import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getGetArticleQueryKey, useGetArticle } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorState, formatDate, LoadingState, screenStyles, ScreenTopBar } from '@/components/MobilePrimitives';

export default function ArticleDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const article = useGetArticle(id, { query: { queryKey: getGetArticleQueryKey(id), enabled: Boolean(id) } });
  const [feedback, setFeedback] = useState('');

  if (article.isLoading) return <LoadingState label="Przygotowujemy artykuł…" />;
  if (article.isError || !article.data) return <ErrorState onRetry={() => void article.refetch()} />;

  const item = article.data;
  const paragraphs = item.content.split(/\n{2,}/).filter(Boolean);

  return (
    <ScrollView
      style={[screenStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[screenStyles.content, { paddingTop: insets.top + 18 }]}
    >
      <ScreenTopBar icon="arrow-left" onIconPress={() => router.back()} accessibilityLabel="Wróć do biblioteki" />
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
        <Feather name="arrow-left" size={15} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Wróć do biblioteki</Text>
      </Pressable>
      <Text style={[styles.meta, { color: colors.accentForeground }]}>{item.category} · {item.readTime} min czytania</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
      <Text style={[styles.excerpt, { color: colors.mutedForeground }]}>{item.excerpt}</Text>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {paragraphs.map((paragraph, index) => (
        <Text key={`${index}-${paragraph.slice(0, 12)}`} style={[styles.paragraph, { color: colors.foreground }]}>
          {paragraph}
        </Text>
      ))}
      <Text style={[styles.date, { color: colors.mutedForeground }]}>Dodano {formatDate(item.createdAt)}</Text>

      <View style={[styles.feedback, { backgroundColor: colors.secondary }]}>
        <View style={styles.feedbackTitle}>
          <Feather name="heart" size={17} color={colors.secondaryForeground} />
          <Text style={[styles.feedbackHeading, { color: colors.secondaryForeground }]}>Czy to było dla Ciebie pomocne?</Text>
        </View>
        {feedback ? (
          <Text style={[styles.feedbackMessage, { color: colors.secondaryForeground }]}>{feedback}</Text>
        ) : (
          <View style={styles.feedbackActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFeedback('Miło nam. Wracaj, kiedy będziesz potrzebować.')}
              style={[styles.feedbackButton, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.feedbackButtonText, { color: colors.foreground }]}>Tak, dziękuję</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFeedback('Dziękujemy za sygnał — będziemy rozwijać tę bibliotekę.')}
              style={styles.feedbackSecondary}
            >
              <Text style={[styles.feedbackSecondaryText, { color: colors.secondaryForeground }]}>Potrzebuję więcej</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backLink: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 27 },
  backText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  meta: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3, marginTop: 28, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 36, fontWeight: '600', letterSpacing: -1.4, lineHeight: 39, marginTop: 14 },
  excerpt: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, marginTop: 17 },
  divider: { height: 1, marginVertical: 27 },
  paragraph: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 25, marginBottom: 17 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  feedback: { borderRadius: 20, marginTop: 27, padding: 17 },
  feedbackTitle: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  feedbackHeading: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 13 },
  feedbackMessage: { fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 20, marginTop: 14 },
  feedbackActions: { gap: 8, marginTop: 14 },
  feedbackButton: { alignItems: 'center', borderRadius: 12, paddingVertical: 12 },
  feedbackButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  feedbackSecondary: { alignItems: 'center', paddingVertical: 9 },
  feedbackSecondaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});