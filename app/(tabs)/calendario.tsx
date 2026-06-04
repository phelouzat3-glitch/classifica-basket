import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  return timeStr ? timeStr.slice(0, 5) : "";
}

const ORANGE = "#E8600A";

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/matches?team=${encodeURIComponent("Abc Castelfiorentino")}`,
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMatches()}>
          <Text style={styles.retryBtnText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerSmall}>ABC CASTELFIORENTINO</Text>
        <Text style={styles.headerTitle}>Calendario</Text>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMatches(true)}
            tintColor={ORANGE}
            colors={[ORANGE]}
          />
        }
        renderItem={({ item }) => {
          const isAbcHome = item.homeTeam.startsWith("Abc");
          const opponent = isAbcHome ? item.awayTeam : item.homeTeam;
          const ourScore = isAbcHome ? item.homeScore : item.awayScore;
          const oppScore = isAbcHome ? item.awayScore : item.homeScore;
          const won = item.isPlayed && ourScore != null && ourScore > oppScore!;

          return (
            <View style={[styles.card, !item.isPlayed && styles.cardFuture]}>
              <View style={styles.roundCol}>
                <View style={styles.roundBadge}>
                  <Text style={styles.roundBadgeText}>{item.round}ª</Text>
                </View>
              </View>

              <View style={styles.bodyCol}>
                <View style={styles.opponentRow}>
                  <TeamLogo teamName={opponent} size={item.isPlayed ? 24 : 20} />
                  <Text
                    style={[styles.opponentName, !item.isPlayed && styles.opponentNameFuture]}
                    numberOfLines={1}
                  >
                    {opponent}
                  </Text>
                  <View style={styles.venueTag}>
                    <Text style={styles.venueTagText}>
                      {isAbcHome ? "Casa" : "Trasferta"}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                  </View>
                  {item.time && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏰</Text>
                      <Text style={styles.metaText}>{formatTime(item.time)}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.scoreCol}>
                {item.isPlayed ? (
                  <>
                    <Text style={[styles.scoreNum, won && styles.scoreWin]}>
                      {ourScore}
                    </Text>
                    <Text style={styles.scoreDash}>-</Text>
                    <Text style={[styles.scoreNum, !won && styles.scoreLoss]}>
                      {oppScore}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.vsLabel}>VS</Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: "#DC2626", marginBottom: 16, fontSize: 15 },
  retryBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryBtnText: { color: "#FFF", fontWeight: "600" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerSmall: {
    fontSize: 11,
    fontWeight: "700",
    color: ORANGE,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
    borderLeftColor: "#E8600A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardFuture: {
    borderColor: "#F0F0F0",
    borderLeftWidth: 4,
    borderLeftColor: "#D1D5DB",
    backgroundColor: "#FAFAFA",
  },

  roundCol: {
    width: 44,
    alignItems: "center",
  },
  roundBadge: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roundBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },

  bodyCol: {
    flex: 1,
    paddingLeft: 12,
    gap: 6,
  },
  opponentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  opponentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  opponentNameFuture: {
    fontWeight: "600",
    color: "#6B7280",
  },
  venueTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  venueTagText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },

  scoreCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    minWidth: 52,
    justifyContent: "flex-end",
  },
  scoreNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    minWidth: 24,
    textAlign: "center",
  },
  scoreWin: { color: "#059669" },
  scoreLoss: { color: "#DC2626" },
  scoreDash: { color: "#D1D5DB", fontSize: 18, fontWeight: "700" },
  vsLabel: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
