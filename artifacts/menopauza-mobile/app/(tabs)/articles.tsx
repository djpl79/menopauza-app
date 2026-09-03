import { Feather } from '@expo/vector-icons';
import {
  getGetArticleQueryKey,
  useGetArticle,
  useListArticles,
  type Article,
} from '@workspace/api-client-react';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

export default function ArticlesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const articles = useListArticles();
  const [filter, setFilter] = useState('Wszystko');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const items = articles.data ?? [];
  const categories = ['Wszystko', ...Array.from(new Set(items.map((article) => article.category)))];
  const filtered = useMemo(
    () =>
      items.filter(
        (article) =>
          (filter === 'Wszystko' || article.category === filter) &&
          `${article.title} ${article.excerpt}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [filter, items, query],
  );

  if (selectedId !== null) {
    return <ArticleDetail articleId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  if (articles.isLoading) {
    return <LoadingState label="Otwieramy bibliotekę wiedzy…" colors={colors} />;
  }

  if (articles.isError) {
    return <ErrorState onRetry={() => void articles.refetch()} colors={colors} />;
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingTop: insets.top + 20 }}
      refreshControl={
        <RefreshControl
          refreshing={articles.isRefetching}
          onRefresh={() => void articles.refetch()}
          tintColor={colors.primary}
        />
      }
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.eyebrowRow}>
          <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>Biblioteka</Text>
          <Feather name="book-open" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Wiedza, która wspiera</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Rzetelne materiały, do których możesz wracać wtedy, kiedy ich potrzebujesz.
        </Text>

        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Szukaj w artykułach"
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Szukaj w artykułach…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            testID="input-search-articles"
            value={query}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {categories.map((category) => {
            const active = category === filter;
            return (
              <Pressable
                accessibilityRole="button"
                key={category}
                onPress={() => setFilter(category)}
                style={[
                  styles.filter,
                  { backgroundColor: active ? colors.primary : colors.muted },
                ]}
                testID={`button-filter-${category}`}
              >
                <Text style={[styles.filterText, { color: active ? colors.primaryForeground : colors.foreground }]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.length ? (
          filtered.map((article, index) => (
            <ArticleCard
              article={article}
              colors={colors}
              featured={index === 0}
              key={article.id}
              onPress={() => setSelectedId(article.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="search"
            title="Nie znaleziono artykułu"
            body="Spróbuj innego hasła albo wróć do wszystkich kategorii."
            colors={colors}
          />
        )}
      </View>
    </ScrollView>
  );
}

function ArticleDetail({ articleId, onBack }: { articleId: number; onBack: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const article = useGetArticle(articleId, {
    query: { queryKey: getGetArticleQueryKey(articleId) },
  });

  if (article.isLoading) {
    return <LoadingState label="Przygotowujemy artykuł…" colors={colors} />;
  }

  if (article.isError || !article.data) {
    return <ErrorState onRetry={() => void article.refetch()} colors={colors} />;
  }

  const item = article.data;
  const paragraphs = item.content.split(/\n+/).filter(Boolean);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 30, paddingTop: insets.top + 20 }}
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton} testID="button-back-article">
          <Feather name="arrow-left" size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Wróć do biblioteki</Text>
        </Pressable>
        <View style={styles.articleMeta}>
          <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>{item.category}</Text>
          <Text style={[styles.readTime, { color: colors.mutedForeground }]}>
            {item.readTime} min czytania
          </Text>
        </View>
        <Text style={[styles.detailTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.detailExcerpt, { color: colors.mutedForeground }]}>{item.excerpt}</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {paragraphs.map((paragraph, index) => (
          <Text key={`${paragraph}-${index}`} style={[styles.paragraph, { color: colors.foreground }]}>
            {paragraph}
          </Text>
        ))}
        <View style={[styles.supportCard, { backgroundColor: colors.secondary }]}>
          <Feather name="heart" size={19} color={colors.secondaryForeground} />
          <View style={styles.supportCopy}>
            <Text style={[styles.supportTitle, { color: colors.secondaryForeground }]}>Czy to było dla Ciebie pomocne?</Text>
            <Text style={[styles.supportBody, { color: colors.secondaryForeground }]}>
              Wróć do tego materiału, kiedy będziesz tego potrzebować.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ArticleCard({
  article,
  colors,
  featured,
  onPress,
}: {
  article: Article;
  colors: ReturnType<typeof useColors>;
  featured: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.articleCard,
        {
          backgroundColor: featured ? colors.primary : colors.card,
          borderColor: featured ? colors.primary : colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
      testID={`card-article-${article.id}`}
    >
      <View style={styles.cardTopline}>
        <Text
          style={[
            styles.category,
            {
              backgroundColor: featured ? colors.accent : colors.muted,
              color: featured ? colors.primaryForeground : colors.mutedForeground,
            },
          ]}
        >
          {article.category}
        </Text>
        <View style={styles.readTimeRow}>
          <Feather name="clock" size={13} color={featured ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.readTime, { color: featured ? colors.primaryForeground : colors.mutedForeground }]}>
            {article.readTime} min
          </Text>
        </View>
      </View>
      <Text style={[styles.cardTitle, { color: featured ? colors.primaryForeground : colors.foreground }]}>
        {article.title}
      </Text>
      <Text style={[styles.cardExcerpt, { color: featured ? colors.primaryForeground : colors.mutedForeground }]}>
        {article.excerpt}
      </Text>
      <View style={styles.readMore}>
        <Text style={[styles.readMoreText, { color: featured ? colors.secondary : colors.primary }]}>Czytaj artykuł</Text>
        <Feather name="arrow-right" size={16} color={featured ? colors.secondary : colors.primary} />
      </View>
    </Pressable>
  );
}

function LoadingState({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function ErrorState({ onRetry, colors }: { onRetry: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Feather name="wifi-off" size={26} color={colors.accent} />
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>Nie udało się otworzyć biblioteki</Text>
      <Pressable onPress={onRetry} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Spróbuj ponownie</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({
  icon,
  title,
  body,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.empty, { backgroundColor: colors.muted }]}>
      <Feather name={icon} size={25} color={colors.primary} />
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 22 },
  centered: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  eyebrowRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 34, fontWeight: '600', letterSpacing: -1.2, marginTop: 10 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 9 },
  search: { alignItems: 'center', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 24, minHeight: 52, paddingHorizontal: 15 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, minHeight: 50 },
  filterScroll: { marginBottom: 19, marginTop: 13 },
  filter: { borderRadius: 99, marginRight: 8, paddingHorizontal: 13, paddingVertical: 9 },
  filterText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  articleCard: { borderRadius: 20, borderWidth: 1, marginBottom: 12, padding: 17 },
  cardTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  category: { borderRadius: 99, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6, textTransform: 'uppercase' },
  readTimeRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  readTime: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  cardTitle: { fontFamily: 'Georgia', fontSize: 25, fontWeight: '600', letterSpacing: -0.6, lineHeight: 30, marginTop: 21 },
  cardExcerpt: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8 },
  readMore: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 19 },
  readMoreText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  backButton: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 28 },
  backText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  articleMeta: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  detailTitle: { fontFamily: 'Georgia', fontSize: 36, fontWeight: '600', letterSpacing: -1.3, lineHeight: 39, marginTop: 15 },
  detailExcerpt: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 25, marginTop: 16 },
  divider: { height: 1, marginVertical: 25 },
  paragraph: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 26, marginBottom: 17 },
  supportCard: { alignItems: 'flex-start', borderRadius: 18, flexDirection: 'row', gap: 12, marginTop: 15, padding: 16 },
  supportCopy: { flex: 1 },
  supportTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  supportBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 5 },
  stateTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  stateText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 7, textAlign: 'center' },
  retryButton: { borderRadius: 14, marginTop: 18, paddingHorizontal: 18, paddingVertical: 13 },
  retryText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  empty: { alignItems: 'center', borderRadius: 18, marginTop: 5, padding: 24 },
});