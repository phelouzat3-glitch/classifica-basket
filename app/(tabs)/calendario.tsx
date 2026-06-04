import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MatchFromAPI = {
  id: number;
  round: number;
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

type Match = {
  id: number;
  round: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isMyTeam: boolean;
  isPlayed: boolean;
};

type FilterType = "Tutte" | "Da giocare" | "Giocate";

const ABC = "Abc Castelfiorentino";

function mapMatch(m: MatchFromAPI): Match {
  return {
    id: m.id,
    round: m.round,
    date: m.date,
    time: m.time || "",
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isMyTeam: m.is_my_team,
    isPlayed: m.home_score != null && m.away_score != null,
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function formatTime(timeStr: string): string {
  return timeStr ? timeStr.slice(0, 5) : "";
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function getMonthSortKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type Section = { title: string; data: Match[] };

export default function CalendarioScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("Tutte");
  const router = useRouter();

  const fetchMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/matches?team=${encodeURIComponent(ABC)}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as MatchFromAPI[];
      setMatches(data.map(mapMatch));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filtered = useMemo(() => {
    if (filter === "Giocate") return matches.filter((m) => m.isPlayed);
    if (filter === "Da giocare") return matches.filter((m) => !m.isPlayed);
    return matches;
  }, [matches, filter]);

  const sections = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = getMonthKey(m.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries())
      .map(([title, data]) => ({ title, data } as Section))
      .sort((a, b) => {
        const ka = getMonthSortKey(a.data[0].date);
        const kb = getMonthSortKey(b.data[0].date);
        return ka.localeCompare(kb);
      });
  }, [filtered]);

  const counts = useMemo(() => {
    const total = matches.length;
    const played = matches.filter((m) => m.isPlayed).length;
    const upcoming = total - played;
    return { total, played, upcoming };
  }, [matches]);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8600A" />
        <Text style={styles.loadingText}>Caricamento calendario...</Text>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Errore: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMatches()}>
          <Text style={styles.retryBtnText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(["Tutte", "Da giocare", "Giocate"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f && styles.filterBtnTextActive,
              ]}
            >
              {f}
              <Text style={styles.filterCount}>
                {" "}
                {f === "Tutte"
                  ? counts.total
                  : f === "Giocate"
                    ? counts.played
                    : counts.upcoming}
              </Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMatches(true)}
            tintColor="#E8600A"
            colors={["#E8600A"]}
            progressBackgroundColor="#0F1923"
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isAbcHome = item.homeTeam.startsWith("Abc");
          const opponent = isAbcHome ? item.awayTeam : item.homeTeam;
          const ourScore = isAbcHome ? item.homeScore : item.awayScore;
          const oppScore = isAbcHome ? item.awayScore : item.homeScore;
          const won = item.isPlayed && ourScore != null && ourScore > oppScore!;
          const today = isToday(item.date);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.matchCard,
                !item.isPlayed && styles.matchCardUpcoming,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push("/partite" as any)}
            >
              <View style={styles.matchTop}>
                <Text style={styles.roundLabel}>G{item.round}</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  {item.time && (
                    <Text style={styles.timeText}>{formatTime(item.time)}</Text>
                  )}
                </View>
                {today && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>OGGI</Text>
                  </View>
                )}
                {item.isPlayed && (
                  <View
                    style={[
                      styles.outcomeBadge,
                      won ? styles.outcomeWin : styles.outcomeLoss,
                    ]}
                  >
                    <Text
                      style={[
                        styles.outcomeText,
                        { color: won ? "#4ADE80" : "#F87171" },
                      ]}
                    >
                      {won ? "V" : "S"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.matchBody}>
                <View style={styles.teamRow}>
                  <TeamLogo teamName={opponent} size={item.isPlayed ? 24 : 20} />
                  <Text
                    style={[
                      styles.opponentName,
                      !item.isPlayed && styles.opponentNameSmall,
                    ]}
                    numberOfLines={1}
                  >
                    {opponent}
                  </Text>
                  <View style={styles.venueBadge}>
                    <Text style={styles.venueText}>
                      {isAbcHome ? "CASA" : "TRASF"}
                    </Text>
                  </View>
                </View>
                {item.isPlayed ? (
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreNum, won && styles.scoreWon]}>
                      {ourScore}
                    </Text>
                    <Text style={styles.scoreDash}>-</Text>
                    <Text
                      style={[styles.scoreNum, !won && styles.scoreLost]}
                    >
                      {oppScore}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.vsRow}>
                    <Text style={styles.vsText}>
                      {item.date ? new Date(item.date).toLocaleDateString("it-IT", { weekday: "short" }) : ""}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Nessuna partita{filter === "Giocate" ? " giocata" : filter === "Da giocare" ? " da giocare" : ""}.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1923" },
  center: {
    flex: 1,
    backgroundColor: "#0F1923",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { color: "#9AA3AD", marginTop: 12 },
  errorText: { color: "#ef4444", fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: "#E8600A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  retryBtnText: { color: "#FFF", fontWeight: "bold" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#0F1923",
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  filterBtnActive: { backgroundColor: "#E8600A", borderColor: "#E8600A" },
  filterBtnText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  filterBtnTextActive: { color: "#FFF", fontWeight: "700" },
  filterCount: { fontWeight: "400", opacity: 0.7 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0F1923",
  },
  sectionHeaderText: {
    color: "#E8600A",
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  listContent: { padding: 12, paddingBottom: 40 },
  matchCard: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E8600A",
  },
  matchCardUpcoming: {
    borderLeftColor: "#334155",
    opacity: 0.85,
  },
  matchTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  roundLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    backgroundColor: "#0F1923",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  dateBox: { flexDirection: "row", gap: 4 },
  dateText: { color: "#94A3B8", fontSize: 12, fontWeight: "500" },
  timeText: { color: "#64748B", fontSize: 12 },
  todayBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  outcomeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  outcomeWin: { backgroundColor: "rgba(74,222,128,0.15)" },
  outcomeLoss: { backgroundColor: "rgba(248,113,113,0.15)" },
  outcomeText: { fontSize: 13, fontWeight: "900" },
  matchBody: { flexDirection: "row", alignItems: "center", gap: 10 },
  teamRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  opponentName: { color: "#FFF", fontSize: 15, fontWeight: "700", flex: 1 },
  opponentNameSmall: { fontSize: 14, fontWeight: "600" },
  venueBadge: {
    backgroundColor: "#0F1923",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  venueText: { color: "#64748B", fontSize: 10, fontWeight: "700" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreNum: { color: "#FFF", fontSize: 18, fontWeight: "800", minWidth: 24, textAlign: "center" },
  scoreWon: { color: "#4ADE80" },
  scoreLost: { color: "#F87171" },
  scoreDash: { color: "#64748B", fontSize: 16, fontWeight: "600" },
  vsRow: {},
  vsText: { color: "#64748B", fontSize: 12, textTransform: "capitalize" },
  emptyBox: { alignItems: "center", padding: 40 },
  emptyText: { color: "#64748B", fontSize: 14 },
});
