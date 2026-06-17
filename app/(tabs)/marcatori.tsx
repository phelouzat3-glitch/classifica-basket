import { API_URL } from "@/src/config/api";
import { useSeason } from "@/src/context/LeagueContext";
import { getPlayerInitials, getPlayerColor } from "@/src/config/playerImages";
import PlayerAvatar from "@/src/components/PlayerAvatar";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHorizontalSwipe } from "@/src/hooks/useHorizontalSwipe";
import { useColors } from "@/src/theme/ThemeContext";

type Player = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  photoUrl: string | null;
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

  const c = useColors();
  const { panHandlers } = useHorizontalSwipe();
  const season = useSeason();

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const load = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    fetch(`${API_URL}/players?season=${encodeURIComponent(season)}`)
      .then((r) => r.json())
      .then((data: any) => {
        const mapped: Player[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          jerseyNumber: p.jerseyNumber ?? p.jersey_number ?? 0,
          role: p.role,
          photoUrl: p.photoUrl ?? null,
          pointsPerGame: Number(p.pointsPerGame ?? p.points_per_game ?? 0),
          reboundsPerGame: Number(p.reboundsPerGame ?? p.rebounds_per_game ?? 0),
          assistsPerGame: Number(p.assistsPerGame ?? p.assists_per_game ?? 0),
        }));
        setPlayers(mapped);
        if (!isRefresh) animateIn();
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
          { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: c.bg },
        ]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: c.bg,
        },
      ]}
      {...panHandlers}
    >
      <View style={styles.bgContainer} pointerEvents="none">
        {players.slice(0, 10).map((p, i) => {
          return (
            <Animated.View
              key={p.id}
              style={[
                styles.bgInitial,
                {
                  left: `${10 + (i % 3) * 35}%`,
                  top: `${10 + i * 9}%`,
                  opacity: 0.06 + (i % 3) * 0.02,
                },
              ]}
            >
              <Text style={[styles.bgInitialText, { color: getPlayerColor(p.name) ?? c.accent }]}>
                {getPlayerInitials(p.name)}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      <Text style={[styles.title, { color: c.textPrimary }]}>Classifica Marcatori</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              { backgroundColor: c.bgCard, borderColor: c.border },
              activeKey === f.key && { backgroundColor: c.accent, borderColor: c.accent },
            ]}
            onPress={() => setActiveKey(f.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterBtnText,
                { color: c.textSecondary },
                activeKey === f.key && { color: "#FFFFFF" },
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
            tintColor={c.accent}
            colors={[c.accent]}
          />
        }
        renderItem={({ item, index }) => {
          const pos = index + 1;
          const val = Number((item as any)[activeKey] ?? 0);
          const isTop3 = pos <= 3;
          const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: c.bgCard, borderColor: c.border },
                pressed && styles.rowPressed,
              ]}
              onPress={() =>
                router.push(`/player-detail?id=${item.id}` as any)
              }
            >
              <View
                style={[
                  styles.posBadge,
                  { backgroundColor: c.bg },
                  isTop3 && { backgroundColor: colors[index] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.posText,
                    { color: c.textMuted },
                    isTop3 && { color: colors[index] },
                  ]}
                >
                  {pos}
                </Text>
              </View>
              <View style={{ marginRight: 10 }}>
                <PlayerAvatar name={item.name} jerseyNumber={item.jerseyNumber} />
              </View>
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: c.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.playerMeta, { color: c.textSecondary }]}>
                  #{item.jerseyNumber} · {item.role}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: c.accent }]}>
                  {val.toFixed(1)}
                </Text>
                <Text style={[styles.statSuffix, { color: c.textMuted }]}>
                  {currentFilter.suffix}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  bgInitial: { position: "absolute" },
  bgInitialText: { fontSize: 64, fontWeight: "900", fontFamily: "Arial Black", letterSpacing: -4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center", borderWidth: 1 },
  filterBtnText: { fontSize: 14, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1 },
  rowPressed: { opacity: 0.7 },
  posBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  playerThumbMarc: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  marcJerseyBadge: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, marginRight: 10 },
  marcJerseyText: { fontSize: 14, fontWeight: "900" },
  posText: { fontSize: 15, fontWeight: "700" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: "700" },
  playerMeta: { fontSize: 12, marginTop: 2 },
  statBox: { alignItems: "center", minWidth: 60 },
  statValue: { fontSize: 20, fontWeight: "900" },
  statSuffix: { fontSize: 10, fontWeight: "600", marginTop: 1 },
});
