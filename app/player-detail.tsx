import { API_URL } from "@/src/config/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type PlayerDetail = {
  id: number;
  name: string;
  jersey_number: number;
  role: string;
  photo_url: string | null;
  height: string;
  age: number;
  games_played: number;
  points_per_game: number;
  rebounds_per_game: number;
  assists_per_game: number;
};

const ROLE_COLORS: Record<string, string> = {
  Playmaker: "#3B82F6",
  Guardia: "#22C55E",
  "Ala Piccola": "#EAB308",
  "Ala Grande": "#F97316",
  Centro: "#EF4444",
};

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/players/${id}`);
      if (!res.ok) throw new Error(`Errore ${res.status}`);
      const data = (await res.json()) as PlayerDetail;
      setPlayer(data);
    } catch (e: any) {
      setError(e.message || "Impossibile caricare il giocatore");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

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
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  if (error || !player) {
    return (
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || "Giocatore non trovato"}</Text>
          <Pressable style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Torna indietro</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const roleColor = ROLE_COLORS[player.role] ?? COLORS.accent;

  const stats = [
    { label: "PTS", value: player.points_per_game.toFixed(1), sub: "a partita" },
    { label: "RIM", value: player.rebounds_per_game.toFixed(1), sub: "a partita" },
    { label: "ASS", value: player.assists_per_game.toFixed(1), sub: "a partita" },
    { label: "GP", value: player.games_played.toString(), sub: "partite" },
  ];

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>← Indietro</Text>
        </Pressable>

        <View style={styles.heroSection}>
          <View
            style={[
              styles.bigJersey,
              { backgroundColor: `${roleColor}15`, borderColor: `${roleColor}30` },
            ]}
          >
            <Text style={[styles.bigJerseyText, { color: roleColor }]}>
              {player.jersey_number}
            </Text>
          </View>

          <Text style={styles.playerName}>{player.name}</Text>
          <View
            style={[
              styles.rolePill,
              { backgroundColor: `${roleColor}18`, borderColor: `${roleColor}40` },
            ]}
          >
            <Text style={[styles.rolePillText, { color: roleColor }]}>
              {player.role}
            </Text>
          </View>

          <View style={styles.infoRow}>
            {player.height ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Altezza</Text>
                <Text style={styles.infoValue}>{player.height}</Text>
              </View>
            ) : null}
            {player.age ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Età</Text>
                <Text style={styles.infoValue}>{player.age} anni</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statSub}>{stat.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  textPrimary: "#EDF0F7",
  textSecondary: "#6B7492",
  textMuted: "#3E4660",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  backBtn: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  backBtnText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: "600",
  },

  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  bigJersey: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bigJerseyText: {
    fontSize: 42,
    fontWeight: "900",
  },
  playerName: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 8,
  },
  infoItem: {
    alignItems: "center",
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },
  statCard: {
    width: (width - 54) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
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
  },
});
