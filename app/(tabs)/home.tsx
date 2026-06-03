import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const RESULTS = [
  { opponent: "Empoli Basketball", date: "1 Giu", score: "82 – 71", win: true },
  { opponent: "Certaldo", date: "25 Mag", score: "69 – 65", win: true },
  { opponent: "Firenze Basket", date: "18 Mag", score: "74 – 80", win: false },
];

export default function HomeTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Benvenuto</Text>
            <Text style={styles.headerTitle}>ABC Castelfiorentino</Text>
          </View>
          <View style={styles.seasonBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.seasonText}>2024/25</Text>
          </View>
        </View>

        {/* Prossima partita */}
        <View style={styles.nextMatchCard}>
          <Text style={styles.sectionLabel}>Prossima partita</Text>
          <View style={styles.matchRow}>
            <View style={styles.teamBlock}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamLogoText}>ABC</Text>
              </View>
              <Text style={styles.teamName}>Castelfiorentino</Text>
            </View>
            <View style={styles.matchCenter}>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.matchDate}>Sab 8 Giu</Text>
              <Text style={styles.matchTime}>18:30</Text>
            </View>
            <View style={styles.teamBlock}>
              <View style={[styles.teamLogo, styles.teamLogoAway]}>
                <Text style={[styles.teamLogoText, { color: "#94A3B8" }]}>
                  OSP
                </Text>
              </View>
              <Text style={styles.teamName}>Ospitante</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Stagione</Text>
            <Text style={styles.statValue}>
              <Text style={styles.statAccent}>12</Text> V — 4 S
            </Text>
            <Text style={styles.statSub}>75% vittorie</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Media punti</Text>
            <Text style={[styles.statValue, styles.statAccent]}>78.4</Text>
            <Text style={styles.statSub}>per partita</Text>
          </View>
        </View>

        {/* Ultimi risultati */}
        <Text style={styles.sectionTitle}>Ultimi risultati</Text>
        {RESULTS.map((r, i) => (
          <View key={i} style={styles.resultRow}>
            <View
              style={[styles.outcomeBadge, r.win ? styles.win : styles.loss]}
            >
              <Text
                style={[
                  styles.outcomeText,
                  r.win ? styles.winText : styles.lossText,
                ]}
              >
                {r.win ? "V" : "S"}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultOpponent}>
                ABC Castelfiorentino vs {r.opponent}
              </Text>
              <Text style={styles.resultMeta}>{r.date} · Serie C</Text>
            </View>
            <Text style={styles.resultScore}>{r.score}</Text>
          </View>
        ))}

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/classifica" as any)}
        >
          <Text style={styles.buttonText}>Vedi classifica completa</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerSub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  seasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(232,96,10,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  seasonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#E8600A",
  },

  // Next match card
  nextMatchCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionLabel: {
    fontSize: 11,
    color: "#64748B",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamBlock: {
    alignItems: "center",
    width: width * 0.28,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(232,96,10,0.18)",
    borderWidth: 0.5,
    borderColor: "rgba(232,96,10,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  teamLogoAway: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  teamLogoText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E8600A",
  },
  teamName: {
    fontSize: 12,
    color: "#CBD5E1",
    textAlign: "center",
    fontWeight: "500",
  },
  matchCenter: {
    alignItems: "center",
  },
  vsText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  matchDate: {
    fontSize: 11,
    color: "#64748B",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E8600A",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.07)",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  statAccent: {
    color: "#E8600A",
  },
  statSub: {
    fontSize: 11,
    color: "#64748B",
  },

  // Results
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  outcomeBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  win: { backgroundColor: "#14532d" },
  loss: { backgroundColor: "#450a0a" },
  outcomeText: { fontSize: 13, fontWeight: "700" },
  winText: { color: "#4ade80" },
  lossText: { color: "#f87171" },
  resultInfo: { flex: 1 },
  resultOpponent: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E2E8F0",
    marginBottom: 2,
  },
  resultMeta: { fontSize: 11, color: "#64748B" },
  resultScore: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Button
  button: {
    backgroundColor: "#E8600A",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#E8600A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
