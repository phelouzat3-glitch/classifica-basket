import { API_URL } from "@/src/config/api";
import { useColors } from "@/src/theme/ThemeContext";
import { useSeason, useTeamName } from "@/src/context/LeagueContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/src/theme";
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
  const c = useColors();
  const season = useSeason();
  const defaultTeam = useTeamName();

  // Recupera il parametro opzionale (se presente), altrimenti imposta la squadra corrente
  const { teamName } = useLocalSearchParams<{ teamName: string }>();
  const displayTeam = teamName || defaultTeam;

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
        const url = `${API_URL}/standings/analytics?season=${encodeURIComponent(season)}&team=${encodeURIComponent(displayTeam)}`;
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
    [displayTeam, season],
  );

  useEffect(() => {
    fetchTeamAnalytics();
  }, [fetchTeamAnalytics]);

  const onRefresh = useCallback(() => {
    fetchTeamAnalytics(true);
  }, [fetchTeamAnalytics]);

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.mainContainer,
          styles.centerContainer,
          { backgroundColor: c.bg },
        ]}
      >
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: c.bg,
        },
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
          <Text style={[styles.backButtonText, { color: c.accent }]}>
            ← Torna a Statistiche
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
      >
        <View style={styles.titleWrap}>
          <View style={styles.decoratedRow}>
            <View style={[styles.decoLine, { backgroundColor: c.border }]} />
            <Text style={[styles.pageLabel, { color: c.textMuted }]}>ANALISI</Text>
            <View style={[styles.decoLine, { backgroundColor: c.border }]} />
          </View>
          <Text style={[styles.pageTitle, { color: c.textPrimary }]} numberOfLines={1}>
            {displayTeam.toUpperCase()}
          </Text>
        </View>


        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Impossibile aggiornare i dati: {error}
            </Text>
          </View>
        )}

        {/* 1. ATTACCO E DIFESA (DATI REALI) */}
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
          Media Punti a Partita
        </Text>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: c.bgCard, borderColor: c.border },
            ]}
          >
            <Text style={[styles.statValue, { color: c.accent }]}>
              {data?.puntiFattiMedie ?? "0.0"}
            </Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>
              Punti Fatti
            </Text>
          </View>
          <View
            style={[
              styles.statBox,
              { backgroundColor: c.bgCard, borderColor: c.border },
            ]}
          >
            <Text style={[styles.statValue, { color: c.textPrimary }]}>
              {data?.puntiSubitiMedie ?? "0.0"}
            </Text>
            <Text style={[styles.statTitle, { color: c.textSecondary }]}>
              Punti Subiti
            </Text>
          </View>
        </View>

        {/* 2. RENDIMENTO CAMPO (DATI REALI) */}
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
          Fattore Campo
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.bgCard, borderColor: c.border },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>
              🏠 In Casa:
            </Text>
            <Text style={[styles.infoValue, { color: c.textPrimary }]}>
              {data?.recordCasa?.replace(/(\d+)\s*Vittorie\s*\/\s*(\d+)\s*Sconfitte/i, "$1v/$2s") ?? "0v/0s"}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>
              ✈️ In Trasferta:
            </Text>
            <Text style={[styles.infoValue, { color: c.textPrimary }]}>
              {data?.recordTrasferta?.replace(/(\d+)\s*Vittorie\s*\/\s*(\d+)\s*Sconfitte/i, "$1v/$2s") ?? "0v/0s"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 8 },
  backButtonText: { fontSize: 15, fontWeight: "600" },
  scrollContent: { padding: 24, paddingBottom: 40 },
  titleWrap: { alignItems: "center", marginBottom: 24 },
  decoratedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  decoLine: { height: 1, flex: 1 },
  pageLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  pageTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: { fontSize: 24, fontWeight: "800" },
  statTitle: { fontSize: 12, marginTop: 4 },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontWeight: "600", fontSize: 14 },
  divider: { height: 1, marginVertical: 8 },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: { color: "#EF4444", fontSize: 13, textAlign: "center" },
});
