import { Ionicons } from "@expo/vector-icons";
import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

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

type Section = {
  title: string;
  type: "hero" | "results" | "missed" | "upcoming";
  data: Match[];
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
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  return timeStr ? timeStr.slice(0, 5) : "";
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ORANGE = "#E8600A";

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");

  const monthsFull = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

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

  const router = useRouter();
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

  const sections = useMemo(() => {
    const today = getToday();
    const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));

    const played: Match[] = [];
    const unplayed: Match[] = [];

    for (const m of sorted) {
      if (m.isPlayed) played.push(m);
      else unplayed.push(m);
    }

    const nextIdx = unplayed.findIndex((m) => m.date >= today);
    const next =
      nextIdx !== -1
        ? unplayed.splice(nextIdx, 1)[0]
        : unplayed.shift();

    const missed = unplayed.filter((m) => m.date < today);
    const upcoming = unplayed.filter((m) => m.date >= today);

    let resultsData = played.reverse();
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const monthIdx = monthsFull.findIndex((m) => m.startsWith(q));
      resultsData = resultsData.filter((m) => {
        if (monthIdx !== -1) {
          const d = new Date(m.date + "T00:00:00");
          return d.getMonth() === monthIdx;
        }
        return false;
      });
    }

    const result: Section[] = [];

    if (next) result.push({ title: "Prossima Partita", type: "hero", data: [next] });
    if (resultsData.length || (searchText.trim() && played.length)) result.push({ title: "Risultati", type: "results", data: resultsData });
    if (missed.length) result.push({ title: "Da Recuperare", type: "missed", data: missed });
    result.push({ title: "Prossime Partite", type: "upcoming", data: upcoming });

    return result;
  }, [matches, searchText]);

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
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Calendario</Text>
          <Pressable onPress={() => router.push("/admin")} style={styles.adminBtn}>
            <Ionicons name="settings-outline" size={20} color={c.textMuted} />
          </Pressable>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMatches(true)}
            tintColor={ORANGE}
            colors={[ORANGE]}
          />
        }
        renderSectionHeader={({ section }) => {
          if (section.type === "hero" || section.type === "upcoming") return null;
          return (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{section.title}</Text>
                <View style={[styles.sectionLine, { backgroundColor: c.border }]} />
              </View>
              {section.type === "results" && (
                <TextInput
                  style={[styles.searchInput, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Cerca mese (es. giugno)"
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            </View>
          );
        }}
        renderSectionFooter={({ section }) => {
          if (section.type === "results") {
            if (searchText.trim() && section.data.length === 0) {
              return (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: c.textMuted }}>Nessuna partita in questo mese</Text>
                </View>
              );
            }
            if (!searchText.trim() && section.data.length > 1) {
              return (
                <TouchableOpacity
                  style={[styles.expandBtn, { backgroundColor: c.bgCardAlt, borderColor: c.border }]}
                  onPress={() => setResultsExpanded(!resultsExpanded)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={resultsExpanded ? "chevron-up" : "chevron-down"} size={16} color={c.accent} />
                  <Text style={[styles.expandBtnText, { color: c.accent }]}>Mostra tutti ({section.data.length})</Text>
                </TouchableOpacity>
              );
            }
          }
          if (section.type === "upcoming") {
            return (
              <TouchableOpacity
                style={[styles.expandBtn, { backgroundColor: c.bgCardAlt, borderColor: c.border }]}
                onPress={section.data.length > 0 ? () => setUpcomingExpanded(!upcomingExpanded) : () => router.push("/partite")}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={c.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.expandBtnText, { color: c.accent }]}>
                  {section.data.length > 0
                    ? (upcomingExpanded ? "Nascondi" : `Mostra tutte (${section.data.length})`)
                    : "Prossime Partite"}
                </Text>
                <Ionicons
                  name={section.data.length > 0 ? (upcomingExpanded ? "chevron-up" : "chevron-down") : "chevron-forward"}
                  size={16}
                  color={c.accent}
                />
              </TouchableOpacity>
            );
          }
          return null;
        }}
        renderItem={({ item, section, index }) => {
          const isSearching = searchText.trim().length > 0;
          if (section.type === "results" && !isSearching && !resultsExpanded && index > 0) return null;
          if (section.type === "upcoming" && !upcomingExpanded && index > 0) return null;

          const isAbcHome = item.homeTeam.startsWith("Abc");
          const opponent = isAbcHome ? item.awayTeam : item.homeTeam;
          const ourScore = isAbcHome ? item.homeScore : item.awayScore;
          const oppScore = isAbcHome ? item.awayScore : item.homeScore;
          const won = item.isPlayed && ourScore != null && ourScore > oppScore!;

          if (section.type === "hero") {
            const isToday = item.date === getToday();
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/match-detail?id=${item.id}`)}
              >
                <View style={[styles.heroCard, { backgroundColor: c.bgCard, borderColor: ORANGE }]}>
                  {isToday && (
                    <View style={[styles.liveBadge, { backgroundColor: c.win }]}>
                      <Text style={styles.liveBadgeText}>IN CORSO</Text>
                    </View>
                  )}
                  <View style={styles.heroDateBadge}>
                    <Text style={styles.heroDateDay}>
                      {new Date(item.date + "T00:00:00").getDate()}
                    </Text>
                    <Text style={styles.heroDateMonth}>
                      {new Date(item.date + "T00:00:00").toLocaleDateString("it-IT", { month: "short" })}
                    </Text>
                  </View>

                  <View style={styles.heroBody}>
                    <View style={styles.heroOpponentRow}>
                      <TeamLogo teamName={opponent} size={28} />
                      <Text style={[styles.heroOpponent, { color: c.textPrimary }]} numberOfLines={1}>
                        {opponent}
                      </Text>
                    </View>
                    <View style={styles.heroMeta}>
                      <View style={[styles.venueTag, { backgroundColor: ORANGE }]}>
                        <Text style={styles.venueTagHero}>
                          {isAbcHome ? "Casa" : "Trasferta"}
                        </Text>
                      </View>
                      {item.time && (
                        <Text style={[styles.heroTime, { color: c.textMuted }]}>
                          {formatTime(item.time)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.heroRound}>Giornata {item.round}ª</Text>
                  </View>

                  <View style={styles.heroVSCol}>
                    <Text style={styles.heroVS}>VS</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/match-detail?id=${item.id}`)}
            >
              <View style={[
                  styles.card,
                  section.type === "missed"
                    ? { backgroundColor: c.bgCardAlt, borderColor: c.loss + "40", borderLeftColor: c.loss }
                    : section.type === "upcoming"
                    ? { backgroundColor: c.bgCardAlt, borderColor: c.border, borderLeftColor: c.textMuted }
                    : { backgroundColor: c.bgCard, borderColor: c.border, borderLeftColor: c.accent },
                ]}>
                {item.date === getToday() && (
                  <View style={[styles.liveBadgeSmall, { backgroundColor: c.win }]}>
                    <Text style={styles.liveBadgeSmallText}>IN CORSO</Text>
                  </View>
                )}
                {section.type === "missed" && (
                  <View style={[styles.missedBadge, { backgroundColor: c.loss }]}>
                    <Text style={styles.missedBadgeText}>!</Text>
                  </View>
                )}

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
                        section.type === "results"
                          ? { color: c.textPrimary }
                          : { color: c.textSecondary },
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
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  adminBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },

  liveBadge: {
    position: "absolute",
    top: -1,
    right: -1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    zIndex: 10,
  },
  liveBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  liveBadgeSmall: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 8,
    zIndex: 10,
  },
  liveBadgeSmallText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    borderWidth: 2,
    overflow: "hidden",
  },
  heroDateBadge: {
    width: 60,
    height: 70,
    borderRadius: 12,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
  },
  heroDateDay: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    marginTop: -2,
  },
  heroDateMonth: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroBody: {
    flex: 1,
    paddingLeft: 14,
    gap: 6,
  },
  heroOpponentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroOpponent: {
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroTime: {
    fontSize: 13,
    fontWeight: "600",
  },
  heroRound: {
    fontSize: 11,
    fontWeight: "500",
    color: ORANGE,
  },
  heroVSCol: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  },
  heroVS: {
    fontSize: 20,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 1,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: "hidden",
  },

  missedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  missedBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
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
  venueTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  venueTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  venueTagHero: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
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

  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },

  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 6,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
