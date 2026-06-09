import { useColors } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Route constants ────────────────────────────────────────────────────────
const ROUTES = {
  home: "/(tabs)/home" as const,
} as const;

// ─── Team config ─────────────────────────────────────────────────────────────
// Sposta questi valori in un file di config (es. src/config/team.ts)
// o recuperali da uno store/API per rendere il componente riutilizzabile.
const TEAM_CONFIG = {
  name: "ABC Castelfiorentino",
  division: "Serie C · Girone B",
  season: "Stagione 2025/26",
} as const;

const FEATURES = [
  "Classifica aggiornata",
  "Calendario partite",
  "Statistiche e marcatori",
  "Rosa e dettagli giocatori",
] as const;

// ─── Sub-components ──────────────────────────────────────────────────────────
interface FeatureRowProps {
  text: string;
  dotColor: string;
  textColor: string;
}

function FeatureRow({ text, dotColor, textColor }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.featureDot, { color: dotColor }]}>●</Text>
      <Text style={[styles.featureText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

// ─── Animation hook ──────────────────────────────────────────────────────────
function useSpinAnimation() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      { iterations: -1 },
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return rotate;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const rotate = useSpinAnimation();

  const handleEnter = () => router.replace(ROUTES.home);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.bg },
      ]}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.accent + "18",
                borderColor: colors.accent + "30",
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {TEAM_CONFIG.division}
            </Text>
          </View>
          <Text
            style={[styles.teamName, { color: colors.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {TEAM_CONFIG.name}
          </Text>
          <Text style={[styles.division, { color: colors.textSecondary }]}>
            {TEAM_CONFIG.season}
          </Text>
        </View>

        <View style={styles.centerSection}>
          <Animated.Text
            style={[styles.ballEmoji, { transform: [{ rotate }] }]}
          >
            🏀
          </Animated.Text>
          <Text style={[styles.welcome, { color: colors.textPrimary }]}>
            Benvenuto
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Segui in tempo reale risultati, classifica e statistiche della tua
            squadra del cuore.
          </Text>
          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <FeatureRow
                key={feature}
                text={feature}
                dotColor={colors.accent}
                textColor={colors.textSecondary}
              />
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleEnter}
        >
          <Text style={styles.buttonText}>Entra</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    marginTop: 40,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  division: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  centerSection: {
    alignItems: "center",
  },
  ballEmoji: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 16,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
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
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
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
