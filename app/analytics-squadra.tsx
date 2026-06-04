import { API_URL } from "@/src/config/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Struttura dati identica a quella restituita dall'interfaccia NestJS
type AnalyticsData = {
  puntiFattiMedie: string;
  puntiSubitiMedie: string;
  recordCasa: string;
  recordTrasferta: string;
};

export default function AnalyticsSquadraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Recupera il parametro opzionale (se presente), altrimenti imposta Castelfiorentino
  const { teamName } = useLocalSearchParams<{ teamName: string }>();
  const displayTeam = teamName || "Abc Castelfiorentino";

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🌟 FUNZIONE CHIAVE: Chiama la nuova API NestJS in tempo reale
  const fetchTeamAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        // Costruiamo l'URL con i parametri richiesti dal controller NestJS
        const url = `${API_URL}/standings/analytics?season=2025/26&team=${encodeURIComponent(displayTeam)}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AnalyticsData;

        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [displayTeam],
  );

  useEffect(() => {
    fetchTeamAnalytics();
  }, [fetchTeamAnalytics]);

  const onRefresh = useCallback(() => {
    fetchTeamAnalytics(true);
  }, [fetchTeamAnalytics]);

  if (loading && !refreshing) {
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

      {/* Pulsante di ritorno */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Torna a Statistiche</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E8600A"
            colors={["#E8600A"]}
          />
        }
      >
        <Text style={styles.pageTitle}>Analisi {displayTeam}</Text>
        <Text style={styles.pageSubtitle}>
          Statistiche avanzate calcolate in tempo reale dal database.
        </Text>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Impossibile aggiornare i dati: {error}
            </Text>
          </View>
        )}

        {/* 1. ATTACCO E DIFESA (DATI REALI) */}
        <Text style={styles.sectionLabel}>Media Punti a Partita</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.orangeColor]}>
              {data?.puntiFattiMedie ?? "0.0"}
            </Text>
            <Text style={styles.statTitle}>Punti Fatti</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {data?.puntiSubitiMedie ?? "0.0"}
            </Text>
            <Text style={styles.statTitle}>Punti Subiti</Text>
          </View>
        </View>

        {/* 2. RENDIMENTO CAMPO (DATI REALI) */}
        <Text style={styles.sectionLabel}>Fattore Campo</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏠 In Casa:</Text>
            <Text style={styles.infoValue}>
              {data?.recordCasa ?? "0 Vittorie / 0 Sconfitte"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✈️ In Trasferta:</Text>
            <Text style={styles.infoValue}>
              {data?.recordTrasferta ?? "0 Vittorie / 0 Sconfitte"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0F172A" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 8 },
  backButtonText: { color: "#E8600A", fontSize: 15, fontWeight: "600" },
  scrollContent: { padding: 24, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  pageSubtitle: { fontSize: 14, color: "#94A3B8", marginBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statValue: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },
  statTitle: { fontSize: 12, color: "#94A3B8", marginTop: 4 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: { color: "#94A3B8", fontSize: 14 },
  infoValue: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 8 },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: { color: "#EF4444", fontSize: 13, textAlign: "center" },
  orangeColor: { color: "#E8600A" },
});
