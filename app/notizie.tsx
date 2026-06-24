import { API_URL } from "@/src/config/api";
import { Text } from "@/src/theme";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NewsArticle } from "@/src/components/NewsCard";

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NotizieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/news/${id}`);
      if (res.ok) setArticle(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: c.bgCard }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={c.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Notizia</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : !article ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textMuted }]}>Notizia non trovata</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {article.tags ? (
            <View style={[styles.tagBadge, { backgroundColor: c.accentBg }]}>
              <Text style={[styles.tagText, { color: c.accent }]}>{article.tags}</Text>
            </View>
          ) : null}

          <Text style={[styles.title, { color: c.textPrimary }]}>{article.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={c.textMuted} />
            <Text style={[styles.metaText, { color: c.textMuted }]}>
              {formatDateLong(article.publishedAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={c.textMuted} />
            <Text style={[styles.metaText, { color: c.textMuted }]}>
              {article.author}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <Text style={[styles.content, { color: c.textSecondary }]}>
            {article.content}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: { fontSize: 15, fontWeight: "500" },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tagBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
  },
});
