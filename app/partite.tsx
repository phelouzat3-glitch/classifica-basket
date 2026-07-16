import { Ionicons } from "@expo/vector-icons";
import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useColors } from "@/src/theme/ThemeContext";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/src/theme";
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
  const [partiteExpanded, setPartiteExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");

  const insets = useSafeAreaInsets();

  const monthsFull = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const router = useRouter();

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

  const filtered = useMemo(() => {
    let result = matches;
    if (activeFilter === "Giocate") {
      result = result.filter((m) => m.home_score != null && m.away_score != null);
    } else if (activeFilter === "Da giocare") {
      result = result.filter((m) => m.home_score == null && m.away_score == null);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const monthIdx = monthsFull.findIndex((m) => m.startsWith(q));
      if (monthIdx !== -1) {
        result = result.filter((m) => {
          const d = new Date(m.date + "T00:00:00");
          return d.getMonth() === monthIdx;
        });
      }
    }
    return result;
  }, [matches, activeFilter, searchText]);

  const fetchMatches = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/matches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const resData = (await res.json()) as { value: MatchFromApi[] };
      setMatches(resData.value);
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
    } catch (e) { console.error(e); }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top }]}>
        <View style={styles.centerBox}>
          <Text style={[styles.errorText, { color: "#EF4444" }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchMatches()}
            style={[styles.retryBtn, { backgroundColor: c.accent }]}
          >
            <Text style={[styles.retryBtnText, { color: "#FFF" }]}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.header, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/calendario" as Href)}
            style={[styles.backBtn, { backgroundColor: c.bgCard, borderColor: c.border }]}
          >
            <Ionicons name="chevron-back" size={18} color={c.accent} />
            <Text style={[styles.backBtnText, { color: c.accent }]}>Calendario</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: c.textPrimary }]}>Tutte le partite</Text>
      </View>

      <View style={styles.filterRow}>
        {(["Tutte", "Giocate", "Da giocare"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              { backgroundColor: c.bgCard, borderColor: c.border },
              activeFilter === f && styles.filterBtnActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterBtnText,
                { color: c.textSecondary },
                activeFilter === f && styles.filterBtnTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Cerca mese (es. giugno)"
        placeholderTextColor={c.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={partiteExpanded ? filtered : filtered.slice(0, 5)}
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
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Nessuna partita.</Text>
          </View>
        }
        ListFooterComponent={
          filtered.length > 5 ? (
            <TouchableOpacity
              style={[styles.expandBtn, { backgroundColor: c.bgCard, borderColor: c.border }]}
              onPress={() => setPartiteExpanded(!partiteExpanded)}
              activeOpacity={0.7}
            >
              <Ionicons name={partiteExpanded ? "chevron-up" : "chevron-down"} size={16} color={c.accent} />
              <Text style={[styles.expandBtnText, { color: c.accent }]}>
                {partiteExpanded ? "Mostra meno" : `Mostra tutte (${filtered.length})`}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => {
          const homeName = item.homeTeam || item.home_team || "";
          const awayName = item.awayTeam || item.away_team || "";
          const isPlayed = item.home_score != null && item.away_score != null;
          const isAbcHome = homeName.includes("Castelfiorentino");
          const isAbcAway = awayName.includes("Castelfiorentino");

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.bgCard, borderColor: c.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => shareMatch(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.roundText, { color: c.accent }]}>Giornata {item.round}</Text>
                <Text style={[styles.dateText, { color: c.textMuted }]}>
                  {new Date(item.date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                  })}
                  {item.time ? `, ${item.time.slice(0, 5)}` : ""}
                </Text>
              </View>

              <View style={styles.teamsRow}>
                <View style={[styles.teamCol, isAbcHome && styles.abcCol]}>
                  <TeamLogo teamName={homeName} size={20} />
                  <Text
                    style={[styles.teamName, { color: c.textPrimary }, isAbcHome && styles.abcName, isAbcHome && { color: c.accent }]}
                    numberOfLines={1}
                  >
                    {homeName}
                  </Text>
                </View>

                {isPlayed ? (
                  <View style={styles.scoreCol}>
                    <Text
                      style={[
                        styles.score,
                        { color: c.textPrimary },
                        item.home_score! > item.away_score! && { color: c.win },
                      ]}
                    >
                      {item.home_score}
                    </Text>
                    <Text style={[styles.scoreDash, { color: c.border }]}>-</Text>
                    <Text
                      style={[
                        styles.score,
                        { color: c.textPrimary },
                        item.away_score! > item.home_score! && { color: c.win },
                      ]}
                    >
                      {item.away_score}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.vsCol, { color: c.textMuted }]}>VS</Text>
                )}

                <View style={[styles.teamCol, isAbcAway && styles.abcCol]}>
                  <TeamLogo teamName={awayName} size={20} />
                  <Text
                    style={[styles.teamName, { color: c.textPrimary }, isAbcAway && styles.abcName, isAbcAway && { color: c.accent }]}
                    numberOfLines={1}
                  >
                    {awayName}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { textAlign: "center", marginBottom: 16 },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryBtnText: { fontWeight: "bold" },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    alignSelf: "flex-start",
  },
  backBtnText: { fontSize: 15, fontWeight: "700" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  filterBtnActive: { backgroundColor: "#E8600A", borderColor: "#E8600A" },
  filterBtnText: { fontSize: 13, fontWeight: "600" },
  filterBtnTextActive: { color: "#FFF", fontWeight: "700" },
  list: { padding: 16, paddingBottom: 40 },
  emptyBox: { alignItems: "center", padding: 30 },
  emptyText: { fontSize: 14 },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  roundText: { fontSize: 12, fontWeight: "800" },
  dateText: { fontSize: 11 },
  teamsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  teamCol: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  abcCol: {},
  teamName: { fontSize: 13, fontWeight: "600", flex: 1 },
  abcName: { fontWeight: "800" },
  scoreCol: { flexDirection: "row", alignItems: "center", gap: 3 },
  score: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 22,
    textAlign: "center",
  },
  scoreWon: {},
  scoreDash: { fontSize: 16, fontWeight: "600" },
  vsCol: { fontSize: 14, fontWeight: "800" },

  searchInput: {
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },

  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    gap: 6,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
