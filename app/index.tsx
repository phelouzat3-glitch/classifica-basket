import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/ThemeContext";

const ORANGE = "#E8600A";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const c = useColors();

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

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.bg }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <View style={[styles.badge, { backgroundColor: c.accent + "18", borderColor: c.accent + "30" }]}>
            <Text style={[styles.badgeText, { color: c.accent }]}>Serie C · Girone B</Text>
          </View>
          <Text style={[styles.teamName, { color: c.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>ABC Castelfiorentino</Text>
          <Text style={[styles.division, { color: c.textSecondary }]}>Stagione 2025/26</Text>
        </View>

        <View style={styles.centerSection}>
          <Animated.Text style={[styles.ballEmoji, { transform: [{ rotate: spin }] }]}>🏀</Animated.Text>
          <Text style={[styles.welcome, { color: c.textPrimary }]}>Benvenuto</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Segui in tempo reale risultati, classifica e statistiche della tua squadra del cuore.
          </Text>
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={[styles.featureDot, { color: c.accent }]}>●</Text>
              <Text style={[styles.featureText, { color: c.textSecondary }]}>Classifica aggiornata</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureDot, { color: c.accent }]}>●</Text>
              <Text style={[styles.featureText, { color: c.textSecondary }]}>Calendario partite</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureDot, { color: c.accent }]}>●</Text>
              <Text style={[styles.featureText, { color: c.textSecondary }]}>Statistiche e marcatori</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={[styles.featureDot, { color: c.accent }]}>●</Text>
              <Text style={[styles.featureText, { color: c.textSecondary }]}>Rosa e dettagli giocatori</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <Text style={styles.buttonText}>Entra</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

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
