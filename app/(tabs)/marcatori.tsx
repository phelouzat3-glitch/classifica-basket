import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

type Player = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

const FILTERS = [
  { key: "pointsPerGame" as const, label: "PTS", suffix: "PPG" },
  { key: "reboundsPerGame" as const, label: "RIM", suffix: "RPG" },
  { key: "assistsPerGame" as const, label: "ASS", suffix: "APG" },
];

export default function MarcatoriScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeKey, setActiveKey] = useState<string>("pointsPerGame");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const load = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    fetch(`${API_URL}/players`)
      .then((r) => r.json())
      .then((data: any) => {
        const mapped: Player[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          jerseyNumber: p.jerseyNumber ?? p.jersey_number ?? 0,
          role: p.role,
          pointsPerGame: Number(p.pointsPerGame ?? p.points_per_game ?? 0),
          reboundsPerGame: Number(p.reboundsPerGame ?? p.rebounds_per_game ?? 0),
          assistsPerGame: Number(p.assistsPerGame ?? p.assists_per_game ?? 0),
        }));
        setPlayers(mapped);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const currentFilter = FILTERS.find((f) => f.key === activeKey) ?? FILTERS[0];

  const sorted = [...players].sort((a, b) => {
    const aVal = (a as any)[activeKey] ?? 0;
    const bVal = (b as any)[activeKey] ?? 0;
    return bVal - aVal;
  });

  if (loading && players.length === 0) {
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
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              activeKey === f.key && styles.filterBtnActive,
            ]}
            onPress={() => setActiveKey(f.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterBtnText,
                activeKey === f.key && styles.filterBtnTextActive,
              ]}
            >
              {f.label}
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
            onRefresh={() => load(true)}
            tintColor="#E8600A"
            colors={["#E8600A"]}
          />
        }
        renderItem={({ item, index }) => {
          const pos = index + 1;
          const val = Number((item as any)[activeKey] ?? 0);
          const isTop3 = pos <= 3;
          const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() =>
                router.push(`/player-detail?id=${item.id}` as any)
              }
            >
              <View
                style={[
                  styles.posBadge,
                  isTop3 && { backgroundColor: colors[index] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.posText,
                    isTop3 && { color: colors[index] },
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
                <Text style={styles.statValue}>{val.toFixed(1)}</Text>
                <Text style={styles.statSuffix}>{currentFilter.suffix}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F172A" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#FFFFFF", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, backgroundColor: "#1E293B", paddingVertical: 8, borderRadius: 20, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  filterBtnActive: { backgroundColor: "#E8600A", borderColor: "#E8600A" },
  filterBtnText: { color: "#94A3B8", fontSize: 14, fontWeight: "700" },
  filterBtnTextActive: { color: "#FFFFFF" },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#1E293B", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  rowPressed: { opacity: 0.7 },
  posBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "center", marginRight: 12 },
  posText: { fontSize: 15, fontWeight: "700", color: "#64748B" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  playerMeta: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  statBox: { alignItems: "center", minWidth: 60 },
  statValue: { fontSize: 20, fontWeight: "900", color: "#E8600A" },
  statSuffix: { fontSize: 10, color: "#64748B", fontWeight: "600", marginTop: 1 },
});
