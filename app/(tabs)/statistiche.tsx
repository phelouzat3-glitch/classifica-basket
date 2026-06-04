import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Standing = {
  position: number;
  team_id: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  pf: number;
  pa: number;
  diff: number;
  last10: string;
  streak: string;
  is_my_team: boolean;
  season: string;
};

type Analytics = {
  puntiFattiMedie: string;
  puntiSubitiMedie: string;
  recordCasa: string;
  recordTrasferta: string;
};

type PlayerStat = {
  id: number;
  name: string;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

function parseRecord(s: string): { wins: number; losses: number } {
  const parts = s.match(/(\d+)\s*V/);
  const parts2 = s.match(/(\d+)\s*S/);
  return {
    wins: parts ? Number(parts[1]) : 0,
    losses: parts2 ? Number(parts2[1]) : 0,
  };
}

function totalGames(st: Standing): number {
  return st.wins + st.losses;
}

export default function StatisticheScreen() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [sRes, aRes, pRes] = await Promise.all([
        fetch(`${API_URL}/standings`),
        fetch(`${API_URL}/standings/analytics?season=2025/26&team=Abc%20Castelfiorentino`),
        fetch(`${API_URL}/players`),
      ]);
      if (sRes.ok) setStandings(await sRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
      if (pRes.ok) setPlayers(await pRes.json());
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
  const total = myTeam ? totalGames(myTeam) : 0;

  const topScorer = [...players].sort((a, b) => b.pointsPerGame - a.pointsPerGame)[0];
  const topRebounder = [...players].sort((a, b) => b.reboundsPerGame - a.reboundsPerGame)[0];
  const topAssist = [...players].sort((a, b) => b.assistsPerGame - a.assistsPerGame)[0];

  const homeRec = analytics ? parseRecord(analytics.recordCasa) : null;
  const awayRec = analytics ? parseRecord(analytics.recordTrasferta) : null;
  const homeTotal = homeRec ? homeRec.wins + homeRec.losses : 0;
  const awayTotal = awayRec ? awayRec.wins + awayRec.losses : 0;

  if (loading && !refreshing) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E8600A" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
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
            <Text style={styles.headerTitle}>Statistiche</Text>
          </View>
          <View style={styles.posBadge}>
            <Text style={styles.posBadgeLabel}>{myTeam?.season ?? "2025/26"}</Text>
            <Text style={styles.posBadgeValue}>{myTeam?.position ?? "-"}°</Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <View style={[styles.quickCard, { borderColor: "rgba(34,197,94,0.3)" }]}>
            <Text style={[styles.quickValue, { color: "#4ADE80" }]}>{myTeam?.wins ?? 0}</Text>
            <Text style={styles.quickLabel}>Vittorie</Text>
          </View>
          <View style={[styles.quickCard, { borderColor: "rgba(248,113,113,0.3)" }]}>
            <Text style={[styles.quickValue, { color: "#F87171" }]}>{myTeam?.losses ?? 0}</Text>
            <Text style={styles.quickLabel}>Sconfitte</Text>
          </View>
          <View style={[styles.quickCard, { borderColor: "rgba(232,96,10,0.3)" }]}>
            <Text style={[styles.quickValue, { color: "#E8600A" }]}>
              {myTeam ? Math.round((myTeam.wins / total) * 100) : 0}%
            </Text>
            <Text style={styles.quickLabel}>Vittorie</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Record Casa / Trasferta</Text>
        <View style={styles.card}>
          {homeRec && (
            <View style={styles.recordRow}>
              <Text style={styles.recordLabel}>Casa</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${homeTotal > 0 ? (homeRec.wins / homeTotal) * 100 : 0}%`,
                      backgroundColor: "#22C55E",
                    },
                  ]}
                />
              </View>
              <Text style={styles.recordNumbers}>
                {homeRec.wins}V / {homeRec.losses}S
              </Text>
            </View>
          )}
          {awayRec && (
            <View style={styles.recordRow}>
              <Text style={styles.recordLabel}>Trasferta</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${awayTotal > 0 ? (awayRec.wins / awayTotal) * 100 : 0}%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
              <Text style={styles.recordNumbers}>
                {awayRec.wins}V / {awayRec.losses}S
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Punti</Text>
        <View style={styles.card}>
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Fatti</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${analytics ? Math.min(Number(analytics.puntiFattiMedie) / 1.1, 100) : 0}%`,
                    backgroundColor: "#22C55E",
                  },
                ]}
              />
            </View>
            <Text style={styles.recordNumbers}>{analytics?.puntiFattiMedie ?? "-"}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordLabel}>Subiti</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${analytics ? Math.min(Number(analytics.puntiSubitiMedie) / 1.1, 100) : 0}%`,
                    backgroundColor: "#F87171",
                  },
                ]}
              />
            </View>
            <Text style={styles.recordNumbers}>{analytics?.puntiSubitiMedie ?? "-"}</Text>
          </View>
          {myTeam && (
            <View style={[styles.recordRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.recordLabel}>Diff.</Text>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.recordNumbers,
                  { color: (myTeam.diff ?? 0) >= 0 ? "#4ADE80" : "#F87171", fontWeight: "700" },
                ]}
              >
                {(myTeam.diff ?? 0) >= 0 ? "+" : ""}{myTeam.diff}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Top Giocatori</Text>
        <View style={styles.card}>
          {topScorer && (
            <Pressable
              style={({ pressed }) => [styles.topRow, pressed && { opacity: 0.6 }]}
              onPress={() => router.push(`/player-detail?id=${topScorer.id}` as any)}
            >
              <View style={styles.topLabelWrap}>
                <View style={[styles.topDot, { backgroundColor: "#E8600A" }]}>
                  <Text style={styles.topDotText}>P</Text>
                </View>
                <Text style={styles.topName}>{topScorer.name}</Text>
              </View>
              <Text style={styles.topStat}>{topScorer.pointsPerGame.toFixed(1)} PPG</Text>
            </Pressable>
          )}
          <View style={styles.topDivider} />
          {topRebounder && (
            <Pressable
              style={({ pressed }) => [styles.topRow, pressed && { opacity: 0.6 }]}
              onPress={() => router.push(`/player-detail?id=${topRebounder.id}` as any)}
            >
              <View style={styles.topLabelWrap}>
                <View style={[styles.topDot, { backgroundColor: "#22C55E" }]}>
                  <Text style={styles.topDotText}>R</Text>
                </View>
                <Text style={styles.topName}>{topRebounder.name}</Text>
              </View>
              <Text style={styles.topStat}>{topRebounder.reboundsPerGame.toFixed(1)} RPG</Text>
            </Pressable>
          )}
          <View style={styles.topDivider} />
          {topAssist && (
            <Pressable
              style={({ pressed }) => [styles.topRow, pressed && { opacity: 0.6 }]}
              onPress={() => router.push(`/player-detail?id=${topAssist.id}` as any)}
            >
              <View style={styles.topLabelWrap}>
                <View style={[styles.topDot, { backgroundColor: "#3B82F6" }]}>
                  <Text style={styles.topDotText}>A</Text>
                </View>
                <Text style={styles.topName}>{topAssist.name}</Text>
              </View>
              <Text style={styles.topStat}>{topAssist.assistsPerGame.toFixed(1)} APG</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Ultimi 10</Text>
        <View style={styles.card}>
          <View style={styles.last10Row}>
            {myTeam?.last10?.split("-").map((part, i) => {
              const dots = Number(part);
              const isWins = i === 0;
              return (
                <View key={i} style={styles.last10Group}>
                  {Array.from({ length: dots }, (_, j) => (
                    <View
                      key={j}
                      style={[
                        styles.last10Dot,
                        { backgroundColor: isWins ? "#22C55E" : "#F87171" },
                      ]}
                    />
                  ))}
                </View>
              );
            })}
          </View>
          <Text style={styles.last10Text}>
            {myTeam?.last10 ?? "-"} · Streak: {myTeam?.streak ?? "-"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1E293B" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#F1F5F9" },
  posBadge: {
    backgroundColor: "rgba(232,96,10,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  posBadgeLabel: { fontSize: 9, color: "#64748B", fontWeight: "600", textTransform: "uppercase" },
  posBadgeValue: { fontSize: 18, fontWeight: "800", color: "#E8600A" },

  quickRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  quickCard: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  quickValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  quickLabel: { fontSize: 10, color: "#64748B", fontWeight: "500" },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#334155",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: "#475569",
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  recordLabel: { width: 60, fontSize: 13, fontWeight: "600", color: "#E2E8F0" },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  recordNumbers: { width: 60, textAlign: "right", fontSize: 13, fontWeight: "600", color: "#94A3B8" },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  topLabelWrap: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  topDot: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  topDotText: { fontSize: 11, fontWeight: "800", color: "#F1F5F9" },
  topName: { fontSize: 14, fontWeight: "600", color: "#F1F5F9" },
  topStat: { fontSize: 14, fontWeight: "700", color: "#F1F5F9" },
  topDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.05)" },

  last10Row: { flexDirection: "row", gap: 4, marginBottom: 10 },
  last10Group: { flexDirection: "row", gap: 4, alignItems: "center" },
  last10Dot: { width: 12, height: 12, borderRadius: 3 },
  last10Text: { fontSize: 13, color: "#94A3B8", textAlign: "center", fontWeight: "500" },
});
