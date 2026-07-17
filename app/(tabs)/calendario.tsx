import CalendarioList from "@/components/CalendarioList";
import { LeagueBadge } from "@/components/LeagueBadge";
import { API_URL } from "@/src/config/api";
import { useTeamName, useSeason } from "@/src/context/LeagueContext";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/ThemeContext";

type MatchFromAPI = {
  id: number;
  round: number;
  date: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
  time: string;
};

type Match = {
  id: number;
  round: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isMyTeam: boolean;
  time: string;
};

function mapMatch(m: MatchFromAPI): Match {
  return {
    id: m.id,
    round: m.round,
    date: m.date,
    homeTeam: m.home_team,
    awayTeam: m.away_team,
    homeScore: m.home_score,
    awayScore: m.away_score,
    isMyTeam: m.is_my_team,
    time: m.time || "18:00", // 💡 Si l'API ne renvoie pas d'heure, on affiche "18:00" par défaut !
  };
}

export default function CalendarioScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const c = useColors();
  const teamName = useTeamName();
  const season = useSeason();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/matches?team=${encodeURIComponent(teamName)}&season=${encodeURIComponent(season)}`);
      if (res.ok) {
        const data = (await res.json()) as MatchFromAPI[];
        setMatches(data.map(mapMatch));
      }
    } catch (e: any) {
      setError(e.message || "Impossibile connettersi al server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teamName, season]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" color={c.accent} />
        <Text style={{ color: c.textMuted, marginTop: 12 }}>
          Caricamento calendario...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
          paddingTop: insets.top,
          padding: 24,
        }}
      >
        <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "bold" }}>
          Errore di rete
        </Text>
        <Text style={{ color: c.textMuted, marginTop: 8, textAlign: "center" }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <LeagueBadge />
        <Text style={[styles.title, { color: c.textPrimary }]}>Calendario</Text>
      </View>
      <View style={[styles.listContainer, { backgroundColor: c.bg }]}>
        <CalendarioList
          matches={matches}
          refreshing={refreshing}
          onRefresh={() => load(true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
});
