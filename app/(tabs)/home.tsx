import { TeamLogo } from "@/components/TeamLogo";
import { API_URL } from "@/src/config/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
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

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [sRes, mRes] = await Promise.all([
        fetch(`${API_URL}/standings`),
        fetch(`${API_URL}/matches?limit=50`),
      ]);
      if (sRes.ok) setStandings(await sRes.json());
      if (mRes.ok) setMatches(await mRes.json());
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
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
            tintColor="#E8600A"
            colors={["#E8600A"]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>ABC Castelfiorentino</Text>
            <Text style={styles.headerTitle}>
              Stagione {myTeam?.season ?? "2025/26"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [styles.notifBtn, pressed && { opacity: 0.6 }]}
              onPress={() => router.push("/notifiche" as any)}
            >
              <Ionicons name="notifications-outline" size={22} color="#E8600A" />
            </Pressable>
            <View style={styles.posBadge}>
              <Text style={styles.posBadgeLabel}>Classifica</Text>
              <Text style={styles.posBadgeValue}>
                {myTeam?.position ?? "-"}°
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{wins}</Text>
            <Text style={styles.summaryLabel}>Vittorie</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{losses}</Text>
            <Text style={styles.summaryLabel}>Sconfitte</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardAccent]}>
            <Text style={[styles.summaryValue, { color: "#E8600A" }]}>
              {winPct}%
            </Text>
            <Text style={styles.summaryLabel}>Vittorie</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardAccent]}>
            <Text style={[styles.summaryValue, { color: "#22C55E" }]}>
              {myTeam?.streak ?? "-"}
            </Text>
            <Text style={styles.summaryLabel}>Streak</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Classifica</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.colPos]}>#</Text>
          <Text style={[styles.tableCell, styles.colName]}>Squadra</Text>
          <Text style={[styles.tableCell, styles.colW]}>V</Text>
          <Text style={[styles.tableCell, styles.colL]}>S</Text>
          <Text style={[styles.tableCell, styles.colPct]}>%</Text>
        </View>

        <View style={styles.myTeamRow}>
          <Text style={[styles.tableCell, styles.colPos, styles.myTeamText]}>
            {myTeam?.position ?? "-"}
          </Text>
          <View style={styles.standNameRow}>
            <TeamLogo teamName="ABC Castelfiorentino" size={18} />
            <Text style={[styles.tableCell, styles.colName, styles.myTeamText]}>
              ABC Castelfiorentino
            </Text>
          </View>
          <Text style={[styles.tableCell, styles.colW, styles.myTeamText]}>
            {myTeam?.wins ?? 0}
          </Text>
          <Text style={[styles.tableCell, styles.colL, styles.myTeamText]}>
            {myTeam?.losses ?? 0}
          </Text>
          <Text style={[styles.tableCell, styles.colPct, styles.myTeamText]}>
            {(myTeam?.pct ?? 0 * 100).toString().replace(".", ",").slice(0, 4)}
          </Text>
        </View>

        {top5.map((t) => (
          <View key={t.team_id} style={styles.standRow}>
            <Text style={[styles.tableCell, styles.colPos, styles.standText]}>
              {t.position}
            </Text>
            <View style={styles.standNameRow}>
              <TeamLogo teamName={t.name} size={18} />
              <Text style={[styles.tableCell, styles.colName, styles.standText]}>
                {t.name}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.colW, styles.standText]}>
              {t.wins}
            </Text>
            <Text style={[styles.tableCell, styles.colL, styles.standText]}>
              {t.losses}
            </Text>
            <Text style={[styles.tableCell, styles.colPct, styles.standText]}>
              {(t.pct * 100).toFixed(1).replace(".", ",")}
            </Text>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.viewAllBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.push("/classifica" as any)}
        >
          <Text style={styles.viewAllBtnText}>Vedi classifica completa</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Ultimi risultati</Text>

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
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push(`/partite` as any)}
            >
              <View
                style={[
                  styles.outcomeBadge,
                  won ? styles.winBadge : styles.lossBadge,
                ]}
              >
                <Text
                  style={[
                    styles.outcomeText,
                    won ? styles.winText : styles.lossText,
                  ]}
                >
                  {won ? "V" : "S"}
                </Text>
              </View>
              <View style={styles.matchLogoWrap}>
                <TeamLogo teamName={opponent} size={22} />
              </View>
              <View style={styles.matchInfo}>
                <Text style={styles.matchOpponent} numberOfLines={1}>
                  {isHome ? "ABC vs " : ""}
                  {opponent.replace(/^abc /i, "").replace(/^basket /i, "")}
                  {!isHome ? " · ABC" : ""}
                </Text>
                <Text style={styles.matchMeta}>
                  {formatDate(m.date)} · {m.round}ª g.
                </Text>
              </View>
              <Text style={[styles.matchScore, won && { color: "#4ADE80" }]}>
                {ourScore ?? "?"}-{oppScore ?? "?"}
              </Text>
            </Pressable>
          );
        })}

        {myTeam && (
          <View style={styles.statsBox}>
            <View style={styles.statsBoxRow}>
              <View style={styles.statsBoxItem}>
                <Text style={styles.statsBoxLabel}>Punti fatti</Text>
                <Text style={styles.statsBoxValue}>
                  {(myTeam.pf / total).toFixed(1)}
                </Text>
                <Text style={styles.statsBoxSub}>a partita</Text>
              </View>
              <View style={styles.statsBoxDivider} />
              <View style={styles.statsBoxItem}>
                <Text style={styles.statsBoxLabel}>Punti subiti</Text>
                <Text style={styles.statsBoxValue}>
                  {(myTeam.pa / total).toFixed(1)}
                </Text>
                <Text style={styles.statsBoxSub}>a partita</Text>
              </View>
              <View style={styles.statsBoxDivider} />
              <View style={styles.statsBoxItem}>
                <Text style={styles.statsBoxLabel}>Differenza</Text>
                <Text
                  style={[
                    styles.statsBoxValue,
                    { color: (myTeam.diff ?? 0) >= 0 ? "#4ADE80" : "#F87171" },
                  ]}
                >
                  {(myTeam.diff ?? 0 >= 0) ? "+" : ""}
                  {myTeam.diff}
                </Text>
                <Text style={styles.statsBoxSub}>totale</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(232,96,10,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.2)",
  },
  posBadge: {
    backgroundColor: "rgba(232,96,10,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  posBadgeLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  posBadgeValue: { fontSize: 18, fontWeight: "800", color: "#E8600A" },

  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  summaryCardAccent: {
    backgroundColor: "rgba(232,96,10,0.06)",
    borderColor: "rgba(232,96,10,0.15)",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 1,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
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
    backgroundColor: "rgba(232,96,10,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.3)",
  },
  myTeamText: { color: "#E8600A", fontSize: 12 },

  standNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  matchLogoWrap: { width: 28, alignItems: "center" },
  standRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  standText: { color: "#4B5563", fontSize: 12 },

  viewAllBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.2)",
  },
  viewAllBtnText: { color: "#E8600A", fontSize: 13, fontWeight: "600" },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  outcomeBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  winBadge: { backgroundColor: "#DCFCE7" },
  lossBadge: { backgroundColor: "#FEE2E2" },
  outcomeText: { fontSize: 13, fontWeight: "700" },
  winText: { color: "#059669" },
  lossText: { color: "#DC2626" },
  matchInfo: { flex: 1 },
  matchOpponent: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  matchMeta: { fontSize: 11, color: "#9CA3AF" },
  matchScore: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },

  statsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  statsBoxRow: { flexDirection: "row", alignItems: "center" },
  statsBoxItem: { flex: 1, alignItems: "center" },
  statsBoxDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  statsBoxLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statsBoxValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  statsBoxSub: { fontSize: 9, color: "#9CA3AF", fontWeight: "500" },
});
