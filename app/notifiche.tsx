import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSeason, useTeamName } from "@/src/context/LeagueContext";

type ApiMatch = {
  id: number;
  round: number;
  date: string;
  time: string | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

type NotifItem = {
  id: string;
  title: string;
  body: string;
  type: "match_result" | "upcoming" | "news";
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  date: string;
  matchId?: number;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Oggi";
  if (diffDays === 1) return "Domani";
  if (diffDays > 1 && diffDays <= 7) return `Tra ${diffDays} giorni`;
  return formatDateShort(dateStr);
}

function matchToNotifications(matches: ApiMatch[], teamName: string): NotifItem[] {
  const items: NotifItem[] = [];
  const now = new Date();

  for (const m of matches) {
    const matchDate = new Date(m.date + "T00:00:00");
    const isPlayed = m.home_score != null && m.away_score != null;

    if (isPlayed) {
      const won = m.is_my_team
        ? (m.home_team === teamName ? m.home_score! > m.away_score! : m.away_score! > m.home_score!)
        : false;

      items.push({
        id: `result-${m.id}`,
        title: won ? "Vittoria!" : m.is_my_team ? "Sconfitta" : `Giornata ${m.round}`,
        body: `${m.home_team} ${m.home_score} - ${m.away_score} ${m.away_team}`,
        type: "match_result",
        icon: m.is_my_team ? (won ? "trophy" : "close-circle") : "basketball",
        color: m.is_my_team ? (won ? "#22C55E" : "#EF4444") : "#E8600A",
        date: m.date,
        matchId: m.id,
      });
    } else if (matchDate > now) {
      const venue = m.home_team === teamName ? "In casa" : "In trasferta";

      items.push({
        id: `upcoming-${m.id}`,
        title: `Prossima partita · ${formatRelative(m.date)}`,
        body: `${m.home_team} vs ${m.away_team}${m.is_my_team ? ` · ${venue}` : ""}`,
        type: "upcoming",
        icon: "calendar",
        color: "#3B82F6",
        date: m.date,
        matchId: m.id,
      });
    }
  }

  return items;
}

export default function NotificheScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const season = useSeason();
  const teamName = useTeamName();

  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/matches?team=${encodeURIComponent(teamName)}&season=${encodeURIComponent(season)}`);
      if (res.ok) {
        const matches: ApiMatch[] = await res.json();
        const notifs = matchToNotifications(matches, teamName);
        notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(notifs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [season, teamName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { upcoming, results } = useMemo(() => {
    const up: NotifItem[] = [];
    const res: NotifItem[] = [];
    for (const item of items) {
      if (item.type === "upcoming") up.push(item);
      else res.push(item);
    }
    up.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { upcoming: up, results: res };
  }, [items]);

  const handlePress = useCallback(
    (item: NotifItem) => {
      if (item.matchId) {
        router.push(`/match-detail?id=${item.matchId}` as any);
      }
    },
    [router],
  );

  const renderCard = (item: NotifItem, index: number) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.bgCard, borderColor: c.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => handlePress(item)}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: item.color + "18", borderColor: item.color + "30" },
        ]}
      >
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.cardTitle, { color: c.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.cardBody, { color: c.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[styles.dateText, { color: c.textMuted }]}>
          {formatDate(item.date)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
    </Pressable>
  );

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

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : items.length === 0 ? (
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
              onRefresh={() => fetchData(true)}
              tintColor={c.accent}
              colors={[c.accent]}
            />
          }
        >
          {upcoming.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={[styles.sectionHeader, { backgroundColor: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.2)" }]}>
                <Ionicons name="calendar" size={14} color="#3B82F6" />
                <Text style={[styles.sectionTitle, { color: "#3B82F6" }]}>
                  Prossime partite ({upcoming.length})
                </Text>
              </View>
              {upcoming.map((item, i) => renderCard(item, i))}
            </View>
          )}

          {results.length > 0 && (
            <View>
              <View style={[styles.sectionHeader, { backgroundColor: "rgba(232, 96, 10, 0.08)", borderColor: "rgba(232, 96, 10, 0.2)" }]}>
                <Ionicons name="basketball" size={14} color="#E8600A" />
                <Text style={[styles.sectionTitle, { color: "#E8600A" }]}>
                  Risultati ({results.length})
                </Text>
              </View>
              {results.map((item, i) => renderCard(item, i))}
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

  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },

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
  cardTitle: { fontSize: 14, fontWeight: "700" },
  cardBody: { fontSize: 12, lineHeight: 16, marginTop: 1 },
  dateText: { fontSize: 10, fontWeight: "500", marginTop: 3 },
});
