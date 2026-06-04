import { API_URL } from "@/src/config/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/ThemeContext";

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
  const c = useColors();

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
      <View style={[styles.mainContainer, styles.centerContainer, { backgroundColor: c.bg }]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
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
          <Text style={[styles.backButtonText, { color: c.accent }]}>← Torna indietro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SCHEDA IDENTITÀ SQUADRA */}
        <View style={[styles.profileCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={styles.avatarEmoji}>{isMyTeam ? "🏀" : "🛡️"}</Text>
          <Text style={[styles.teamTitle, { color: c.textPrimary }]}>{displayTeam}</Text>
          <Text style={[styles.teamLocation, { color: c.textSecondary }]}>
            {isMyTeam
              ? "📍 Castelfiorentino, Toscana"
              : "📍 Campionato Toscana"}
          </Text>
          {isMyTeam && (
            <View style={[styles.badgeMyTeam, { backgroundColor: c.accentBg, borderColor: c.accentBorder }]}>
              <Text style={[styles.badgeText, { color: c.accent }]}>LA NOSTRA SQUADRA</Text>
            </View>
          )}
        </View>

        {/* 2. STATISTICHE REALI DELLA STAGIONE DAL DATABASE */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Andamento Reale Campionato</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: c.textPrimary }]}>#{teamData?.position || "-"}</Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>Posizione</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: "#4CD137" }]}>
              {teamData?.wins ?? 0}
            </Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>Vittorie</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: "#E74C3C" }]}>
              {teamData?.losses ?? 0}
            </Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>Sconfitte</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: c.textPrimary }]}>
              {typeof teamData?.pct === "number"
                ? teamData.pct.toFixed(3).replace("0.", ".")
                : ".000"}
            </Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>PCT</Text>
          </View>
        </View>

        {/* 3. CAMPO DI GIOCO (Mostrato solo per la nostra squadra) */}
        {isMyTeam && (
          <>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Campo di Gioco</Text>
            <View style={[styles.stadiumCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <Text style={styles.stadiumIcon}>🏟️</Text>
              <View style={styles.stadiumInfo}>
                <Text style={[styles.stadiumName, { color: c.textPrimary }]}>PalaGilardetti</Text>
                <Text style={[styles.stadiumDetail, { color: c.textSecondary }]}>
                  Complesso Sportivo Nedo Betti
                </Text>
                <Text style={[styles.stadiumCap, { color: c.textMuted }]}>
                  Capienza: 500 posti • Parquet in legno
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: c.bgCard, borderColor: c.border }]}
              onPress={() =>
                Linking.openURL(
                  "https://maps.google.com/?q=PalaGilardetti+Castelfiorentino",
                )
              }
              activeOpacity={0.8}
            >
              <Text style={[styles.mapButtonText, { color: c.accent }]}>📍 Apri su Google Maps</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
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
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 24,
  },
  avatarEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  teamLocation: {
    fontSize: 14,
    marginBottom: 14,
  },
  badgeMyTeam: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
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
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  stadiumCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
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
    marginBottom: 2,
  },
  stadiumDetail: {
    fontSize: 13,
    marginBottom: 4,
  },
  stadiumCap: {
    fontSize: 11,
  },
  mapButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
