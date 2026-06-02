import { API_URL } from "@/src/config/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Definizione del tipo dati della squadra proveniente dall'API
type TeamStats = {
  id: number;
  position: number;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  isMyTeam: boolean;
};

type TeamFromApi = {
  id: number;
  position: number;
  name: string;
  wins: number;
  losses: number;
  pct: number;
  gb: string;
  is_my_team: boolean;
};

export default function TeamDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Recupera il nome della squadra cliccata dalla classifica
  const { teamName } = useLocalSearchParams<{ teamName: string }>();
  const displayTeam = teamName || "Abc Castelfiorentino";

  // Stati per la gestione dei dati reali dal database
  const [teamData, setTeamData] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // 🌟 Funzione per recuperare i dati reali dal database
  const fetchTeamStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/standings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TeamFromApi[];

      // Cerchiamo la squadra specifica all'interno della classifica generale
      const foundTeam = data.find(
        (t) =>
          t.name &&
          displayTeam &&
          t.name.trim().toLowerCase() === displayTeam.toLowerCase(),
      );

      if (foundTeam) {
        setTeamData({
          id: foundTeam.id,
          position: foundTeam.position,
          name: foundTeam.name,
          wins: foundTeam.wins,
          losses: foundTeam.losses,
          pct: foundTeam.pct,
          gb: foundTeam.gb,
          isMyTeam: foundTeam.is_my_team,
        });
      } else {
        throw new Error("Squadra non trovata nel database");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [displayTeam]);

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  const isMyTeam =
    teamData?.isMyTeam || displayTeam.includes("Castelfiorentino");

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#E8600A" />
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
      <StatusBar style="light" />

      {/* Pulsante per tornare indietro */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Torna indietro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SCHEDA IDENTITÀ SQUADRA */}
        <View style={styles.profileCard}>
          <Text style={styles.avatarEmoji}>{isMyTeam ? "🏀" : "🛡️"}</Text>
          <Text style={styles.teamTitle}>{displayTeam}</Text>
          <Text style={styles.teamLocation}>
            {isMyTeam
              ? "📍 Castelfiorentino, Toscana"
              : "📍 Campionato Toscana"}
          </Text>
          {isMyTeam && (
            <View style={styles.badgeMyTeam}>
              <Text style={styles.badgeText}>LA NOSTRA SQUADRA</Text>
            </View>
          )}
        </View>

        {/* 2. STATISTICHE REALI DELLA STAGIONE DAL DATABASE */}
        <Text style={styles.sectionLabel}>Andamento Reale Campionato</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>#{teamData?.position || "-"}</Text>
            <Text style={styles.statTitle}>Posizione</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.winColor]}>
              {teamData?.wins ?? 0}
            </Text>
            <Text style={styles.statTitle}>Vittorie</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.lossColor]}>
              {teamData?.losses ?? 0}
            </Text>
            <Text style={styles.statTitle}>Sconfitte</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {typeof teamData?.pct === "number"
                ? teamData.pct.toFixed(3).replace("0.", ".")
                : ".000"}
            </Text>
            <Text style={styles.statTitle}>PCT</Text>
          </View>
        </View>

        {/* 3. CAMPO DI GIOCO (Mostrato solo per la nostra squadra) */}
        {isMyTeam && (
          <>
            <Text style={styles.sectionLabel}>Campo di Gioco</Text>
            <View style={styles.stadiumCard}>
              <Text style={styles.stadiumIcon}>🏟️</Text>
              <View style={styles.stadiumInfo}>
                <Text style={styles.stadiumName}>PalaGilardetti</Text>
                <Text style={styles.stadiumDetail}>
                  Complesso Sportivo Nedo Betti
                </Text>
                <Text style={styles.stadiumCap}>
                  Capienza: 500 posti • Parquet in legno
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: "#E8600A",
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 24,
  },
  avatarEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  teamLocation: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 14,
  },
  badgeMyTeam: {
    backgroundColor: "rgba(232, 96, 10, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8600A",
  },
  badgeText: {
    color: "#E8600A",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statTitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  winColor: { color: "#4CD137" },
  lossColor: { color: "#E74C3C" },
  stadiumCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    gap: 16,
  },
  stadiumIcon: {
    fontSize: 36,
  },
  stadiumInfo: {
    flex: 1,
  },
  stadiumName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  stadiumDetail: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 4,
  },
  stadiumCap: {
    fontSize: 11,
    color: "#64748B",
  },
});
