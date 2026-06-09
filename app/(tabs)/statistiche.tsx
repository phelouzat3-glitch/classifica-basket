import { API_URL } from "@/src/config/api";
import { getPlayerImage } from "@/src/config/playerImages";
import { useColors } from "@/src/theme/ThemeContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
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
  jerseyNumber: number;
  photoUrl: string | null;
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

  const c = useColors();

  const insets = useSafeAreaInsets();
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

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [sRes, aRes, pRes] = await Promise.all([
          fetch(`${API_URL}/standings`),
          fetch(
            `${API_URL}/standings/analytics?season=2025/26&team=Abc%20Castelfiorentino`,
          ),
          fetch(`${API_URL}/players`),
        ]);
        if (sRes.ok) setStandings(await sRes.json());
        if (aRes.ok) setAnalytics(await aRes.json());
        if (pRes.ok) setPlayers(await pRes.json());
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
  const total = myTeam ? totalGames(myTeam) : 0;

  const topScorer = [...players].sort(
    (a, b) => b.pointsPerGame - a.pointsPerGame,
  )[0];
  const topRebounder = [...players].sort(
    (a, b) => b.reboundsPerGame - a.reboundsPerGame,
  )[0];
  const topAssist = [...players].sort(
    (a, b) => b.assistsPerGame - a.assistsPerGame,
  )[0];

  const homeRec = analytics ? parseRecord(analytics.recordCasa) : null;
  const awayRec = analytics ? parseRecord(analytics.recordTrasferta) : null;
  const homeTotal = homeRec ? homeRec.wins + homeRec.losses : 0;
  const awayTotal = awayRec ? awayRec.wins + awayRec.losses : 0;

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: c.bg,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E8600A" />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: c.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
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
            <Text style={[styles.headerSub, { color: c.textMuted }]}>
              ABC Castelfiorentino
            </Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
              Statistiche
            </Text>
          </View>
          <View
            style={[
              styles.posBadge,
              { backgroundColor: c.accent + "1F", borderColor: c.border },
            ]}
          >
            <Text style={[styles.posBadgeLabel, { color: c.textMuted }]}>
              {myTeam?.season ?? "2025/26"}
            </Text>
            <Text style={[styles.posBadgeValue, { color: c.accent }]}>
              {myTeam?.position ?? "-"}°
            </Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <View
            style={[
              styles.quickCard,
              { backgroundColor: c.bgCard, borderColor: "rgba(34,197,94,0.3)" },
            ]}
          >
            <Text style={[styles.quickValue, { color: "#4ADE80" }]}>
              {myTeam?.wins ?? 0}
            </Text>
            <Text style={[styles.quickLabel, { color: c.textMuted }]}>
              Vittorie
            </Text>
          </View>
          <View
            style={[
              styles.quickCard,
              {
                backgroundColor: c.bgCard,
                borderColor: "rgba(248,113,113,0.3)",
              },
            ]}
          >
            <Text style={[styles.quickValue, { color: "#F87171" }]}>
              {myTeam?.losses ?? 0}
            </Text>
            <Text style={[styles.quickLabel, { color: c.textMuted }]}>
              Sconfitte
            </Text>
          </View>
          <View
            style={[
              styles.quickCard,
              { backgroundColor: c.bgCard, borderColor: c.accent },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={[styles.quickValue, { color: c.accent }]}>
                {myTeam ? Math.round((myTeam.wins / total) * 100) : 0}
              </Text>
              <Text style={[styles.quickValue, { color: c.accent, fontSize: 16 }]}>
                %
              </Text>
            </View>
            <Text style={[styles.quickLabel, { color: c.textMuted }]}>
              Vittorie
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
          Record Casa / Trasferta
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
          {homeRec && (
            <View style={[styles.recordRow, { borderBottomColor: c.border }]}>
              <Text style={[styles.recordLabel, { color: c.textPrimary }]}>
                Casa
              </Text>
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
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
              <Text style={[styles.recordNumbers, { color: c.textMuted }]}>
                {homeRec.wins}V/{homeRec.losses}S
              </Text>
            </View>
          )}
          {awayRec && (
            <View style={[styles.recordRow, { borderBottomColor: c.border }]}>
              <Text style={[styles.recordLabel, { color: c.textPrimary }]}>
                Trasferta
              </Text>
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
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
              <Text style={[styles.recordNumbers, { color: c.textMuted }]}>
                {awayRec.wins}V/{awayRec.losses}S
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Punti</Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
          <View style={[styles.recordRow, { borderBottomColor: c.border }]}>
            <Text style={[styles.recordLabel, { color: c.textPrimary }]}>
              Fatti
            </Text>
            <View
              style={[
                styles.barTrack,
                { backgroundColor: "rgba(255,255,255,0.06)" },
              ]}
            >
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
            <Text style={[styles.recordNumbers, { color: c.textMuted }]}>
              {analytics?.puntiFattiMedie ?? "-"}
            </Text>
          </View>
          <View style={[styles.recordRow, { borderBottomColor: c.border }]}>
            <Text style={[styles.recordLabel, { color: c.textPrimary }]}>
              Subiti
            </Text>
            <View
              style={[
                styles.barTrack,
                { backgroundColor: "rgba(255,255,255,0.06)" },
              ]}
            >
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
            <Text style={[styles.recordNumbers, { color: c.textMuted }]}>
              {analytics?.puntiSubitiMedie ?? "-"}
            </Text>
          </View>
          {myTeam && (
            <View style={[styles.recordRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.recordLabel, { color: c.textPrimary }]}>
                Diff.
              </Text>
              <View style={{ flex: 1 }} />
              <Text
                style={[
                  styles.recordNumbers,
                  {
                    color: (myTeam.diff ?? 0) >= 0 ? "#4ADE80" : "#F87171",
                    fontWeight: "700",
                  },
                ]}
              >
                {(myTeam.diff ?? 0) >= 0 ? "+" : ""}
                {myTeam.diff}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
          Top Giocatori
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
          {topScorer && (
            <Pressable
              style={({ pressed }) => [
                styles.topRow,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() =>
                router.push(`/player-detail?id=${topScorer.id}` as any)
              }
            >
              <View style={styles.topLabelWrap}>
                {(() => {
                  const img = getPlayerImage(topScorer.name);
                  return img ? (
                    <Image source={img} style={styles.topPlayerThumb} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.topJerseyBadge, { backgroundColor: c.accent + "18", borderColor: c.accent + "30" }]}>
                      <Text style={[styles.topJerseyText, { color: c.accent }]}>{topScorer.jerseyNumber}</Text>
                    </View>
                  );
                })()}
                <Text style={[styles.topName, { color: c.textPrimary }]}>
                  {topScorer.name}
                </Text>
              </View>
              <Text style={[styles.topStat, { color: c.textPrimary }]}>
                {topScorer.pointsPerGame.toFixed(1)} PPG
              </Text>
            </Pressable>
          )}
          <View style={[styles.topDivider, { backgroundColor: c.border }]} />
          {topRebounder && (
            <Pressable
              style={({ pressed }) => [
                styles.topRow,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() =>
                router.push(`/player-detail?id=${topRebounder.id}` as any)
              }
            >
              <View style={styles.topLabelWrap}>
                {(() => {
                  const img = getPlayerImage(topRebounder.name);
                  return img ? (
                    <Image source={img} style={styles.topPlayerThumb} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.topJerseyBadge, { backgroundColor: "#22C55E" + "18", borderColor: "#22C55E" + "30" }]}>
                      <Text style={[styles.topJerseyText, { color: "#22C55E" }]}>{topRebounder.jerseyNumber}</Text>
                    </View>
                  );
                })()}
                <Text style={[styles.topName, { color: c.textPrimary }]}>
                  {topRebounder.name}
                </Text>
              </View>
              <Text style={[styles.topStat, { color: c.textPrimary }]}>
                {topRebounder.reboundsPerGame.toFixed(1)} RPG
              </Text>
            </Pressable>
          )}
          <View style={[styles.topDivider, { backgroundColor: c.border }]} />
          {topAssist && (
            <Pressable
              style={({ pressed }) => [
                styles.topRow,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() =>
                router.push(`/player-detail?id=${topAssist.id}` as any)
              }
            >
              <View style={styles.topLabelWrap}>
                {(() => {
                  const img = getPlayerImage(topAssist.name);
                  return img ? (
                    <Image source={img} style={styles.topPlayerThumb} contentFit="cover" transition={200} />
                  ) : (
                    <View style={[styles.topJerseyBadge, { backgroundColor: "#3B82F6" + "18", borderColor: "#3B82F6" + "30" }]}>
                      <Text style={[styles.topJerseyText, { color: "#3B82F6" }]}>{topAssist.jerseyNumber}</Text>
                    </View>
                  );
                })()}
                <Text style={[styles.topName, { color: c.textPrimary }]}>
                  {topAssist.name}
                </Text>
              </View>
              <Text style={[styles.topStat, { color: c.textPrimary }]}>
                {topAssist.assistsPerGame.toFixed(1)} APG
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
          Ultimi 10
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
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
          <Text style={[styles.last10Text, { color: c.textMuted }]}>
            {myTeam?.last10 ?? "-"} · Streak: {myTeam?.streak ?? "-"}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.analyticsBtn,
            { backgroundColor: c.accentBg, borderColor: c.accentBorder },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.push("/analytics-squadra" as any)}
        >
          <Text style={[styles.analyticsBtnText, { color: c.accent }]}>
            Analisi completa squadra →
          </Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: { fontSize: 12, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  posBadge: {
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  posBadgeLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },
  posBadgeValue: { fontSize: 18, fontWeight: "800" },

  quickRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  quickCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  quickValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  quickLabel: { fontSize: 10, fontWeight: "500" },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
  },

  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  recordLabel: { width: 76, fontSize: 13, fontWeight: "600" },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  recordNumbers: {
    width: 60,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  topLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  topPlayerThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  topJerseyBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topJerseyText: { fontSize: 12, fontWeight: "900" },
  topName: { fontSize: 14, fontWeight: "600" },
  topStat: { fontSize: 14, fontWeight: "700" },
  topDivider: { height: 0.5 },

  last10Row: { flexDirection: "row", gap: 4, marginBottom: 10 },
  last10Group: { flexDirection: "row", gap: 4, alignItems: "center" },
  last10Dot: { width: 12, height: 12, borderRadius: 3 },
  last10Text: { fontSize: 13, textAlign: "center", fontWeight: "500" },

  analyticsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  analyticsBtnText: { fontSize: 14, fontWeight: "700" },
});
