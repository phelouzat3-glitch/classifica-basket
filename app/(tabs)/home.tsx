import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

Dimensions.get("window");

type Standing = {
  position: number;
  team_id: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  last10: string;
  streak: string;
  is_my_team: boolean;
  season: string;
  pf: number;
  pa: number;
  diff: number;
};

type Match = {
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function HomeTabScreen() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [sRes, mRes] = await Promise.all([
          fetch(`${API_URL}/standings`),
          fetch(`${API_URL}/matches?limit=50`),
        ]);
        if (sRes.ok) setStandings(await sRes.json());
        if (mRes.ok) setMatches(await mRes.json());
        if (!isRefresh) animateIn();
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [animateIn],
  );

  useEffect(() => {
    load();
  }, [load]);

  const myTeam = standings.find((s) => s.is_my_team);
  const top5 = standings
    .filter((s) => !s.is_my_team)
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);

  const myMatches = matches
    .filter((m) => m.is_my_team)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const wins = myTeam?.wins ?? 0;
  const losses = myTeam?.losses ?? 0;
  const total = wins + losses;
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;

  const nextMatch = matches
    .filter((m) => m.home_score === null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!nextMatch) return;
    const update = () => {
      const now = new Date();
      const matchDate = new Date(nextMatch.date + "T" + (nextMatch.time ?? "20:30") + ":00");
      const diff = matchDate.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft(null); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days}g ${hours}h ${minutes}m ${seconds}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextMatch]);

  return (
    <Animated.View
      style={[
        { flex: 1, backgroundColor: c.bg },
        {
          paddingTop: insets.top,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSub, { color: c.textMuted }]}>
              ABC Castelfiorentino
            </Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
              Stagione {myTeam?.season ?? "2025/26"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [
                styles.notifBtn,
                { backgroundColor: c.accentBg, borderColor: c.accentBorder },
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => router.push("/notifiche" as any)}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={c.accent}
              />
            </Pressable>
            <View
              style={[
                styles.posBadge,
                { backgroundColor: c.accentBg, borderColor: c.accentBorder },
              ]}
            >
              <Text style={[styles.posBadgeLabel, { color: c.textMuted }]}>
                Classifica
              </Text>
              <Text style={[styles.posBadgeValue, { color: c.accent }]}>
                {myTeam?.position ?? "-"}°
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: c.bgCard, borderColor: c.border },
            ]}
          >
            <Text style={[styles.summaryValue, { color: c.textPrimary }]}>
              {wins}
            </Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              Vittorie
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: c.bgCard, borderColor: c.border },
            ]}
          >
            <Text style={[styles.summaryValue, { color: c.textPrimary }]}>
              {losses}
            </Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              Sconfitte
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              styles.summaryCardAccent,
              { backgroundColor: c.accentBg, borderColor: c.accentBorder },
            ]}
          >
            <Text style={[styles.summaryValue, { color: c.accent }]}>
              {winPct}%
            </Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              Vittorie
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              styles.summaryCardAccent,
              { backgroundColor: c.accentBg, borderColor: c.accentBorder },
            ]}
          >
            <Text style={[styles.summaryValue, { color: c.win }]}>
              {myTeam?.streak ?? "-"}
            </Text>
            <Text style={[styles.summaryLabel, { color: c.textMuted }]}>
              Streak
            </Text>
          </View>
        </View>

        {nextMatch && timeLeft && (
          <Pressable
            style={[styles.countdownCard, { backgroundColor: c.accentBg, borderColor: c.accentBorder }]}
            onPress={() => router.push("/(tabs)/calendario" as any)}
          >
            <Text style={[styles.countdownLabel, { color: c.accent }]}>
              Prossima partita
            </Text>
            <Text style={[styles.countdownDate, { color: c.textPrimary }]}>
              {nextMatch.home_team === "Abc Castelfiorentino"
                ? `${nextMatch.away_team} (Casa)`
                : `${nextMatch.home_team} (Trasferta)`}
            </Text>
            <Text style={[styles.countdownTimer, { color: c.accent }]}>
              {timeLeft}
            </Text>
          </Pressable>
        )}

        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
          Classifica
        </Text>

        <View
          style={[
            styles.tableHeader,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
          <Text
            style={[styles.tableCell, styles.colPos, { color: c.textMuted }]}
          >
            #
          </Text>
          <Text
            style={[styles.tableCell, styles.colName, { color: c.textMuted }]}
          >
            Squadra
          </Text>
          <Text style={[styles.tableCell, styles.colW, { color: c.textMuted }]}>
            V
          </Text>
          <Text style={[styles.tableCell, styles.colL, { color: c.textMuted }]}>
            S
          </Text>
          <Text
            style={[styles.tableCell, styles.colPct, { color: c.textMuted }]}
          >
            %
          </Text>
        </View>

        <View
          style={[
            styles.myTeamRow,
            { backgroundColor: c.accentBg, borderColor: c.accentBorder },
          ]}
        >
          <Text
            style={[
              styles.tableCell,
              styles.colPos,
              styles.myTeamText,
              { color: c.accent },
            ]}
          >
            {myTeam?.position ?? "-"}
          </Text>
          <View style={styles.standNameRow}>
            <TeamLogo teamName="ABC Castelfiorentino" size={18} />
            <Text
              style={[
                styles.tableCell,
                styles.colName,
                styles.myTeamText,
                { color: c.accent },
              ]}
            >
              ABC Castelfiorentino
            </Text>
          </View>
          <Text
            style={[
              styles.tableCell,
              styles.colW,
              styles.myTeamText,
              { color: c.accent },
            ]}
          >
            {myTeam?.wins ?? 0}
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.colL,
              styles.myTeamText,
              { color: c.accent },
            ]}
          >
            {myTeam?.losses ?? 0}
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.colPct,
              styles.myTeamText,
              { color: c.accent },
            ]}
          >
            {(myTeam?.pct ?? 0 * 100).toString().replace(".", ",").slice(0, 4)}
          </Text>
        </View>

        {top5.map((t) => (
          <View
            key={t.team_id}
            style={[
              styles.standRow,
              { backgroundColor: c.bg, borderBottomColor: c.bgOverlay },
            ]}
          >
            <Text
              style={[
                styles.tableCell,
                styles.colPos,
                styles.standText,
                { color: c.textSecondary },
              ]}
            >
              {t.position}
            </Text>
            <View style={styles.standNameRow}>
              <TeamLogo teamName={t.name} size={18} />
              <Text
                style={[
                  styles.tableCell,
                  styles.colName,
                  styles.standText,
                  { color: c.textSecondary },
                ]}
              >
                {t.name}
              </Text>
            </View>
            <Text
              style={[
                styles.tableCell,
                styles.colW,
                styles.standText,
                { color: c.textSecondary },
              ]}
            >
              {t.wins}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colL,
                styles.standText,
                { color: c.textSecondary },
              ]}
            >
              {t.losses}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.colPct,
                styles.standText,
                { color: c.textSecondary },
              ]}
            >
              {(t.pct * 100).toFixed(1).replace(".", ",")}
            </Text>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.viewAllBtn,
            { backgroundColor: c.bgCard, borderColor: c.accentBorder },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.push("/classifica" as any)}
        >
          <Text style={[styles.viewAllBtnText, { color: c.accent }]}>
            Vedi classifica completa
          </Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
          Ultimi risultati
        </Text>

        {myMatches.map((m) => {
          const isHome = m.home_team.startsWith("Abc");
          const opponent = isHome ? m.away_team : m.home_team;
          const ourScore = isHome ? m.home_score : m.away_score;
          const oppScore = isHome ? m.away_score : m.home_score;
          const won =
            ourScore != null && oppScore != null && ourScore > oppScore;

          return (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                styles.matchRow,
                { backgroundColor: c.bgCard, borderColor: c.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push(`/partite` as any)}
            >
              <View
                style={[
                  styles.outcomeBadge,
                  won
                    ? { backgroundColor: c.winBg }
                    : { backgroundColor: c.lossBg },
                ]}
              >
                <Text
                  style={[
                    styles.outcomeText,
                    won ? { color: c.win } : { color: c.loss },
                  ]}
                >
                  {won ? "V" : "S"}
                </Text>
              </View>
              <View style={styles.matchLogoWrap}>
                <TeamLogo teamName={opponent} size={22} />
              </View>
              <View style={styles.matchInfo}>
                <Text
                  style={[styles.matchOpponent, { color: c.textPrimary }]}
                  numberOfLines={1}
                >
                  {isHome ? "ABC vs " : ""}
                  {opponent.replace(/^abc /i, "").replace(/^basket /i, "")}
                  {!isHome ? " · ABC" : ""}
                </Text>
                <Text style={[styles.matchMeta, { color: c.textMuted }]}>
                  {formatDate(m.date)} · {m.round}ª g.
                </Text>
              </View>
              <Text
                style={[
                  styles.matchScore,
                  won && { color: c.win },
                  !won && { color: c.textPrimary },
                ]}
              >
                {ourScore ?? "?"}-{oppScore ?? "?"}
              </Text>
            </Pressable>
          );
        })}

        {myTeam && (
          <View
            style={[
              styles.statsBox,
              { backgroundColor: c.bgCard, borderColor: c.border },
            ]}
          >
            <View style={styles.statsBoxRow}>
              <View style={styles.statsBoxItem}>
                <Text style={[styles.statsBoxLabel, { color: c.textMuted }]}>
                  Punti fatti
                </Text>
                <Text style={[styles.statsBoxValue, { color: c.textPrimary }]}>
                  {(myTeam.pf / total).toFixed(1)}
                </Text>
                <Text style={[styles.statsBoxSub, { color: c.textMuted }]}>
                  a partita
                </Text>
              </View>
              <View
                style={[styles.statsBoxDivider, { backgroundColor: c.border }]}
              />
              <View style={styles.statsBoxItem}>
                <Text style={[styles.statsBoxLabel, { color: c.textMuted }]}>
                  Punti subiti
                </Text>
                <Text style={[styles.statsBoxValue, { color: c.textPrimary }]}>
                  {(myTeam.pa / total).toFixed(1)}
                </Text>
                <Text style={[styles.statsBoxSub, { color: c.textMuted }]}>
                  a partita
                </Text>
              </View>
              <View
                style={[styles.statsBoxDivider, { backgroundColor: c.border }]}
              />
              <View style={styles.statsBoxItem}>
                <Text style={[styles.statsBoxLabel, { color: c.textMuted }]}>
                  Differenza
                </Text>
                <Text
                  style={[
                    styles.statsBoxValue,
                    { color: (myTeam.diff ?? 0) >= 0 ? c.win : c.loss },
                  ]}
                >
                  {(myTeam.diff ?? 0 >= 0) ? "+" : ""}
                  {myTeam.diff}
                </Text>
                <Text style={[styles.statsBoxSub, { color: c.textMuted }]}>
                  totale
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: { fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
  },
  posBadge: {
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  posBadgeLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  posBadgeValue: { fontSize: 18, fontWeight: "800" },

  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 0.5,
  },
  summaryCardAccent: {
    borderWidth: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 1,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 0.5,
  },
  tableCell: { fontSize: 11, fontWeight: "700" },
  colPos: { width: 28, textAlign: "center" },
  colName: { flex: 1 },
  colW: { width: 24, textAlign: "center" },
  colL: { width: 24, textAlign: "center" },
  colPct: { width: 40, textAlign: "right" },

  myTeamRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 0.5,
  },
  myTeamText: { fontSize: 12 },

  standNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  matchLogoWrap: { width: 28, alignItems: "center" },
  standRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
  },
  standText: { fontSize: 12 },

  viewAllBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
    borderWidth: 0.5,
  },
  viewAllBtnText: { fontSize: 13, fontWeight: "600" },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
  },
  outcomeBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  outcomeText: { fontSize: 13, fontWeight: "700" },
  matchInfo: { flex: 1 },
  matchOpponent: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  matchMeta: { fontSize: 11 },
  matchScore: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  statsBox: {
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 0.5,
  },
  statsBoxRow: { flexDirection: "row", alignItems: "center" },
  statsBoxItem: { flex: 1, alignItems: "center" },
  statsBoxDivider: {
    width: 1,
    height: 36,
  },
  statsBoxLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statsBoxValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  statsBoxSub: { fontSize: 9, fontWeight: "500" },

  countdownCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  countdownLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  countdownDate: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  countdownTimer: { fontSize: 28, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
