import { API_URL } from "@/src/config/api";
import PlayerAvatar from "@/src/components/PlayerAvatar";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/src/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/ThemeContext";

const { width } = Dimensions.get("window");

type PlayerDetail = {
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
  const c = useColors();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoViewer, setPhotoViewer] = useState(false);

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
          { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </View>
    );
  }

  if (error || !player) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: "#EF4444" }]}>{error || "Giocatore non trovato"}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: c.accent }]} onPress={() => router.back()}>
            <Text style={[styles.retryBtnText, { color: "#08090B" }]}>Torna indietro</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const roleColor = ROLE_COLORS[player.role] ?? c.accent;

  const stats = [
    { label: "PTS", value: player.pointsPerGame?.toFixed(1) ?? "0.0", sub: "a partita" },
    { label: "RIM", value: player.reboundsPerGame?.toFixed(1) ?? "0.0", sub: "a partita" },
    { label: "ASS", value: player.assistsPerGame?.toFixed(1) ?? "0.0", sub: "a partita" },
    { label: "GP", value: player.gamesPlayed?.toString() ?? "0", sub: "partite" },
  ];

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: c.accent }]}>← Indietro</Text>
        </Pressable>

        <View style={styles.heroSection}>
          <View style={styles.photoWrap}>
            <Pressable onPress={() => setPhotoViewer(true)}>
              {player.photoUrl ? (
                <Image source={{ uri: player.photoUrl }} style={styles.playerPhoto} contentFit="cover" />
              ) : (
                <PlayerAvatar name={player.name} jerseyNumber={player.jerseyNumber} size={110} fontSize={38} />
              )}
            </Pressable>
            <Text style={[styles.jerseyLabel, { color: c.textMuted }]}>#{player.jerseyNumber}</Text>
          </View>

          <Modal visible={photoViewer} transparent animationType="fade" onRequestClose={() => setPhotoViewer(false)}>
            <Pressable style={styles.photoViewerOverlay} onPress={() => setPhotoViewer(false)}>
              <Pressable onPress={() => {}} style={{ alignItems: "center", gap: 16 }}>
                {player.photoUrl ? (
                  <Image source={{ uri: player.photoUrl }} style={styles.photoViewerImage} contentFit="contain" />
                ) : (
                  <PlayerAvatar name={player.name} jerseyNumber={player.jerseyNumber} size={160} fontSize={56} />
                )}
                <Text style={[styles.photoViewerLabel, { color: "#fff" }]}>
                  {player.name} · #{player.jerseyNumber}
                </Text>
              </Pressable>
            </Pressable>
          </Modal>

          <Text style={[styles.playerName, { color: c.textPrimary }]}>{player.name}</Text>
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
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>Altezza</Text>
                <Text style={[styles.infoValue, { color: c.textPrimary }]}>{player.height}</Text>
              </View>
            ) : null}
            {player.age ? (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: c.textMuted }]}>Età</Text>
                <Text style={[styles.infoValue, { color: c.textPrimary }]}>{player.age} anni</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: c.bgCard, borderColor: c.border }]}>
              <Text style={[styles.statLabel, { color: c.accent }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: c.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statSub, { color: c.textSecondary }]}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.shareBtn, { backgroundColor: c.accent }]}
          onPress={async () => {
            try {
              await Share.share({
                message: `🏀 ${player.name} · #${player.jerseyNumber} · ${player.role}\n📊 PTS: ${player.pointsPerGame?.toFixed(1) ?? "0.0"} | RIM: ${player.reboundsPerGame?.toFixed(1) ?? "0.0"} | ASS: ${player.assistsPerGame?.toFixed(1) ?? "0.0"}\n\n🔗 https://classifica-basket.vercel.app`,
              });
            } catch (e) { console.error(e); }
          }}
        >
          <Text style={[styles.shareBtnText, { color: "#08090B" }]}>Condividi giocatore</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
    fontSize: 15,
    fontWeight: "600",
  },

  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  photoWrap: {
    alignItems: "center",
    gap: 6,
  },
  playerPhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  jerseyLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  playerName: {
    fontSize: 26,
    fontWeight: "800",
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
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
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
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  statSub: {
    fontSize: 11,
    fontWeight: "500",
  },

  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    paddingVertical: 11,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryBtnText: {
    fontWeight: "700",
  },
  shareBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareBtnText: {
    fontWeight: "700",
    fontSize: 15,
  },

  photoViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  photoViewerImage: {
    width: Dimensions.get("window").width - 48,
    height: Dimensions.get("window").height * 0.7,
    borderRadius: 16,
  },
  photoViewerLabel: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
});
