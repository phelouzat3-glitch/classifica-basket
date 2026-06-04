import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
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

  const applyFilter = (all: MatchFromApi[], filter: FilterType) => {
    if (filter === "Giocate") {
      return all.filter((m) => m.home_score != null && m.away_score != null);
    }
    if (filter === "Da giocare") {
      return all.filter((m) => m.home_score == null && m.away_score == null);
    }
    return all;
  };

  const filtered = useMemo(() => applyFilter(matches, activeFilter), [matches, activeFilter]);

  const fetchMatches = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/matches`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MatchFromApi[];
        setMatches(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const onRefresh = useCallback(() => fetchMatches(true), [fetchMatches]);

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
          <Text style={styles.errorText}>Errore: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMatches()}>
            <Text style={styles.retryBtnText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/statistiche" as any)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Campionato</Text>
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
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8600A" colors={["#E8600A"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nessuna partita trovata.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPlayed = item.home_score != null && item.away_score != null;
          const homeName = item.homeTeam || item.home_team || "";
          const awayName = item.awayTeam || item.away_team || "";
          const isAbcHome = homeName.includes("Castelfiorentino");
          const isAbcAway = awayName.includes("Castelfiorentino");
          const isAbcMatch = isAbcHome || isAbcAway;
          const ourScore = isAbcHome ? item.home_score : item.away_score;
          const oppScore = isAbcHome ? item.away_score : item.home_score;
          const won = isPlayed && ourScore != null && oppScore != null && ourScore > oppScore;

          const shareMatch = async () => {
            const dateStr = new Date(item.date).toLocaleDateString("it-IT");
            const timeStr = item.time ? item.time.slice(0, 5) : "";
            const dateLine = `📅 ${dateStr}${timeStr ? " - " + timeStr : ""}`;
            const scoreLine = isPlayed
              ? `${homeName} ${item.home_score} - ${item.away_score} ${awayName}`
              : `${homeName} vs ${awayName}`;
            try {
              await Share.share({
                message: `🏀 ABC Castelfiorentino\n${scoreLine}\n${dateLine}\n\n🔗 classifica-basket.vercel.app`,
              });
            } catch {}
          };

          if (isPlayed) {
            return (
              <View style={styles.cardPlayed}>
                <View style={styles.cardTop}>
                  <Text style={styles.roundLabel}>Giornata {item.round}</Text>
                  <Text style={styles.dateLabel}>
                    {new Date(item.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                    {item.time ? ` · ${item.time.slice(0, 5)}` : ""}
                  </Text>
                </View>

                <View style={styles.scoreBoard}>
                  <View style={[styles.teamBlock, won && styles.teamBlockWon]}>
                    <TeamLogo teamName={isAbcHome ? "ABC Castelfiorentino" : homeName} size={28} />
                    <Text style={[styles.teamBlockName, isAbcHome && styles.abcName]} numberOfLines={1}>
                      {isAbcHome ? "ABC Castelfiorentino" : homeName}
                    </Text>
                  </View>
                  <View style={styles.scoreBlock}>
                    <Text style={[styles.scoreBig, isAbcHome && won && styles.scoreWon, isAbcHome && !won && styles.scoreLost]}>
                      {item.home_score}
                    </Text>
                    <Text style={styles.scoreDivider}>-</Text>
                    <Text style={[styles.scoreBig, isAbcAway && won && styles.scoreWon, isAbcAway && !won && styles.scoreLost]}>
                      {item.away_score}
                    </Text>
                  </View>
                  <View style={[styles.teamBlock, !won && isAbcMatch && styles.teamBlockLost]}>
                    <TeamLogo teamName={isAbcAway ? "ABC Castelfiorentino" : awayName} size={28} />
                    <Text style={[styles.teamBlockName, isAbcAway && styles.abcName]} numberOfLines={1}>
                      {isAbcAway ? "ABC Castelfiorentino" : awayName}
                    </Text>
                  </View>
                </View>

                {isAbcHome && (
                  <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => Linking.openURL("https://maps.google.com/?q=PalaGilardetti+Castelfiorentino")}
                  >
                    <Text style={styles.mapBtnText}>📍 PalaGilardetti, Castelfiorentino</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.shareBtn} onPress={shareMatch}>
                  <Text style={styles.shareBtnText}>Condividi</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View style={styles.cardUpcoming}>
              <View style={styles.upcomingInner}>
                <View style={styles.upcomingTeams}>
                  <View style={styles.upcomingTeamRow}>
                    <TeamLogo teamName={homeName} size={18} />
                    <Text style={[styles.upcomingTeamName, isAbcHome && styles.abcName]} numberOfLines={1}>
                      {homeName}
                    </Text>
                  </View>
                  <Text style={styles.upcomingVs}>VS</Text>
                  <View style={styles.upcomingTeamRow}>
                    <TeamLogo teamName={awayName} size={18} />
                    <Text style={[styles.upcomingTeamName, isAbcAway && styles.abcName]} numberOfLines={1}>
                      {awayName}
                    </Text>
                  </View>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingRound}>Giornata {item.round}</Text>
                  <Text style={styles.upcomingDate}>
                    {new Date(item.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                    {item.time ? `, ${item.time.slice(0, 5)}` : ""}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.shareBtnSmall} onPress={shareMatch}>
                <Text style={styles.shareBtnSmallText}>Condividi</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 15, fontWeight: "600", marginBottom: 16, textAlign: "center" },
  retryBtn: { backgroundColor: "#E8600A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryBtnText: { color: "#FFF", fontWeight: "bold" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingTop: 4 },
  backBtn: { padding: 8 },
  backBtnText: { color: "#E8600A", fontSize: 15, fontWeight: "600" },
  title: { color: "#FFF", fontSize: 22, fontWeight: "bold", paddingLeft: 10, paddingVertical: 8 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterBtn: { flex: 1, backgroundColor: "#1E293B", paddingVertical: 8, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  filterBtnActive: { backgroundColor: "#E8600A", borderColor: "#E8600A" },
  filterBtnText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  filterBtnTextActive: { color: "#FFF", fontWeight: "700" },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: "center", padding: 30 },
  emptyText: { color: "#94A3B8", fontSize: 14 },

  cardPlayed: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  roundLabel: { fontSize: 12, fontWeight: "800", color: "#E8600A" },
  dateLabel: { fontSize: 12, color: "#94A3B8" },
  scoreBoard: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  teamBlock: { flex: 1, alignItems: "center", gap: 4 },
  teamBlockWon: {},
  teamBlockLost: {},
  teamBlockName: { color: "#FFF", fontSize: 12, fontWeight: "600", textAlign: "center" },
  abcName: { color: "#FDBA74", fontWeight: "800" },
  scoreBlock: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreBig: { color: "#FFF", fontSize: 28, fontWeight: "900", minWidth: 32, textAlign: "center" },
  scoreWon: { color: "#4ADE80" },
  scoreLost: { color: "#F87171" },
  scoreDivider: { color: "#475569", fontSize: 24, fontWeight: "700" },
  mapBtn: { marginTop: 4, alignSelf: "flex-start" },
  mapBtnText: { color: "#94A3B8", fontSize: 12 },
  shareBtn: { marginTop: 10, alignSelf: "flex-end", backgroundColor: "#E8600A", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  shareBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  cardUpcoming: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2D3A4F",
    flexDirection: "row",
    alignItems: "center",
  },
  upcomingInner: { flex: 1, gap: 8 },
  upcomingTeams: { gap: 6 },
  upcomingTeamRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  upcomingTeamName: { color: "#CBD5E1", fontSize: 13, fontWeight: "600", flex: 1 },
  upcomingVs: { color: "#475569", fontSize: 10, fontWeight: "800", marginLeft: 28 },
  upcomingInfo: { flexDirection: "row", justifyContent: "space-between", marginLeft: 28 },
  upcomingRound: { color: "#64748B", fontSize: 11, fontWeight: "600" },
  upcomingDate: { color: "#64748B", fontSize: 11 },
  shareBtnSmall: { marginLeft: 8 },
  shareBtnSmallText: { color: "#E8600A", fontSize: 12, fontWeight: "700" },
});
