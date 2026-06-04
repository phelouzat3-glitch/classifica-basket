import { API_URL } from "@/src/config/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlayerFromApi = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  photoUrl: string | null;
  height: string;
  age: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

type Player = {
  id: number;
  name: string;
  jerseyNumber: number;
  role: string;
  photoUrl: string | null;
  height: string;
  age: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
};

function mapPlayer(p: PlayerFromApi): Player {
  return {
    id: p.id,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    role: p.role,
    photoUrl: p.photoUrl,
    height: p.height,
    age: p.age,
    gamesPlayed: p.gamesPlayed,
    pointsPerGame: p.pointsPerGame,
    reboundsPerGame: p.reboundsPerGame,
    assistsPerGame: p.assistsPerGame,
  };
}

const ROLE_ORDER: Record<string, number> = {
  Playmaker: 1,
  Guardia: 2,
  "Ala Piccola": 3,
  "Ala Grande": 4,
  Centro: 5,
};

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const aOrder = ROLE_ORDER[a.role] ?? 99;
    const bOrder = ROLE_ORDER[b.role] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99);
  });
}

const ROLE_COLORS: Record<string, string> = {
  Playmaker: "#3B82F6",
  Guardia: "#22C55E",
  "Ala Piccola": "#EAB308",
  "Ala Grande": "#F97316",
  Centro: "#EF4444",
};

export default function RosaScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const fetchPlayers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/players`);
        if (!res.ok) throw new Error(`Errore ${res.status}`);
        const data = (await res.json()) as PlayerFromApi[];
        setPlayers(sortPlayers(data.map(mapPlayer)));
        if (!isRefresh) animateIn();
      } catch (e: any) {
        setError(e.message || "Impossibile connettersi al server");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [animateIn],
  );

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const onRefresh = useCallback(() => fetchPlayers(true), [fetchPlayers]);

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingLabel}>Caricamento rosa…</Text>
        </View>
      </View>
    );
  }

  if (error && players.length === 0) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Errore di caricamento</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Pressable
              onPress={() => fetchPlayers()}
              style={styles.retryBtn}
            >
              <Text style={styles.retryBtnText}>Riprova</Text>
            </Pressable>
          </View>
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

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>ABC Castelfiorentino</Text>
          <View style={styles.headerTitleRow}>
            <Text style={styles.pageTitle}>Rosa</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{players.length} giocatori</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRule} />
      </Animated.View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        renderItem={({ item, index }) => {
          const roleColor = ROLE_COLORS[item.role] ?? COLORS.accent;
          return (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.playerCard,
                  pressed && styles.playerCardPressed,
                ]}
                onPress={() => router.push(`/player-detail?id=${item.id}` as any)}
              >
                <View style={styles.jerseyBadge}>
                  <Text style={styles.jerseyNumber}>
                    {item.jerseyNumber}
                  </Text>
                </View>

                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <View style={styles.playerMeta}>
                    <View
                      style={[
                        styles.rolePill,
                        { backgroundColor: `${roleColor}18`, borderColor: `${roleColor}40` },
                      ]}
                    >
                      <Text style={[styles.roleText, { color: roleColor }]}>
                        {item.role}
                      </Text>
                    </View>
                    {item.height ? (
                      <Text style={styles.metaText}>{item.height}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.statsPreview}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {item.pointsPerGame?.toFixed(1) ?? "0.0"}
                    </Text>
                    <Text style={styles.statLabel}>PPG</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {item.reboundsPerGame?.toFixed(1) ?? "0.0"}
                    </Text>
                    <Text style={styles.statLabel}>RPG</Text>
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const COLORS = {
  bg: "#08090B",
  surface: "#10131A",
  border: "#1C2030",
  borderLight: "#252C3D",
  accent: "#E8600A",
  accentMuted: "rgba(232, 96, 10, 0.12)",
  accentBorder: "rgba(232, 96, 10, 0.25)",
  textPrimary: "#EDF0F7",
  textSecondary: "#6B7492",
  textMuted: "#3E4660",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerTop: {
    marginBottom: 18,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  headerRule: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  countPill: {
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  countText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },

  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  playerCardPressed: {
    opacity: 0.7,
    backgroundColor: "#1A1F2E",
  },

  jerseyBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.accent,
  },

  playerInfo: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  playerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  statsPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    minWidth: 36,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: "300",
    marginLeft: 4,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingLabel: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },

  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(240, 83, 58, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(240, 83, 58, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIcon: {
    color: "#F0533A",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  errorTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  errorBody: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#08090B",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
