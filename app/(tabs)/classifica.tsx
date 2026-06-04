import { StandingsTable } from "@/components/StandingsTable";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/ThemeContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type TeamFromApi = {
  id: number;
  position: number;
  team_id: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  pf: number | null;
  pa: number | null;
  diff: number | null;
  last10: string;
  streak: string;
  is_my_team: boolean;
};

type Team = {
  id: number;
  position: number;
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  pf: number | null;
  pa: number | null;
  diff: number | null;
  last10: string;
  streak: string;
  isMyTeam: boolean;
};

function mapTeam(t: TeamFromApi): Team {
  return {
    id: t.id,
    position: t.position,
    teamId: t.team_id,
    name: t.name,
    wins: t.wins,
    losses: t.losses,
    pct: t.pct,
    gb: t.gb,
    pf: t.pf,
    pa: t.pa,
    diff: t.diff,
    last10: t.last10,
    streak: t.streak,
    isMyTeam: t.is_my_team,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassificaScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  // Fade-in animation for content
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

  const fetchStandings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/standings`);
        if (!res.ok) throw new Error(`Errore ${res.status}`);
        const data = (await res.json()) as TeamFromApi[];
        setTeams(data.map(mapTeam));
        if (!isRefresh) animateIn();
      } catch (e: any) {
        setError(e.message || "Impossibile connettersi al server");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [animateIn],
  );

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const onRefresh = useCallback(() => fetchStandings(true), [fetchStandings]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
          <Text style={[styles.loadingLabel, { color: c.textSecondary }]}>Caricamento in corso…</Text>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error && teams.length === 0) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <View style={[styles.errorCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <View style={[styles.errorIconWrap, { borderColor: "rgba(240, 83, 58, 0.25)" }]}>
              <Text style={[styles.errorIcon, { color: "#F0533A" }]}>!</Text>
            </View>
            <Text style={[styles.errorTitle, { color: c.textPrimary }]}>Errore di caricamento</Text>
            <Text style={[styles.errorBody, { color: c.textSecondary }]}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchStandings()}
              style={[styles.retryBtn, { backgroundColor: c.accent }]}
              activeOpacity={0.75}
            >
              <Text style={[styles.retryBtnText, { color: "#1E293B" }]}>Riprova</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.eyebrow, { color: c.textSecondary }]}>Stagione Regolare 2025 · 26</Text>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Classifica</Text>
            <View style={[styles.livePill, { backgroundColor: "rgba(240, 83, 58, 0.15)", borderColor: "rgba(240, 83, 58, 0.25)" }]}>
              <View style={[styles.liveDot, { backgroundColor: "#F0533A" }]} />
              <Text style={[styles.liveText, { color: "#F0533A" }]}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Thin accent rule */}
        <View style={[styles.headerRule, { backgroundColor: c.border }]} />
      </Animated.View>

      {/* Table */}
      <Animated.View
        style={[
          styles.tableWrapper,
          { backgroundColor: c.bgCard, borderColor: c.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <StandingsTable
          teams={teams}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: "column",
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "nowrap",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 38,
    flexShrink: 1,
  },
  headerRule: {
    height: 1,
  },

  // ── Live pill ─────────────────────────────────────────────────────────────
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── Table wrapper ─────────────────────────────────────────────────────────
  tableWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },

  // ── Centered states ───────────────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Error card ────────────────────────────────────────────────────────────
  errorCard: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
  },
  errorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(240, 83, 58, 0.1)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  errorBody: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  retryBtn: {
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryBtnText: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
