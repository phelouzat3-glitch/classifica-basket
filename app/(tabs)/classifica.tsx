import { StandingsTable } from "@/components/StandingsTable";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Usiamo questo hook moderno al posto del vecchio SafeAreaView
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TeamFromApi = {
  id: number;
  position: number;
  team_id: string;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
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
    last10: t.last10,
    streak: t.streak,
    isMyTeam: t.is_my_team,
  };
}

export default function ClassificaScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Questo hook calcola lo spazio esatto occupato dalla barra di stato (ora, rete, notch)
  const insets = useSafeAreaInsets();

  const fetchStandings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/standings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TeamFromApi[];
      setTeams(data.map(mapTeam));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const onRefresh = useCallback(() => {
    fetchStandings(true);
  }, [fetchStandings]);

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.mainContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E8600A" />
        </View>
      </View>
    );
  }

  if (error && teams.length === 0) {
    return (
      <View
        style={[
          styles.mainContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Errore di caricamento: {error}</Text>
          <TouchableOpacity
            onPress={() => fetchStandings()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    // Applichiamo dinamicamente i margini di sicurezza per non sovrapporci all'ora del telefono
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.pageTitle}>Classifica</Text>
      <StandingsTable
        teams={teams}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A242D",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#E8600A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
