import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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

export default function CalendarioScreen() {
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8600A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMatches()}>
          <Text style={styles.retryBtnText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMatches(true)}
            tintColor="#E8600A"
            colors={["#E8600A"]}
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
              <View style={styles.cardLeft}>
                <Text style={styles.roundNum}>{item.round}ª</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  {item.time && (
                    <Text style={styles.timeText}>{formatTime(item.time)}</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardCenter}>
                <View style={styles.opponentRow}>
                  <TeamLogo teamName={opponent} size={item.isPlayed ? 22 : 18} />
                  <Text
                    style={[styles.opponentName, !item.isPlayed && styles.opponentNameSmall]}
                    numberOfLines={1}
                  >
                    {opponent}
                  </Text>
                  <View style={styles.venueTag}>
                    <Text style={styles.venueTagText}>
                      {isAbcHome ? "C" : "T"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.roundLabel}>Giornata {item.round}</Text>
              </View>

              <View style={styles.cardRight}>
                {item.isPlayed ? (
                  <>
                    <Text style={[styles.score, won && styles.scoreWon]}>
                      {ourScore}
                    </Text>
                    <Text style={styles.scoreDash}>-</Text>
                    <Text style={[styles.score, !won && styles.scoreLost]}>
                      {oppScore}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.vsText}>VS</Text>
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
  container: { flex: 1, backgroundColor: "#0F1923" },
  center: {
    flex: 1,
    backgroundColor: "#0F1923",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: "#ef4444", marginBottom: 16 },
  retryBtn: { backgroundColor: "#E8600A", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  retryBtnText: { color: "#FFF", fontWeight: "bold" },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E8600A",
  },
  cardFuture: {
    borderLeftColor: "#334155",
  },
  cardLeft: {
    width: 60,
    alignItems: "center",
    gap: 4,
  },
  roundNum: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E8600A",
  },
  dateBox: { alignItems: "center" },
  dateText: { color: "#94A3B8", fontSize: 11, fontWeight: "500" },
  timeText: { color: "#64748B", fontSize: 10 },
  cardCenter: {
    flex: 1,
    paddingLeft: 10,
    gap: 4,
  },
  opponentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  opponentName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  opponentNameSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  venueTag: {
    backgroundColor: "#0F1923",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  venueTagText: { color: "#64748B", fontSize: 10, fontWeight: "700" },
  roundLabel: { color: "#64748B", fontSize: 10, fontWeight: "500" },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 50,
    justifyContent: "flex-end",
  },
  score: { color: "#FFF", fontSize: 18, fontWeight: "800", minWidth: 22, textAlign: "center" },
  scoreWon: { color: "#4ADE80" },
  scoreLost: { color: "#F87171" },
  scoreDash: { color: "#475569", fontSize: 16, fontWeight: "600" },
  vsText: { color: "#475569", fontSize: 13, fontWeight: "800" },
});
