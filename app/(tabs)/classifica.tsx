import { StandingsTable } from "@/components/StandingsTable";
import { API_URL } from "@/src/config/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const insets = useSafeAreaInsets();

  const fetchStandings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/standings`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = (await res.json()) as TeamFromApi[];
      setTeams(data.map(mapTeam));
    } catch (e: any) {
      setError(e.message || "Errore di rete");
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

  // Schermata di caricamento (Loading) Premium
  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.mainContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Caricamento statistiche...</Text>
        </View>
      </View>
    );
  }

  // Schermata di errore a forma di scheda (Card)
  if (error && teams.length === 0) {
    return (
      <View
        style={[
          styles.mainContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Ups! Si è verificato un errore
            </Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchStandings()}
              style={styles.retryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Riprova</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Intestazione stilizzata */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Classifica</Text>
          <View style={styles.badgeLive}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Stagione Regolare 2025/2026</Text>
      </View>

      {/* Tabella della classifica */}
      <View style={styles.tableContainer}>
        <StandingsTable
          teams={teams}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0D1117", // Sfondo ultra scuro stile NBA / GitHub Dark
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#21262D",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "900", // Stile di scrittura molto spesso e aggressivo "sport"
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B949E",
    marginTop: 4,
    fontWeight: "500",
  },
  badgeLive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF453A",
    marginRight: 6,
  },
  badgeText: {
    color: "#FF453A",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#161B22", // Colore di sfondo leggermente più chiaro per la tabella
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden", // Mantiene puliti gli angoli arrotondati
    borderWidth: 1,
    borderColor: "#21262D",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: "#8B949E",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  errorCard: {
    backgroundColor: "#161B22",
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.2)",
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "#8B949E",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B00", // Arancione basket dinamico
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
