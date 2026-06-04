import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MatchFromApi = {
  id: number;
  round: number;
  date: string;
  time: string | null;
  homeTeam?: string;
  home_team?: string;
  awayTeam?: string;
  away_team?: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

type FilterType = "Tutte" | "Giocate" | "Da giocare";

export default function PartiteScreen() {
  const [matches, setMatches] = useState<MatchFromApi[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Tutte");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const filtered = useMemo(() => {
    if (activeFilter === "Giocate") {
      return matches.filter((m) => m.home_score != null && m.away_score != null);
    }
    if (activeFilter === "Da giocare") {
      return matches.filter((m) => m.home_score == null && m.away_score == null);
    }
    return matches;
  }, [matches, activeFilter]);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/matches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMatches((await res.json()) as MatchFromApi[]);
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

  const shareMatch = async (item: MatchFromApi) => {
    const homeName = item.homeTeam || item.home_team || "";
    const awayName = item.awayTeam || item.away_team || "";
    const isPlayed = item.home_score != null && item.away_score != null;
    const dateStr = new Date(item.date).toLocaleDateString("it-IT");
    const timeStr = item.time ? item.time.slice(0, 5) : "";
    const scoreLine = isPlayed
      ? `${homeName} ${item.home_score}-${item.away_score} ${awayName}`
      : `${homeName} vs ${awayName}`;
    try {
      await Share.share({
        message: `🏀 ${homeName} - ${awayName}\n${scoreLine}\n📅 ${dateStr}${timeStr ? " " + timeStr : ""}`,
      });
    } catch {}
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#E8600A" />
        </View>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchMatches()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home" as any)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tutte le partite</Text>
      </View>

      <View style={styles.filterRow}>
        {(["Tutte", "Giocate", "Da giocare"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterBtnText, activeFilter === f && styles.filterBtnTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMatches(true)} tintColor="#E8600A" colors={["#E8600A"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nessuna partita.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const homeName = item.homeTeam || item.home_team || "";
          const awayName = item.awayTeam || item.away_team || "";
          const isPlayed = item.home_score != null && item.away_score != null;
          const isAbcHome = homeName.includes("Castelfiorentino");
          const isAbcAway = awayName.includes("Castelfiorentino");
          const isAbcMatch = isAbcHome || isAbcAway;

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
              onPress={() => shareMatch(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.roundText}>Giornata {item.round}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                  {item.time ? `, ${item.time.slice(0, 5)}` : ""}
                </Text>
              </View>

              <View style={styles.teamsRow}>
                <View style={[styles.teamCol, isAbcHome && styles.abcCol]}>
                  <TeamLogo teamName={homeName} size={20} />
                  <Text style={[styles.teamName, isAbcHome && styles.abcName]} numberOfLines={1}>
                    {homeName}
                  </Text>
                </View>

                {isPlayed ? (
                  <View style={styles.scoreCol}>
                    <Text style={[styles.score, item.home_score! > item.away_score! && styles.scoreWon]}>
                      {item.home_score}
                    </Text>
                    <Text style={styles.scoreDash}>-</Text>
                    <Text style={[styles.score, item.away_score! > item.home_score! && styles.scoreWon]}>
                      {item.away_score}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.vsCol}>VS</Text>
                )}

                <View style={[styles.teamCol, isAbcAway && styles.abcCol]}>
                  <TeamLogo teamName={awayName} size={20} />
                  <Text style={[styles.teamName, isAbcAway && styles.abcName]} numberOfLines={1}>
                    {awayName}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#DC2626", textAlign: "center", marginBottom: 16 },
  retryBtn: { backgroundColor: "#E8600A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryBtnText: { color: "#FFF", fontWeight: "bold" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  backBtnText: { color: "#E8600A", fontSize: 15, fontWeight: "600" },
  title: { color: "#111827", fontSize: 22, fontWeight: "bold", paddingLeft: 8, paddingVertical: 8 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterBtn: { flex: 1, backgroundColor: "#F3F4F6", paddingVertical: 8, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  filterBtnActive: { backgroundColor: "#E8600A", borderColor: "#E8600A" },
  filterBtnText: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  filterBtnTextActive: { color: "#FFF", fontWeight: "700" },
  list: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: "center", padding: 30 },
  emptyText: { color: "#6B7280", fontSize: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  roundText: { fontSize: 12, fontWeight: "800", color: "#E8600A" },
  dateText: { fontSize: 11, color: "#9CA3AF" },
  teamsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  teamCol: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  abcCol: {},
  teamName: { color: "#111827", fontSize: 13, fontWeight: "600", flex: 1 },
  abcName: { color: "#E8600A", fontWeight: "800" },
  scoreCol: { flexDirection: "row", alignItems: "center", gap: 3 },
  score: { color: "#111827", fontSize: 18, fontWeight: "800", minWidth: 22, textAlign: "center" },
  scoreWon: { color: "#059669" },
  scoreDash: { color: "#D1D5DB", fontSize: 16, fontWeight: "600" },
  vsCol: { color: "#D1D5DB", fontSize: 14, fontWeight: "800" },
});
