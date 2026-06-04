import { API_URL } from "@/src/config/api";
import { getTeamLogo } from "@/src/config/teamImages";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MatchFromApi = {
  id: number;
  round: number;
  date: string;
  time: string | null; // 💡 Sécurisé : peut être null
  homeTeam?: string; // 💡 Ajout du format camelCase de NestJS
  home_team?: string;
  awayTeam?: string; // 💡 Ajout du format camelCase de NestJS
  away_team?: string;
  home_score: number | null;
  away_score: number | null;
  is_my_team: boolean;
};

type FilterType = "Tutte" | "Giocate" | "Da giocare";

export default function PartiteScreen() {
  const [matches, setMatches] = useState<MatchFromApi[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchFromApi[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("Tutte");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const applyFilter = (allMatches: MatchFromApi[], filter: FilterType) => {
    if (filter === "Giocate") {
      setFilteredMatches(
        allMatches.filter(
          (m) => m.home_score !== null && m.away_score !== null,
        ),
      );
    } else if (filter === "Da giocare") {
      setFilteredMatches(
        allMatches.filter(
          (m) => m.home_score === null && m.away_score === null,
        ),
      );
    } else {
      setFilteredMatches(allMatches);
    }
  };

  const fetchMatches = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/matches`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MatchFromApi[];
        setMatches(data);
        applyFilter(data, activeFilter);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    applyFilter(matches, filter);
  };

  const onRefresh = useCallback(() => {
    fetchMatches(true);
  }, [fetchMatches]);

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

  if (error && matches.length === 0) {
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
            onPress={() => fetchMatches()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
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
      {/* Intestazione superiore con reindirizzamento sicuro alla Home */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.replace("/statistiche" as any)}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Torna alla Home</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.pageTitle}>Calendario & Risultati</Text>

      {/* Barra dei filtri dinamici */}
      <View style={styles.filterContainer}>
        {(["Tutte", "Giocate", "Da giocare"] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => handleFilterChange(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === filter && styles.activeFilterButtonText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E8600A"
            colors={["#E8600A"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nessuna partita trovata per questa categoria.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPlayed = item.home_score !== null && item.away_score !== null;

          // 💡 Sécurisation des noms de propriétés provenant de NestJS
          const homeName = item.homeTeam || item.home_team || "Squadra Casa";
          const awayName = item.awayTeam || item.away_team || "Squadra Fuori";

          const shareMatch = async () => {
            const dateStr = new Date(item.date).toLocaleDateString("it-IT");
            const timeStr = item.time ? item.time.slice(0, 5) : "";
            const dateLine = `📅 ${dateStr}${timeStr ? " - " + timeStr : ""}`;
            const scoreLine = isPlayed
              ? `${homeName} ${item.home_score} - ${item.away_score} ${awayName}`
              : `${homeName} vs ${awayName}`;
            try {
              await Share.share({
                message: `🏀 ABC Castelfiorentino\n${scoreLine}\n${dateLine}\n\n🔗 https://classifica-basket.vercel.app`,
              });
            } catch {}
          };

          return (
            <View style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.roundText}>GIORNATA {item.round}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString("it-IT")} -{" "}
                  {/* 💡 Sécurisé : évite le crash si le temps est null */}
                  {item.time ? item.time.slice(0, 5) : "--:--"}
                </Text>
              </View>

              <View style={styles.teamsContainer}>
                <View style={styles.teamRow}>
                  <Image
                    source={getTeamLogo(homeName)}
                    style={styles.teamLogo}
                  />
                  <Text
                    style={[
                      styles.teamName,
                      homeName.includes("Castelfiorentino") &&
                        styles.myTeamText,
                    ]}
                    numberOfLines={1}
                  >
                    {homeName}
                  </Text>
                  {isPlayed ? (
                    <Text
                      style={[
                        styles.scoreText,
                        item.home_score! > item.away_score! &&
                          styles.winnerScore,
                      ]}
                    >
                      {item.home_score}
                    </Text>
                  ) : (
                    <Text style={styles.scorePlaceholder}>-</Text>
                  )}
                </View>

                <View style={styles.teamRow}>
                  <Image
                    source={getTeamLogo(awayName)}
                    style={styles.teamLogo}
                  />
                  <Text
                    style={[
                      styles.teamName,
                      awayName.includes("Castelfiorentino") &&
                        styles.myTeamText,
                    ]}
                    numberOfLines={1}
                  >
                    {awayName}
                  </Text>
                  {isPlayed ? (
                    <Text
                      style={[
                        styles.scoreText,
                        item.away_score! > item.home_score! &&
                          styles.winnerScore,
                      ]}
                    >
                      {item.away_score}
                    </Text>
                  ) : (
                    <Text style={styles.scorePlaceholder}>-</Text>
                  )}
                </View>
              </View>

              {homeName.includes("Castelfiorentino") ? (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() =>
                    Linking.openURL(
                      "https://maps.google.com/?q=PalaGilardetti+Castelfiorentino",
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.locationButtonText}>
                    📍 PalaGilardetti - Via Piave, Castelfiorentino
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareMatch}
                activeOpacity={0.7}
              >
                <Text style={styles.shareButtonText}>Condividi</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
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
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  activeFilterButton: {
    backgroundColor: "#E8600A",
    borderColor: "#E8600A",
  },
  filterButtonText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  matchCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 8,
    marginBottom: 12,
  },
  roundText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#E8600A",
  },
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  teamsContainer: {
    gap: 10,
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  teamLogo: { width: 22, height: 22, borderRadius: 11 },
  teamName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
  },
  myTeamText: {
    color: "#FDBA74",
    fontWeight: "800",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94A3B8",
    width: 35,
    textAlign: "right",
  },
  winnerScore: {
    color: "#4CD137",
    fontWeight: "900",
  },
  scorePlaceholder: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    width: 35,
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    color: "#EF4444",
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
  locationButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  locationButtonText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  shareButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#E8600A",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
