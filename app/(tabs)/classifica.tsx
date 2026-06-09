import { StandingsTable } from "@/components/StandingsTable";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/theme";
import { useHorizontalSwipe } from "@/src/hooks/useHorizontalSwipe";
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
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [classificaExpanded, setClassificaExpanded] = useState(false);
  const [searchText, setSearchText] = useState("");

  const insets = useSafeAreaInsets();

  // Fade-in animation for content
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  const { panHandlers } = useHorizontalSwipe();

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

  // Pulse animation for live dot
  useEffect(() => {
    if (liveEnabled) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [liveEnabled, pulseAnim]);

  // Update `now` every second for live clock
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const d = new Date(now);
  const liveTimeLabel = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

  const onRefresh = useCallback(() => fetchStandings(true), [fetchStandings]);

  const filteredTeams = useMemo(() => {
    if (!searchText.trim()) return teams;
    const q = searchText.trim();
    return teams.filter(
      (t) =>
        t.position.toString().includes(q) ||
        t.name.toLowerCase().includes(q.toLowerCase()),
    );
  }, [teams, searchText]);

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
      {...panHandlers}
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
            <View style={styles.liveRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => setLiveEnabled((p) => !p)}
                activeOpacity={0.7}
                style={[
                  styles.livePill,
                  {
                    backgroundColor: liveEnabled ? "rgba(34, 197, 94, 0.15)" : "rgba(240, 83, 58, 0.15)",
                    borderColor: liveEnabled ? "rgba(34, 197, 94, 0.25)" : "rgba(240, 83, 58, 0.25)",
                  },
                ]}
              >
                <Animated.View style={[styles.liveDot, { backgroundColor: liveEnabled ? "#22C55E" : "#F0533A", opacity: liveEnabled ? pulseAnim : 1 }]} />
                <Text style={[styles.liveText, { color: liveEnabled ? "#22C55E" : "#F0533A" }]}>
                  {liveEnabled ? `LIVE ${liveTimeLabel}` : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.eyebrow, { color: c.textSecondary }]}>Stagione Regolare 2025 · 26</Text>
            <Text style={[styles.pageTitle, { color: c.textPrimary }]}>Classifica</Text>
          </View>

        {/* Thin accent rule */}
        <View style={[styles.headerRule, { backgroundColor: c.border }]} />
      </Animated.View>

      {/* Search */}
      <View style={{ paddingHorizontal: 22, marginTop: 14, marginBottom: 4 }}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: c.bg, color: c.textPrimary, borderColor: c.border }]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Cerca posizione o squadra..."
          placeholderTextColor={c.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
      </View>

      {/* Table */}
      <Animated.View
        style={[
          styles.tableWrapper,
          { backgroundColor: c.bgCard, borderColor: c.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <StandingsTable
          teams={classificaExpanded ? filteredTeams : filteredTeams.slice(0, 5)}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
        {filteredTeams.length > 5 && !searchText.trim() && (
          <TouchableOpacity
            style={[styles.expandBtn, { borderTopColor: c.border }]}
            onPress={() => setClassificaExpanded(!classificaExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.expandBtnText, { color: c.accent }]}>
              {classificaExpanded ? "Mostra meno" : `Mostra tutte (${filteredTeams.length})`}
            </Text>
          </TouchableOpacity>
        )}
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
    textAlign: "center",
    flexShrink: 1,
  },
  headerRule: {
    height: 1,
  },

  // ── Live pill ─────────────────────────────────────────────────────────────
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 90,
    justifyContent: "center",
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 7,
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
  searchInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },

  expandBtn: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: "700",
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
