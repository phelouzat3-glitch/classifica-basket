import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ORANGE = "#E8600A";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />

      <View style={styles.topSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Serie C · Girone B</Text>
        </View>
        <Text style={styles.teamName}>ABC Castelfiorentino</Text>
        <Text style={styles.division}>Stagione 2025/26</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.ballContainer}>
          <View style={styles.glowEffect} />
          <Text style={styles.ballEmoji}>🏀</Text>
        </View>
        <Text style={styles.welcome}>Benvenuto</Text>
        <Text style={styles.subtitle}>
          Segui in tempo reale risultati, classifica e statistiche della tua squadra del cuore.
        </Text>
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Classifica aggiornata</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Calendario partite</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Statistiche e marcatori</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Rosa e dettagli giocatori</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <Text style={styles.buttonText}>Entra</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    marginTop: 40,
  },
  badge: {
    backgroundColor: `${ORANGE}18`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${ORANGE}30`,
    marginBottom: 16,
  },
  badgeText: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F1F5F9",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  division: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 4,
  },
  centerSection: {
    alignItems: "center",
  },
  ballContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 16,
  },
  glowEffect: {
    position: "absolute",
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: ORANGE,
    opacity: 0.15,
  },
  ballEmoji: {
    fontSize: 64,
    textAlign: "center",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  features: {
    gap: 12,
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureDot: {
    fontSize: 10,
    color: ORANGE,
  },
  featureText: {
    fontSize: 15,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  bottomSection: {
    paddingBottom: 20,
  },
  button: {
    backgroundColor: ORANGE,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
