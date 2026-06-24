import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/src/theme";
import { useColors } from "@/src/theme/ThemeContext";
import { Pressable, StyleSheet, View } from "react-native";

export type NewsArticle = {
  id: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string;
  season: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function NewsCard({ article, onPress }: { article: NewsArticle; onPress: () => void }) {
  const c = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.bgCard, borderColor: c.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={styles.meta}>
        <Text style={[styles.date, { color: c.textMuted }]}>
          {formatDate(article.publishedAt)}
        </Text>
        {article.tags ? (
          <View style={[styles.tagBadge, { backgroundColor: c.accentBg }]}>
            <Text style={[styles.tagText, { color: c.accent }]}>{article.tags}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: c.textPrimary }]} numberOfLines={2}>
        {article.title}
      </Text>

      <Text style={[styles.excerpt, { color: c.textSecondary }]} numberOfLines={3}>
        {article.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.authorRow}>
          <Ionicons name="person-outline" size={12} color={c.textMuted} />
          <Text style={[styles.author, { color: c.textMuted }]}>{article.author}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    width: "100%",
    alignSelf: "center",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: "500",
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  author: {
    fontSize: 11,
    fontWeight: "500",
  },
});
