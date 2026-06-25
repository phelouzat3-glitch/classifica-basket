import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSeason } from "@/src/context/LeagueContext";

type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  type: "match_result" | "news" | "standings" | "admin" | "general";
  linkRoute: string | null;
  isRead: boolean;
  season: string | null;
  createdAt: string;
};

type NewsArticle = {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  season: string;
};

const TYPE_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  match_result: { icon: "basketball", color: "#E8600A", label: "Risultato" },
  news: { icon: "newspaper", color: "#3B82F6", label: "Notizia" },
  standings: { icon: "trophy", color: "#22C55E", label: "Classifica" },
  admin: { icon: "megaphone", color: "#8B5CF6", label: "Comunicazione" },
  general: { icon: "notifications", color: "#94A3B8", label: "Notifica" },
};

function dedupeMatchResults(items: NotificationItem[]): NotificationItem[] {
  const seen = new Set<string>();
  return items.filter((n) => {
    if (n.type === "match_result" && n.body) {
      const key = n.body;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  });
}

export default function NotificheScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const season = useSeason();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const baseSeason = season.includes("-") ? season.split("-").slice(0, 2).join("-") : season;
      const newsSeasons = season === baseSeason ? [season] : [season, baseSeason];
      const newsPromises = newsSeasons.map(
        (s) => s ? fetch(`${API_URL}/news?season=${encodeURIComponent(s)}`) : fetch(`${API_URL}/news`)
      );
      const [notifRes, ...newsResps] = await Promise.all([
        fetch(`${API_URL}/notifications?season=${encodeURIComponent(season)}`),
        ...newsPromises,
      ]);
      const notifs: NotificationItem[] = notifRes.ok ? await notifRes.json() : [];
      const allNewsResults: NewsArticle[] = [];
      for (const r of newsResps) {
        if (r.ok) {
          const articles: NewsArticle[] = await r.json();
          allNewsResults.push(...articles);
        }
      }
      const seenNewsIds = new Set<number>();
      const uniqueNews = allNewsResults.filter((a) => {
        if (seenNewsIds.has(a.id)) return false;
        seenNewsIds.add(a.id);
        return true;
      });
      const newsItems: NotificationItem[] = uniqueNews.map((a) => ({
        id: a.id + 100000,
        title: a.title,
        body: a.content,
        type: "news" as const,
        linkRoute: `/notizie?id=${a.id}`,
        isRead: true,
        season: a.season,
        createdAt: a.publishedAt,
      }));
      const merged = [...notifs, ...newsItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(dedupeMatchResults(merged));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [season]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await fetch(`${API_URL}/notifications/${id}/read`, {
          method: "PATCH",
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      } catch (e) {
        console.error(e);
      }
    },
    [],
  );

  const handlePress = useCallback(
    (n: NotificationItem) => {
      markAsRead(n.id);
      if (n.linkRoute) {
        router.push(n.linkRoute as any);
      } else {
        markAsRead(n.id);
      }
    },
    [router, markAsRead],
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Poco fa";
    if (hours < 24) return `${hours}h fa`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}g fa`;
    return d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
  };

  const { results, news } = useMemo(() => {
    const r: NotificationItem[] = [];
    const n: NotificationItem[] = [];
    for (const item of notifications) {
      if (item.type === "news") n.push(item);
      else r.push(item);
    }
    return { results: r, news: n };
  }, [notifications]);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: c.bg, paddingTop: insets.top },
      ]}
    >
      <StatusBar style="light" />

      <View style={[styles.headerBar, { backgroundColor: c.bg }]}>
        <Pressable
          style={[styles.backBtn, { backgroundColor: c.bgCard }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={c.accent} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
          Notifiche
        </Text>
        <View style={{ flex: 1 }} />
        <View style={{ width: 36 }} />
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={48} color={c.textMuted} />
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Nessuna notifica
          </Text>
          <Text style={[styles.emptySub, { color: c.textMuted }]}>
            Le notifiche appariranno qui quando ci saranno novità
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={c.accent}
              colors={[c.accent]}
            />
          }
        >
          {results.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
                Risultati
              </Text>
              {results.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                return (
                  <Pressable
                    key={n.id}
                    style={({ pressed }) => [
                      styles.card,
                      { backgroundColor: n.isRead ? c.bg : c.bgCard, borderColor: c.border },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handlePress(n)}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: cfg.color + "18", borderColor: cfg.color + "30" },
                      ]}
                    >
                      <Ionicons
                        name={cfg.icon}
                        size={18}
                        color={cfg.color}
                      />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: c.textPrimary },
                            !n.isRead && styles.unread,
                          ]}
                          numberOfLines={1}
                        >
                          {n.title}
                        </Text>
                        {!n.isRead && (
                          <View style={[styles.dot, { backgroundColor: c.accent }]} />
                        )}
                      </View>
                      {n.body && (
                        <Text
                          style={[styles.cardBody, { color: c.textSecondary }]}
                          numberOfLines={2}
                        >
                          {n.body}
                        </Text>
                      )}
                      <View style={styles.metaRow}>
                        <Text style={[styles.typeLabel, { color: cfg.color }]}>
                          {cfg.label}
                        </Text>
                        <Text style={[styles.timeText, { color: c.textMuted }]}>
                          {formatTime(n.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          )}
          {news.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
                Notizie
              </Text>
              {news.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
                return (
                  <Pressable
                    key={n.id}
                    style={({ pressed }) => [
                      styles.card,
                      { backgroundColor: n.isRead ? c.bg : c.bgCard, borderColor: c.border },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handlePress(n)}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: cfg.color + "18", borderColor: cfg.color + "30" },
                      ]}
                    >
                      <Ionicons
                        name={cfg.icon}
                        size={18}
                        color={cfg.color}
                      />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: c.textPrimary },
                            !n.isRead && styles.unread,
                          ]}
                          numberOfLines={1}
                        >
                          {n.title}
                        </Text>
                      </View>
                      {n.body && (
                        <Text
                          style={[styles.cardBody, { color: c.textSecondary }]}
                          numberOfLines={2}
                        >
                          {n.body}
                        </Text>
                      )}
                      <View style={styles.metaRow}>
                        <Text style={[styles.typeLabel, { color: cfg.color }]}>
                          {cfg.label}
                        </Text>
                        <Text style={[styles.timeText, { color: c.textMuted }]}>
                          {formatTime(n.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 18 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  markAllText: { fontSize: 11, fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 0.5,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  content: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: "600", flex: 1 },
  unread: { fontWeight: "800" },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6, marginTop: 4, textTransform: "uppercase" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardBody: { fontSize: 12, lineHeight: 16, marginTop: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  typeLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  timeText: { fontSize: 10, fontWeight: "500" },
});
