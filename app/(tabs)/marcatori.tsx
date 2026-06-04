import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayerFromApi = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

type StatKey = "pointsPerGame" | "reboundsPerGame" | "assistsPerGame";
type Category = { key: StatKey; label: string; suffix: string };

const CATEGORIES: Category[] = [
  { key: "pointsPerGame", label: "PTS", suffix: "PPG" },
  { key: "reboundsPerGame", label: "RIM", suffix: "RPG" },
  { key: "assistsPerGame", label: "ASS", suffix: "APG" },
];

export default function MarcatoriScreen() {
  const [players, setPlayers] = useState<PlayerFromApi[]>([]);
  const [activeCat, setActiveCat] = useState<StatKey>("points_per_game");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchPlayers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/players`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PlayerFromApi[];
      setPlayers(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const sorted = [...players].sort(
    (a, b) => (b[activeCat] ?? 0) - (a[activeCat] ?? 0),
  );

  const currentCat = CATEGORIES.find((c) => c.key === activeCat)!;

  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E8600A" />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Classifica Marcatori</Text>

      <View style={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterBtn,
              activeCat === cat.key && styles.filterBtnActive,
            ]}
            onPress={() => setActiveCat(cat.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterBtnText,
                activeCat === cat.key && styles.filterBtnTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPlayers(true)}
            tintColor="#E8600A"
            colors={["#E8600A"]}
          />
        }
        renderItem={({ item, index }) => {
          const pos = index + 1;
          const value = (item[activeCat] ?? 0).toFixed(1);
          const isTop3 = pos <= 3;
          const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
          const medal = isTop3 ? medalColors[index] : null;

          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() =>
                router.push(`/player-detail?id=${item.id}` as any)
              }
            >
              <View
                style={[
                  styles.posBadge,
                  isTop3 && { backgroundColor: medal + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.posText,
                    isTop3 && { color: medal, fontWeight: "900" },
                  ]}
                >
                  {pos}
                </Text>
              </View>

              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerMeta}>
                  #{item.jerseyNumber} · {item.role}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statSuffix}>{currentCat.suffix}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  filterBtnActive: {
    backgroundColor: "#E8600A",
    borderColor: "#E8600A",
  },
  filterBtnText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "700",
  },
  filterBtnTextActive: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  rowPressed: {
    opacity: 0.7,
  },
  posBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  posText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  playerMeta: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  statBox: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#E8600A",
  },
  statSuffix: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
});
