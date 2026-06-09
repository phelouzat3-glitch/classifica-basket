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

const COURT_COLOR = "#C8955A";
const LINE_COLOR = "#FFFFFF";

// ─── Route constants ────────────────────────────────────────────────────────
const ROUTES = {
  home: "/(tabs)/home" as const,
} as const;

// ─── Team config ─────────────────────────────────────────────────────────────
const TEAM_CONFIG = {
  name: "ABC Castelfiorentino",
  division: "Serie C · Girone B",
  season: "Stagione 2025/26",
} as const;

const FEATURES = [
  { icon: "🏆", text: "Classifica aggiornata" },
  { icon: "📅", text: "Calendario partite" },
  { icon: "📊", text: "Statistiche e marcatori" },
  { icon: "👥", text: "Rosa e dettagli giocatori" },
] as const;

// ─── Sub-components ──────────────────────────────────────────────────────────
interface FeatureRowProps {
  icon: string;
  text: string;
  textColor: string;
}

function FeatureRow({ icon, text, textColor }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

function BasketballField({ rotate }: { rotate: Animated.AnimatedInterpolation<string> }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldBorder}>
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />
        <View style={[styles.topKey, styles.keyBase]} />
        <View style={[styles.bottomKey, styles.keyBase]} />
        <View style={styles.topFreeThrow} />
        <View style={styles.bottomFreeThrow} />
        <Animated.Text style={[styles.fieldBall, { transform: [{ rotate }] }]}>
          🏀
        </Animated.Text>
      </View>
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
        useNativeDriver: true,
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

        <BasketballField rotate={rotate} />

        <View style={styles.centerSection}>
          <Text style={[styles.welcome, { color: colors.textPrimary }]}>
            Benvenuto
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Segui in tempo reale risultati, classifica e statistiche della tua
            squadra del cuore.
          </Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature) => (
              <FeatureRow
                key={feature.text}
                icon={feature.icon}
                text={feature.text}
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
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
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
  field: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 12,
  },
  fieldBorder: {
    width: 240,
    height: 340,
    backgroundColor: COURT_COLOR,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: LINE_COLOR,
    overflow: "hidden",
    position: "relative",
  },
  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 3,
    backgroundColor: LINE_COLOR,
    marginTop: -1.5,
  },
  centerCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: LINE_COLOR,
    top: "50%",
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
  },
  keyBase: {
    position: "absolute",
    width: 80,
    height: 52,
    borderWidth: 3,
    borderColor: LINE_COLOR,
  },
  topKey: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -40,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  bottomKey: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -40,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  topFreeThrow: {
    position: "absolute",
    top: 52,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 40,
    backgroundColor: LINE_COLOR,
  },
  bottomFreeThrow: {
    position: "absolute",
    bottom: 52,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 40,
    backgroundColor: LINE_COLOR,
  },
  fieldBall: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    fontSize: 36,
  },
  centerSection: {
    alignItems: "center",
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
    maxWidth: 420,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    maxWidth: 360,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexBasis: "45%",
    minWidth: 140,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
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
