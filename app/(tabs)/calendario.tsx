import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const c = useColors();

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
      if (!isRefresh) animateIn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [animateIn]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: c.loss }]}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchMatches()}>
          <Text style={styles.retryBtnText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.header, { backgroundColor: c.bg }]}>
        <Text style={styles.headerSmall}>ABC CASTELFIORENTINO</Text>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Calendario</Text>
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
            <View style={[
                styles.card,
                !item.isPlayed
                  ? { backgroundColor: c.bgCardAlt, borderColor: c.border, borderLeftColor: c.textMuted }
                  : { backgroundColor: c.bgCard, borderColor: c.border, borderLeftColor: c.accent },
              ]}>
              <View style={styles.roundCol}>
                <View style={styles.roundBadge}>
                  <Text style={styles.roundBadgeText}>{item.round}ª</Text>
                </View>
              </View>

              <View style={styles.bodyCol}>
                <View style={styles.opponentRow}>
                  <TeamLogo teamName={opponent} size={item.isPlayed ? 24 : 20} />
                  <Text
                    style={[
                      styles.opponentName,
                      !item.isPlayed
                        ? { color: c.textSecondary }
                        : { color: c.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {opponent}
                  </Text>
                  <View style={[styles.venueTag, { backgroundColor: c.border }]}>
                    <Text style={[styles.venueTagText, { color: c.textSecondary }]}>
                      {isAbcHome ? "Casa" : "Trasferta"}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={[styles.metaText, { color: c.textMuted }]}>{formatDate(item.date)}</Text>
                  </View>
                  {item.time && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏰</Text>
                      <Text style={[styles.metaText, { color: c.textMuted }]}>{formatTime(item.time)}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.scoreCol}>
                {item.isPlayed ? (
                  <>
                    <Text style={[styles.scoreNum, { color: c.textPrimary }, won && styles.scoreWin]}>
                      {ourScore}
                    </Text>
                    <Text style={[styles.scoreDash, { color: c.textMuted }]}>-</Text>
                    <Text style={[styles.scoreNum, { color: c.textPrimary }, !won && styles.scoreLoss]}>
                      {oppScore}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.vsLabel, { color: c.textMuted }]}>VS</Text>
                )}
              </View>
            </View>
          );
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { marginBottom: 16, fontSize: 15 },
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
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardFuture: {
    borderLeftWidth: 4,
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
    flex: 1,
  },
  opponentNameFuture: {
    fontWeight: "600",
  },
  venueTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  venueTagText: {
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
    minWidth: 24,
    textAlign: "center",
  },
  scoreWin: { color: "#4ADE80" },
  scoreLoss: { color: "#F87171" },
  scoreDash: { fontSize: 18, fontWeight: "700" },
  vsLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
